// Data type interfaces aligned with database schema

export interface Equipment {
  id: number;
  unique_name: string;
  type: string;
}

export interface UserReservation {
  id: number;
  equipment: string;
}

export interface UserCheckout {
  id: number;
  equipment: string;
  status: string;
  start_time: string;
  end_time: string;
}

export interface UserData {
  reservations: UserReservation[];
  checkouts: UserCheckout[];
}

export interface Member {
  id: number;
  is_admin: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}


export interface Reservation {
  equipment_id: number;
  member_id: number;
  start_time: string;
  end_time: string;
}
