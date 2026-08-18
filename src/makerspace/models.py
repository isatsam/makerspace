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
    last_name: Mapped[str | None] = mapped_column(db.String(30), unique=False, nullable=True)
    email: Mapped[str] = mapped_column(db.String(50), unique=True)
    phone_number: Mapped[str] = mapped_column(db.String(20), unique=True)
    reservation: Mapped[List["Reservation"]] = relationship() # user can have many reservations
    checkout: Mapped[List["Checkout"]] = relationship()
    ticket: Mapped[List["MaintenanceTicket"]] = relationship()

    def __init__(self, *, first_name: str, email: str, phone_number: str, last_name: str | None = None):
        # Boilerplate for @classmethod functions
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone_number = phone_number
        # id and is_admin handled by sqlalchemy

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone_number": self.phone_number
        }

    @classmethod
    def from_json(cls, data):
        return cls(
            first_name=data["first_name"],
            last_name=data.get("last_name"),
            email=data["email"],
            phone_number=data["phone_number"],
        )

# see https://flask-sqlalchemy.readthedocs.io/en/stable/models/#defining-tables
# Manually creating a table for a many-to-many relationship between
# Consumable and Equipment
# 1. Define association table FIRST (using string table names)
consumable_equipment_m2m = db.Table(
    "consumable_equipment",
    Column("consumable_id", db.Integer, db.ForeignKey("consumable.id"), primary_key=True),
    Column("equipment_id", db.Integer, db.ForeignKey("equipment.id"), primary_key=True)
)


class EquipmentType(db.Model):
    __tablename__ = "equipment_type"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(30), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(db.String(200), nullable=True)
    equipment: Mapped[List["Equipment"]] = relationship() # 1 type = many equipments

class Equipment(db.Model):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    unique_name: Mapped[str | None] = mapped_column(db.String(50), unique=True, nullable=True)
    type_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment_type.id"))
    type: Mapped[EquipmentType] = relationship(lazy="joined")
    consumables = relationship("Consumable", secondary=consumable_equipment_m2m, back_populates="equipments")

    def __init__(self, *, type_id: int, unique_name: str | None = "") -> None:
        self.unique_name = unique_name
        self.type_id = type_id

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "unique_name": self.unique_name,
            "type_id": self.type_id,
            "type_name": self.type.name,
        }

    @classmethod
    def from_json(cls, data: dict) -> "Equipment":
        return cls(
            unique_name=data.get("unique_name"),
            type_id=data["type_id"],
        )

class ConsumableUnit(db.Model):
    __tablename__ = "consumable_unit"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True, nullable=True)
    consumable: Mapped[List["Consumable"]] = relationship() # 1 unit = many consumables

class Consumable(db.Model):
    __tablename__ = "consumable"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(db.String(20), unique=True, nullable=True) # nullable=True is not right but we don't support migrations rn
    unit_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("consumable_unit.id"))
    stock: Mapped[int] = mapped_column(db.Integer, default=0)
    low_stock_alert: Mapped[int] = mapped_column(db.Integer, default=0)
    equipments = relationship("Equipment", secondary=consumable_equipment_m2m, back_populates="consumables")

    def __init__(self, *, unit_id: int, name: str | None = None, stock: int = 0,
        low_stock_alert: int = 0) -> None:
        self.name = name
        self.unit_id = unit_id
        self.stock = stock
        self.low_stock_alert = low_stock_alert

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "unit_id": self.unit_id,
            "stock": self.stock,
            "low_stock_alert": self.low_stock_alert,
        }

    @classmethod
    def from_json(cls, data: dict) -> "Consumable":
        return cls(
            name=data.get("name"),
            unit_id=data["unit_id"],
            stock=data.get("stock", 0),
            low_stock_alert=data.get("low_stock_alert", 0),
        )


class Reservation(db.Model):
    __tablename__ = "reservation"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    equipment_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("equipment.id"))
    member_id: Mapped[int] = mapped_column(db.Integer, db.ForeignKey("member.id"))
    start_time: Mapped[datetime] = mapped_column(db.DateTime)
    end_time: Mapped[datetime] = mapped_column(db.DateTime)

    def __init__(self, *, equipment_id: int, member_id: int, start_time: datetime, end_time: datetime) -> None:
        self.equipment_id = equipment_id
        self.member_id = member_id
        self.start_time = start_time
        self.end_time = end_time

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "equipment_id": self.equipment_id,
            "member_id": self.member_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
        }

    @classmethod
    def from_json(cls, data: dict) -> "Reservation":
        return cls(
            equipment_id=data["equipment_id"],
            member_id=data["member_id"],
            start_time=datetime.fromisoformat(data["start_time"]),
            end_time=datetime.fromisoformat(data["end_time"]),
        )


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

    def __init__(self, *, equipment_id: int, member_id: int, status_id: int,
        start_time: datetime, end_time: datetime) -> None:
        self.equipment_id = equipment_id
        self.member_id = member_id
        self.status_id = status_id
        self.start_time = start_time
        self.end_time = end_time

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "equipment_id": self.equipment_id,
            "member_id": self.member_id,
            "status_id": self.status_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
        }

    @classmethod
    def from_json(cls, data: dict) -> "Checkout":
        return cls(
            equipment_id=data["equipment_id"],
            member_id=data["member_id"],
            status_id=data["status_id"],
            start_time=datetime.fromisoformat(data["start_time"]),
            end_time=datetime.fromisoformat(data["end_time"]),
        )

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

    def __init__(self, *, status_id: int, member_id: int, equipment_id: int) -> None:
        self.status_id = status_id
        self.member_id = member_id
        self.equipment_id = equipment_id

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "status_id": self.status_id,
            "member_id": self.member_id,
            "equipment_id": self.equipment_id,
            "creation_time": self.creation_time.isoformat(),
        }

    @classmethod
    def from_json(cls, data: dict) -> "MaintenanceTicket":
        return cls(
            status_id=data["status_id"],
            member_id=data["member_id"],
            equipment_id=data["equipment_id"],
        )

# note: doesnt handle migrations
with app.app_context():
    db.create_all()
