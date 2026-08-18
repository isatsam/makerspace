import { createContext, useContext } from "react";
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
  ResolvedUserData,
} from "./types";

// Everything the shared template + resource pages need, fetched once and
// shared via context so navigation between pages doesn't refetch.
export interface SharedData {
  currentMember: Member;
  // lookups keyed by id, built once from the lists
  equipmentById: Map<number, Equipment>;
  equipmentTypes: EquipmentType[];
  consumables: Consumable[];
  consumableUnits: ConsumableUnit[];
  maintenanceTickets: MaintenanceTicket[];
  ticketStatuses: TicketStatus[];
  checkoutStatusById: Map<number, CheckoutStatus>;
  membersById: Map<number, Member>;
  // raw current-user lists (for the reservation/checkout list pages)
  reservations: Reservation[];
  checkouts: Checkout[];
  // resolved current-user data for the aside
  userData: ResolvedUserData;
}

export const DataContext = createContext<SharedData | null>(null);

export function useSharedData(): SharedData {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useSharedData must be used within a DataContext provider");
  }
  return ctx;
}

// Convenience lookup helpers used by the resource pages to resolve raw
// foreign-key ids into human-readable names.
export function useEquipmentName(): (id: number) => string {
  const { equipmentById } = useSharedData();
  return (id) => equipmentById.get(id)?.unique_name ?? `equipment #${id}`;
}

export function useMemberName(): (id: number) => string {
  const { membersById } = useSharedData();
  return (id) => {
    const m = membersById.get(id);
    return m ? `${m.first_name} ${m.last_name ?? ""}`.trim() : `member #${id}`;
  };
}

export function useStatusName(): (id: number) => string {
  const { checkoutStatusById } = useSharedData();
  return (id) => checkoutStatusById.get(id)?.name ?? `status #${id}`;
}

// Re-export the raw list types for pages that need them directly.
export type {
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
};



// Select options for the checkout status field, from the shared status map.
export function useStatusOptions(): { label: string; value: number }[] {
  const { checkoutStatusById } = useSharedData();
  return [...checkoutStatusById.values()].map((s) => ({
    label: s.name,
    value: s.id,
  }));
}

// Select options for FK fields resolved from the shared lookups.
export function useEquipmentOptions(): { label: string; value: number }[] {
  const { equipmentById } = useSharedData();
  return [...equipmentById.values()].map((e) => ({
    label: e.unique_name ?? `(unnamed)`,
    value: e.id,
  }));
}

export function useEquipmentTypeOptions(): { label: string; value: number }[] {
  const { equipmentTypes } = useSharedData();
  return equipmentTypes.map((t) => ({ label: t.name, value: t.id }));
}

export function useConsumableUnitOptions(): { label: string; value: number }[] {
  const { consumableUnits } = useSharedData();
  return consumableUnits.map((u) => ({ label: u.name ?? "(unnamed)", value: u.id }));
}

export function useTicketStatusOptions(): { label: string; value: number }[] {
  const { ticketStatuses } = useSharedData();
  return ticketStatuses.map((s) => ({ label: s.name, value: s.id }));
}
