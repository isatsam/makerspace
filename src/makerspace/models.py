# https://www.drawdb.app/editor/diagrams/7e1f80e5-a09d-4fd1-8747-4a5fdadb7c8f
#
from makerspace import db, app
from typing import List
from datetime import datetime
from sqlalchemy import Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Member(db.Model):
    __tablename__ = "member"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    is_admin: Mapped[bool] = mapped_column(db.Boolean, default=False)
    first_name: Mapped[str] = mapped_column(db.String(30), unique=False)
    last_name: Mapped[str] = mapped_column(db.String(30), unique=False, nullable=True)
    email: Mapped[str] = mapped_column(db.String(50), unique=True)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=True)
    reservation: Mapped[List["Reservation"]] = relationship() # user can have many reservations
    checkout: Mapped[List["Checkout"]] = relationship()
    ticket: Mapped[List["MaintenanceTicket"]] = relationship()

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.first_name,
            "email": self.email,
            "phone_number": self.phone_number
        }

class EquipmentType(db.Model):
    __tablename__ = "equipment_type"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(30), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(db.String(200), nullable=True)
    equipment: Mapped[List["Equipment"]] = relationship() # 1 type = many equipments

class Equipment(db.Model):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    unique_name: Mapped[str] = mapped_column(db.String(50), unique=True, nullable=True)
    type_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment_type.id"))
    type: Mapped[EquipmentType] = relationship(lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "unique_name": self.unique_name,
            "type_id": self.type_id,
            "type_name": self.type.name
        }

class ConsumableUnit(db.Model):
    __tablename__ = "consumable_unit"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=True)
    consumable: Mapped[List["Consumable"]] = relationship() # 1 unit = many consumables

class Consumable(db.Model):
    __tablename__ = "consumable"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=True)
    unit_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("consumable_unit.id"))
    stock: Mapped[int] = mapped_column(db.Integer, default=0)
    low_stock_alert: Mapped[int] = mapped_column(db.Integer, default=0)

# see https://flask-sqlalchemy.readthedocs.io/en/stable/models/#defining-tables
# Manually creating a table for a many-to-many relationship between
# Consumable and Equipment
consumable_equipment_m2m = db.Table(
    "consumable_equipment",
    Column("consumable_id", db.ForeignKey(Consumable.id), primary_key=True),
    Column("equipment_id", db.ForeignKey(Equipment.id), primary_key=True)
)

class Reservation(db.Model):
    __tablename__ = "reservation"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment.id"))
    member_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("member.id"))
    start_time: Mapped[datetime] = mapped_column(db.DateTime)
    end_time: Mapped[datetime] = mapped_column(db.DateTime)

class CheckoutStatus(db.Model):
    __tablename__ = "checkout_status"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)
    checkout: Mapped[List["Checkout"]] = relationship() # 1 status = many checkouts

class Checkout(db.Model):
    __tablename__ = "checkout"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment.id"))
    member_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("member.id"))
    status_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("checkout_status.id"))
    start_time: Mapped[datetime] = mapped_column(db.DateTime)
    end_time: Mapped[datetime] = mapped_column(db.DateTime)

class TicketStatus(db.Model):
    __tablename__ = "ticket_status"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)
    ticket: Mapped[List["MaintenanceTicket"]] = relationship() # 1 status = many relationships

class MaintenanceTicket(db.Model):
    __tablename__ = "maintenance_ticket"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    status_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("ticket_status.id"))
    member_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("member.id"))
    equipment_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment.id"))
    creation_time: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.now)

# note: doesnt handle migrations
with app.app_context():
    db.create_all()
