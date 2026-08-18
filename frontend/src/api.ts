// Typed client for the Flask API (src/makerspace/api.py).
//
// All endpoints live under /api. In development the Vite proxy forwards
// /api to the Flask server on :5000 (see vite.config.ts), so browser
// fetches stay same-origin and the member_id cookie is sent along.
import type {
  Equipment,
  Reservation,
  Checkout,
  ReservationPayload,
} from "./types";

const API_BASE = "/api";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json())?.message ?? detail;
    } catch {
      // response may not be JSON; fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// GET /api/equipment — anon GET allowed, so this works for any visitor.
export function fetchEquipment(): Promise<Equipment[]> {
  return request<Equipment[]>("/equipment");
}

// GET /api/reservation — GroupAPI.get filters to the current member's
// reservations for non-admins (so this returns "my reservations").
export function fetchReservations(): Promise<Reservation[]> {
  return request<Reservation[]>("/reservation");
}

// GET /api/checkout — GroupAPI.get filters to the current member's
// checkouts for non-admins (so this returns "my checkouts").
export function fetchCheckouts(): Promise<Checkout[]> {
  return request<Checkout[]>("/checkout");
}

// POST /api/reservation — members are allowed to post their own reservations
// (ReservationGroupAPI.member_post_allowed). Returns the created reservation.
export function createReservation(
  payload: ReservationPayload
): Promise<Reservation> {
  return request<Reservation>("/reservation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { ApiError };
