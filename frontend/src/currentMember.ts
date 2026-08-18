import { members } from "./data";
import type { Member } from "./types";

// The cookie name that get_current_member() in the Flask API reads.
export const MEMBER_ID_COOKIE = "member_id";

// Reads the `member_id` cookie set by the member switcher in the header.
// Returns the matching hard-coded member, or the default (Gus) if none is
// set / unknown. This mirrors the naive auth flow: the cookie is the only
// signal the API uses to identify the "logged in" member.
export function getCurrentMember(): Member {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${MEMBER_ID_COOKIE}=`))
    ?.split("=")[1];

  if (cookieValue !== undefined) {
    const id = Number(cookieValue);
    const found = members.find((m) => m.id === id);
    if (found) return found;
  }
  // Default to Gus when no/unknown member is selected.
  return members.find((m) => m.id === 5) ?? members[0];
}

// Sets the `member_id` cookie. `path=/` so it is sent for all routes,
// including API calls under /api/*.
export function setCurrentMemberCookie(id: number): void {
  document.cookie = `${MEMBER_ID_COOKIE}=${id}; path=/`;
}
