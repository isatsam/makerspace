// Typed client for the Flask API (src/makerspace/api.py).
//
// All endpoints live under /api. In development the Vite proxy forwards
// /api to the Flask server on :5000 (see vite.config.ts), so browser
// fetches stay same-origin and the member_id cookie is sent along.
import type {
  Equipment,
  Reservation,
  Checkout,
  CheckoutStatus,
  Consumable,
  MaintenanceTicket,
  Member,
  EquipmentType,
  ConsumableUnit,
  TicketStatus,
  ReservationPayload,
  CheckoutPayload,
} from "./types";

const API_BASE = "/api";

export class ApiError extends Error {
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

// ----- Specific typed helpers for the current member's data -----

export function fetchEquipment(): Promise<Equipment[]> {
  return request<Equipment[]>("/equipment");
}

export function fetchReservations(): Promise<Reservation[]> {
  return request<Reservation[]>("/reservation");
}

export function fetchCheckouts(): Promise<Checkout[]> {
  return request<Checkout[]>("/checkout");
}

export function fetchCheckoutStatuses(): Promise<CheckoutStatus[]> {
  return request<CheckoutStatus[]>("/checkout_statuses");
}

export function fetchEquipmentTypes(): Promise<EquipmentType[]> {
  return request<EquipmentType[]>("/equipment_type");
}

export function fetchConsumableUnits(): Promise<ConsumableUnit[]> {
  return request<ConsumableUnit[]>("/consumable_unit");
}

export function fetchTicketStatuses(): Promise<TicketStatus[]> {
  return request<TicketStatus[]>("/ticket_status");
}

export function fetchConsumables(): Promise<Consumable[]> {
  return request<Consumable[]>("/consumable");
}

export function fetchMaintenanceTickets(): Promise<MaintenanceTicket[]> {
  return request<MaintenanceTicket[]>("/maintenance");
}

// Members list is admin-only; non-admins will get a 403.
export function fetchMembers(): Promise<Member[]> {
  return request<Member[]>("/member");
}

export function createReservation(
  payload: ReservationPayload
): Promise<Reservation> {
  return request<Reservation>("/reservation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createCheckout(
  payload: CheckoutPayload
): Promise<Checkout> {
  return request<Checkout>("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----- Generic item CRUD used by the resource pages -----
//
// GroupAPI/ItemAPI expose a uniform shape: GET /<resource>/<id>, PATCH to
// edit, DELETE to remove, POST to create on the group endpoint. These
// generic helpers let the resource-config-driven pages work for any model.

export function fetchItem<T>(resource: string, id: number | string): Promise<T> {
  return request<T>(`/${resource}/${id}`);
}

export function patchItem<T>(
  resource: string,
  id: number | string,
  changes: Record<string, unknown>
): Promise<T> {
  return request<T>(`/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteItem(resource: string, id: number | string): Promise<void> {
  return request<void>(`/${resource}/${id}`, { method: "DELETE" });
}

export function createItem<T>(
  resource: string,
  payload: Record<string, unknown>
): Promise<T> {
  return request<T>(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
