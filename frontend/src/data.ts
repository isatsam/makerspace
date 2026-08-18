// Hard-coded list of members we can "log in" as for local development.
//
// The member_id cookie (read by get_current_member() in the Flask API) is
// set to the selected member's id. This list is intentionally hard-coded:
// the /api/member list endpoint is admin-only, and during local prototyping
// we want a guaranteed-known set of switchable identities regardless of
// what's currently in the database.
import type { Member } from "./types.ts";

export const members: Member[] = [
  {
    id: 1,
    is_admin: true,
    first_name: "Jane",
    last_name: "Turing",
    email: "jane.doe@purdue.edu",
    phone_number: "081 123 0202",
  },
  {
    id: 5,
    is_admin: false,
    first_name: "Gus",
    last_name: "Eiffel",
    email: "gus.eiffel@students.purdue.edu",
    phone_number: "081 734 2138",
  },
];

// Default current member (Gus). Can be overridden at runtime via the
// member switcher in the header, which sets the `member_id` cookie.
export const member: Member = members[1];
