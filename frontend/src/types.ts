// Data type interfaces aligned with the API's JSON shapes (see
// src/makerspace/models.py to_dict() methods).

// GET /api/equipment  ->  Equipment.to_dict()
export interface Equipment {
  id: number;
  unique_name: string | null;
  type_id: number;
  type_name: string;
}

// GET /api/member/<id>  ->  Member.to_dict()
export interface Member {
  id: number;
  is_admin: boolean;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string;
}

// GET /api/reservation  ->  Reservation.to_dict()
export interface Reservation {
  id: number;
  equipment_id: number;
  member_id: number;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
}

// GET /api/checkout  ->  Checkout.to_dict()
export interface Checkout {
  id: number;
  equipment_id: number;
  member_id: number;
  status_id: number;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
}

// Payload to POST /api/reservation (Reservation.from_json)
export interface ReservationPayload {
  equipment_id: number;
  member_id: number;
  start_time: string; // ISO 8601 (datetime-local is accepted by fromisoformat)
  end_time: string; // ISO 8601
}


// Resolved view-model for the user's reservations/checkouts. Built in App
// from the raw API responses by resolving equipment_id -> equipment name.
export interface ResolvedUserData {
  reservations: { id: number; equipment: string }[];
  checkouts: {
    id: number;
    equipment: string;
    status: string;
    start_time: string;
    end_time: string;
  }[];
}

// GET /api/checkout_statuses  ->  CheckoutStatus.to_dict()
export interface CheckoutStatus {
  id: number;
  name: string;
}
