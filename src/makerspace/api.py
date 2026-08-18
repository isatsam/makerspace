from . import models
from makerspace import db, app, ModelBase # Modelbase imported for typing
from typing import List, Type
from flask import abort, jsonify, request
from flask.views import MethodView
from typing import Any
from sqlalchemy.orm import DeclarativeBase

#
# Helper functions
#
def get_current_member() -> Any|None:
    """
        Get the current Member model object from `request.cookies`
    """
    member_id = request.cookies.get("member_id")
    if member_id:
        result = db.session.execute(
            db.select(models.Member)
            .where(models.Member.id == member_id)
        ).scalar_one() # same as .scalar().one(), and, in this case, scalar().first()
        return result
    return None

#
# Generic views that we can use for all others
# Based on example code from: https://flask.palletsprojects.com/en/stable/views/
#
# ItemAPI: for /api/someitem/id (i.e. /api/equipment/1)
class ItemAPI(MethodView):
    """
        A class for retrieving, modifying, and deleting individual objects. Is
        inherited by subclasses responsible for API endpoints of type /api/something/<id>
        (i.e. /api/equipment/1)

        Attributes:
            anon_get_allowed (bool): Whether logged-out users are allowed to \
perform GET methods (i.e. view items). Default is False
            member_edit_allowed (bool): Whether members are allowed to perform \
PATCH methods on objects that belong to them. Default is False
    """
    init_every_request = False
    model = None
    anon_get_allowed = False
    member_edit_allowed = False
    _immutable_fields: set[str] = {"id"}

    def _get_item(self, id) -> Any:
        return self.model.query.get_or_404(id)

    def delete(self, id=None):
        member = get_current_member()
        if member is None or not member.is_admin:
            abort(403)

        item = self._get_item(id)
        try:
            db.session.delete(item)
            db.session.commit()
        except db.IntegrityError as err:
            # ORM-side implementation of "ondelete=cascade"
            db.session.rollback()
            abort(409, f"Cannot delete: referenced by other records. {err.orig}")

        db.session.delete(item)

    def get(self, id=None):
        item = self._get_item(id)
        member = get_current_member()

        if member is None:
            if self.anon_get_allowed:
                return jsonify(item.to_dict())
            else:
                abort(403)

        if member.is_admin:
            return jsonify(item.to_dict())

        try: # if item has .member_id field
            if item.member_id == member.id:
                return jsonify(item.to_dict())
            else:
                abort(403)
        except AttributeError: # if item does not have .member_id field
            return jsonify(item.to_dict())

    def patch(self, id=None) -> Any:
        # All members can edit their own checkouts
        member = get_current_member()
        if member is None:
            abort(403)

        item = self._get_item(id)
        if not member.is_admin and not \
        (self.member_edit_allowed and member.id == item.member_id):
            abort(403)

        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not data:
            abort(400, "PATCH body must be a non-empty JSON object")
        # apply changes from the sent JSON
        for field, value in data.items():
            if field in self._immutable_fields:
                abort(400, f"Cannot change field {field}")
            if not hasattr(item, field): # gentle handling of unknown columns (400 not 500)
                abort(400, f"Unknown field '{field}'")
            setattr(item, field, value)
        db.session.commit()
        return jsonify(item.to_dict())

    def post(self, id=None):
        abort(405)

    def put(self, id=None):
        # Put is universally admin-only
        member = get_current_member()
        if member is None or not member.is_admin:
            abort(403)

        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not data:
            abort(400, "PATCH body must be a non-empty JSON object")

        item = self._get_item(id)
        for field, value in data.items():
            if field in self._immutable_fields:
                abort(400, f"Cannot change field {field}")
            if not hasattr(item, field):
                abort(400, f"Unknown field '{field}'")
            setattr(item, field, value)
        db.session.commit()
        return jsonify(item.to_dict())


class GroupAPI(MethodView):
    """
        A class for retrieving a list of all objects of a model, as well as creating new \
objects in a model. It is inherited by subclasses responsible for API endpoints \
of type /api/something (i.e. /api/equipment).

        Attributes:
            anon_get_allowed (bool): Whether logged-out users are allowed to \
perform GET methods (i.e. lists of view items). Default is False
            member_edit_allowed (bool): Whether members are allowed to perform \
POST methods to create new objects. Default is False
    """
    init_every_request = False
    model: Type[ModelBase] | None = None
    anon_get_allowed = False
    member_post_allowed = False
    _immutable_fields: set[str] = {"id"}

    def __init__(self):
        """
        Initiate GroupAPI
        """

    def get(self):
        member = get_current_member()
        items = self.model.query.all()

        if member is None:
            if self.anon_get_allowed:
                return jsonify([item.to_dict() for item in items])
            else:
                abort(403)
        elif member.is_admin:
            return jsonify([item.to_dict() for item in items])
        else: # return items that belong to the current user
            items = self.model.query.filter_by(member_id=member.id).all()
            return jsonify([item.to_dict() for item in items])

    def post(self):
        member = get_current_member()
        if member is None or \
        (not self.member_post_allowed and not member.is_admin):
            abort(403)

        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not data:
            abort(400, "Request body must be a non-empty JSON object")

        blocked = self._immutable_fields & data.keys()
        if blocked:
            abort(400, f"Trying to set immutable fields: {', '.join(sorted(blocked))}")

        try:
            item = self.model.from_json(data)
        except (KeyError, TypeError, ValueError) as err:
            # KeyError = missing required field
            # TypeError = wrong type for a constructor argument
            # ValueError = bad datetime / out-of-range
            abort(400, f"Bad data: {err}")

        db.session.add(item)

        # careful commit
        try:
            db.session.commit()
        except db.IntegrityError as err:
            db.session.rollback()
            abort(400, f"Error writing to the database, rolled back: {err.orig}")
        except db.DataError as err:
            db.session.rollback()
            abort(400, f"Bad data, rolled back: {err.orig}")

        return jsonify(item.to_dict()), 201 # 201 HTTP Created

    # methods not allowed:
    def put(self):
        abort(405)

    def patch(self):
        abort(405)

    def delete(self):
        abort(405)


class EquipmentGroupAPI(GroupAPI):          # `/api/equipment`
    view_name = "equipment-group"
    model = models.Equipment
    anon_get_allowed = True

class EquipmentItemAPI(ItemAPI):            # `/api/equipment/1`
    view_name = "equipment-item"
    model = models.Equipment
    anon_get_allowed = True

class ReservationGroupAPI(GroupAPI):        # `/api/reservation`
    view_name = "reservation-group"
    model = models.Reservation
    _immutable_fields = {"id", "member_id"}

class ReservationItemAPI(ItemAPI):          # `/api/reservation/1`
    view_name = "reservation-item"
    model = models.Reservation
    _immutable_fields = {"id", "member_id"}

class CheckoutGroupAPI(GroupAPI):           # `/api/checkout`
    view_name = "checkout-group"
    model = models.Checkout

class CheckoutItemAPI(ItemAPI):             # `/api/checkout/1`
    view_name = "checkout-item"
    model = models.Checkout
    _immutable_fields = {"id", "member_id", "equipment_id"}

class ConsumableGroupAPI(GroupAPI):         # `/api/consumable`
    view_name = "consumable-group"
    model = models.Consumable
    _immutable_fields = {"id", "member_id", "equipment_id"}

class ConsumableItemAPI(ItemAPI):           # /api/consumable/1
    view_name = "consumable-item"
    model = models.Consumable

class MaintenanceTicketGroupAPI(GroupAPI):  # /api/maintenance
    view_name = "maintenance-group"
    model = models.MaintenanceTicket
    _immutable_fields = {"id", "member_id", "creation_time"}

class MaintenanceTicketItemAPI(ItemAPI):    # /api/maintenance
    view_name = "maintenance-item"
    model = models.MaintenanceTicket
    _immutable_fields = {"id", "member_id", "creation_time"}

class MemberGroupAPI(GroupAPI):             # /api/member
    view_name = "member-group"
    model = models.Member
    def get(self):
        # Override GroupAPI.get to only allow admins to view the list of members
        member = get_current_member()
        items = self.model.query.all()

        if member is not None and member.is_admin:
            return jsonify([item.to_dict() for item in items])
        else:
            abort(403)

class MemberItemAPI(ItemAPI):               # /api/member/1
    view_name = "member-item"
    model = models.Member
    _immutable_fields = {"id", "is_admin"}

#
# Finalise API by setting up routing
#
def register_api(app):

    # set up /api/someitem/1 type routes
    for cl in [
        EquipmentItemAPI, ReservationItemAPI, CheckoutItemAPI,
        ConsumableItemAPI, MaintenanceTicketItemAPI, MemberItemAPI,
    ]:
        item_view = cl.as_view(cl.view_name)
        app.add_url_rule(f"/api/{cl.view_name[:cl.view_name.rfind("-")]}/<int:id>",
            view_func=item_view)

    # set up /api/someitem type routes
    for cl in [
        EquipmentGroupAPI, ReservationGroupAPI, CheckoutGroupAPI,
        ConsumableGroupAPI, MaintenanceTicketGroupAPI, MemberGroupAPI,
    ]:
        group_view = cl.as_view(cl.view_name)
        app.add_url_rule(f"/api/{cl.view_name[:cl.view_name.rfind("-")]}",
            view_func=group_view)

register_api(app=app)
