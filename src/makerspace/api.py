import models
from makerspace import db
from flask import abort, jsonify, request
from flask.views import MethodView
from typing import Any

#
# Helper functions
#
def get_current_member() -> Any|None:
    '''
        Get the current Member model object from `request.cookies`
    '''
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
    init_every_request = False

    def __init__(self, model):
        self.model = model

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

        if member is not None and member.is_admin:
            return jsonify(item.to_json())

        try: # if item has .member_id field
            if member is not None and item.member_id == member.id:
                return jsonify(item.to_json())
            else:
                abort(403)
        except AttributeError: # if item does not have .member_id field
            return jsonify(item.to_json())

    def patch(self, id=None):
        raise NotImplemented # needs to be implemented in every view that inherits ItemAPI

    def post(self, id=None):
        abort(405)

    def put(self, id=None):
        member = get_current_member()
        if member is not None and member.is_admin:
            pass # TODO: maybe we need to move this to the views that inherit ItemAPI?
        else:
            abort(403)


def generate_validator(model, create):
    pass # TEMP
class GroupAPI(MethodView):
    init_every_request = False

    def __init__(self, model):
        self.model = model

        # TODO: Validators validate a form before it's committed to
        # the database. We don't have a validator... Wtf do we do?
        # Just ignore it? Maybe just try-except it if the DB complains
        # when we commit a model?
        self.validator = generate_validator(model, create=True)

    def get(self):
        items = self.model.query.all()
        return jsonify([item.to_json() for item in items])

    def post(self):
        #errors = self.validator.validate(request.json)
        #if errors:
        #    return jsonify(errors), 400

        item = self.model.from_json(request.json)
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_json())


# /api/equipment
#   inherits from GoupAPI
#   GET: return a list of all (member: OK, admin: OK)
#   POST: create a new equipment (member: 403, admin: OK)
#   PUT/PATCH/DELETE: not allowed (member: 405, admin: 405)

# /api/equipment/1
#   inherits from ItemAPI
#   GET: return the equipment piece with id 1 (member: OK, admin: OK)
#   POST: not allowed (member: 405, admin: 405)
#   PUT: update all fields (member: 403, admin: OK)
#   PATCH: update specific fields (member: 403, admin: OK)
#   DELETE: remove specific equipment (member: 403, admin: OK)

# /api/reservation
#   same with /equipment

# /api/reservation/1
#   MEMBER ONLY OK IF THE RESERVATION BELONGS TO THEM!!!
#   GET: return the reservation with id 1 (member: OK, admin: OK)
#   POST: not allowed (member: 405, admin: 405)
#   PUT: update all fields (member: 403, admin: OK)
#   PATCH: update specific fields (member: OK, admin: OK)
#   DELETE: remove specific reservation (member: OK, admin: OK)

# /api/checkout
#   GET: return the list of all checkouts
#       (member: only checkouts that belong to them; admin: all checkouts)
#   POST: create a new checkout (member can only make a checkout that
#       belongs to them, admin can freely set the member field)
#   PUT/PATCH/DELETE: not allowed (member: 405, admin: 405)

# /api/checkout/1
#   MEMBER ONLY OK IF THE CHECKOUT BELONGS TO THEM!!
#   GET: return checkout with id 1 (member: OK, admin: OK)
#   POST: not allowed (405)
#   PUT: update all fields (members: 403, admin: OK)
#   PATCH: update some fields (members: OK, admin: OK)
#   DELETE: remove specific checkout record (members: 403, admin: OK)

# /api/consumable
#   GET: return list of consumables
#   POST: create a new consumable
#   PUT/PATCH/DELETE: not allowed (405)

# /api/consumable/1
#   GET: data of one consumable
#   POST: not allowed (405)
#   PUT: update whole consumable (member: 403, admin: OK)
#   PATCH: update speciifc fields (member: OK, admin: OK)
#   DELETE: remove consumable (member: 403, admin: OK)

# /api/maintenance
#   GET: just basically the same as above you can figure it out
#   POST:
#   PUT/PATCH/DELETE:

# /api/maintenance/1
#   GET:
#   POST:
#   PUT:
#   PATCH:
#   DELETE:

# /api/member
#   GET: get all members (admins: OK, members: 403)
#   POST: create a new member (admins: OK, members: 403 - for now?)
#   PUT/PATCH/DELETE: not allowed 405

# /api/member/1
#   GET: get member's data by ID 1 (admins: OK, members: only if getting own data)
#   POST: not allowed (405)
#   PUT: update whole member (admins: OK, members: 403)
#   PATCH: update some fields (admins: OK, members: OK)
#   DELETE: delete member's account (admins: OK, members: 403 for now? same as POST /api/member)
