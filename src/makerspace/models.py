from sqlalchemy.sql.sqltypes import VARCHAR

from makerspace import db, app
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class Member(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False)
    first_name: Mapped[str] = mapped_column(String(30), unique=False, nullable=False)
    last_name: Mapped[str] = mapped_column(String(30), unique=False, nullable=True)
    email: Mapped[str] = mapped_column(String(50), unique=True, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "is_admin": self.is_admin,
            "first_name": self.first_name,
            "last_name": self.first_name,
            "email": self.email,
            "phone_number": self.phone_number
        }

# note: doesnt handle migrations
with app.app_context():
    db.create_all()
