import database as db
from flask import Flask


# /api/equipment
#   GET: return a list of all (member: OK, admin: OK)
#   POST: create a new equipment (member: 403, admin: OK)
#   PUT/PATCH/DELETE: not allowed (member: 405, admin: 405)

# /api/equipment/1
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
