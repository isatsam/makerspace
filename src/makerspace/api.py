import models
from makerspace import db
from flask import abort, jsonify, request
from flask.views import MethodView
from typing import Any

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
            .where(id == member_id)
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

    def _get_item(self, id) -> Any:
        return self.model.query.get_or_404(id)

    def delete(self, id=None):
        item = self._get_item(id)
        member = get_current_member()
        if member is None or not member.is_admin:
            abort(403)
        # TODO: do something if member is admin

    def get(self, id=None):
        item = self._get_item(id)
        member = get_current_member()

        if member is None:
            if self.anon_get_allowed:
                return jsonify(item.to_json())
            else:
                abort(403)

        if member.is_admin:
            return jsonify(item.to_json())

        try: # if item has .member_id field
            if item.member_id == member.id:
                return jsonify(item.to_json())
            else:
                abort(403)
        except AttributeError: # if item does not have .member_id field
            return jsonify(item.to_json())

    def patch(self, id=None) -> Any:
        # All members can edit their own checkouts
        member = get_current_member()
        if member is None:
            abort(403)

        if member.is_admin or \
        (self.member_edit_allowed and member.id == id):
            item = self._get_item(id) # TODO
        else:
            abort(403)

    def post(self, id=None):
        abort(405)

    def put(self, id=None):
        # Put is universally admin-only
        member = get_current_member()
        if member is not None and member.is_admin:
            pass # TODO: maybe we need to move this to the views that inherit ItemAPI?
        else:
            abort(403)


def generate_validator(model, create):
    pass # TEMP
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
    model = None
    anon_get_allowed = False
    member_post_allowed = False

    def __init__(self, model):
        """
        Initiate GroupAPI
        """
        self.model = model

        # TODO: Validators validate a form before it's committed to
        # the database. We don't have a validator... Wtf do we do?
        # Just ignore it? Maybe just try-except it if the DB complains
        # when we commit a model?
        self.validator = generate_validator(model, create=True)

    def get(self):
        member = get_current_member()
        items = self.model.query.all()

        if member is None:
            if self.anon_get_allowed:
                return jsonify([item.to_json() for item in items])
            else:
                abort(403)
        elif member.is_admin:
            return jsonify([item.to_json() for item in items])
        else: # return items that belong to the current user
            items = items.filter_by(member_id=member.id)

    def post(self):
        #errors = self.validator.validate(request.json)
        #if errors:
        #    return jsonify(errors), 400

        item = self.model.from_json(request.json)
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_json())

    # methods not allowed:
    def put(self):
        abort(405)

    def patch(self):
        abort(405)

    def delete(self):
        abort(405)


class EquipmentGroupAPI(GroupAPI):          # `/api/equipment`
    model = models.Equipment
    anon_get_allowed = True

class EquipmentItemAPI(ItemAPI):            # `/api/equipment/1`
    model = models.Equipment
    anon_get_allowed = True

class ReservationGroupAPI(GroupAPI):        # `/api/reservation`
    model = models.Reservation

class ReservationItemAPI(ItemAPI):          # `/api/reservation/1`
    model = models.Reservation

class CheckoutGroupAPI(GroupAPI):           # `/api/checkout`
    model = models.Checkout

class CheckoutItemAPI(ItemAPI):             # `/api/checkout/1`
    model = models.Checkout

class ConsumableGroupAPI(GroupAPI):         # `/api/consumable`
    model = models.Consumable

class ConsumableItemAPI(ItemAPI):           # /api/consumable/1
    model = models.Consumable

class MaintenanceTicketGroupAPI(GroupAPI):  # /api/maintenance
    model = models.MaintenanceTicket

class MaintenanceTicketItemAPI(ItemAPI):    # /api/maintenance
    model = models.MaintenanceTicket

class MemberGroupAPI(GroupAPI):             # /api/member
    model = models.Member
    def get(self):
        # Override GroupAPI.get to only allow admins to view the list of members
        member = get_current_member()
        items = self.model.query.all()

        if member is not None and member.is_admin:
            return jsonify([item.to_json() for item in items])
        else:
            abort(403)

class MemberItemAPI(ItemAPI):               # /api/member/1
    model = models.Member
