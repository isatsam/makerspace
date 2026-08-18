import type {
  Equipment,
  Consumable,
  Reservation,
  Checkout,
  MaintenanceTicket,
  Member,
} from "./types";
import {
  useEquipmentName,
  useMemberName,
  useStatusName,
  useEquipmentTypeOptions,
  useConsumableUnitOptions,
  useTicketStatusOptions,
  useStatusOptions,
} from "./dataContext";

// A field that can be displayed and (for admins) edited on a detail page.
export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  // How to render the value read-only.
  render?: (item: T) => string;
  // Input type for editing. "text" | "number" | "datetime-local" | "select".
  // "select" uses `options` (label/value pairs) and sends the numeric value.
  input?: "text" | "number" | "datetime-local" | "select";
  options?: { label: string; value: number }[];
  // Field is part of the create (POST) payload for admins.
  creatable?: boolean;
}

// A column for the list page.
export interface ColumnDef<T> {
  key: string;
  label: string;
  render: (item: T) => string;
  // Make this column a link to the detail page.
  link?: (item: T) => string | number;
}

export interface ResourceConfig<T> {
  // API path segment, e.g. "equipment" -> /api/equipment, /api/equipment/<id>
  resource: string;
  // URL segment, e.g. "equipment" -> /equipment, /equipment/<id>
  urlSegment: string;
  title: string;
  singularTitle: string;
  // The list of items (from shared data, already fetched).
  list: () => T[];
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
  // The id getter.
  idOf: (item: T) => number;
}

// ---- Equipment ----
export const equipmentConfig: ResourceConfig<Equipment> = {
  resource: "equipment",
  urlSegment: "equipment",
  title: "All equipment",
  singularTitle: "Equipment",
  list: () => [], // supplied per-render via shared data (see EquipmentListPage)
  idOf: (e) => e.id,
  columns: [
    { key: "unique_name", label: "Name", render: (e) => e.unique_name ?? "(unnamed)", link: (e) => e.id },
    { key: "type_name", label: "Type", render: (e) => e.type_name },
  ],
  fields: [
    { key: "id", label: "ID", render: (e) => String(e.id) },
    { key: "unique_name", label: "Name", input: "text", creatable: true },
    { key: "type_id", label: "Type", input: "select", creatable: true },
  ],
};

// ---- Consumable ----
export const consumableConfig: ResourceConfig<Consumable> = {
  resource: "consumable",
  urlSegment: "consumable",
  title: "All consumables",
  singularTitle: "Consumable",
  list: () => [],
  idOf: (c) => c.id,
  columns: [
    { key: "name", label: "Name", render: (c) => c.name ?? "(unnamed)", link: (c) => c.id },
    { key: "stock", label: "Stock", render: (c) => String(c.stock) },
    { key: "low_stock_alert", label: "Low-stock alert", render: (c) => String(c.low_stock_alert) },
  ],
  fields: [
    { key: "id", label: "ID", render: (c) => String(c.id) },
    { key: "name", label: "Name", input: "text", creatable: true },
    { key: "stock", label: "Stock", input: "number" },
    { key: "low_stock_alert", label: "Low-stock alert", input: "number" },
    { key: "unit_id", label: "Unit", input: "select", creatable: true },
  ],
};

// ---- Reservation ----
export const reservationConfig: ResourceConfig<Reservation> = {
  resource: "reservation",
  urlSegment: "reservation",
  title: "Reservations",
  singularTitle: "Reservation",
  list: () => [],
  idOf: (r) => r.id,
  columns: [
    { key: "id", label: "ID", render: (r) => String(r.id), link: (r) => r.id },
    { key: "equipment_id", label: "Equipment", render: () => "" }, // filled at runtime
    { key: "start_time", label: "Start", render: (r) => r.start_time },
    { key: "end_time", label: "End", render: (r) => r.end_time },
  ],
  fields: [
    { key: "id", label: "ID", render: (r) => String(r.id) },
    { key: "equipment_id", label: "Equipment", input: "number", creatable: true },
    { key: "member_id", label: "Member", input: "number" },
    { key: "start_time", label: "Start", input: "datetime-local", creatable: true },
    { key: "end_time", label: "End", input: "datetime-local", creatable: true },
  ],
};

// ---- Checkout ----
export const checkoutConfig: ResourceConfig<Checkout> = {
  resource: "checkout",
  urlSegment: "checkout",
  title: "Checkouts",
  singularTitle: "Checkout",
  list: () => [],
  idOf: (c) => c.id,
  columns: [
    { key: "id", label: "ID", render: (c) => String(c.id), link: (c) => c.id },
    { key: "equipment_id", label: "Equipment", render: () => "" },
    { key: "status_id", label: "Status", render: () => "" },
    { key: "end_time", label: "Until", render: (c) => c.end_time },
  ],
  fields: [
    { key: "id", label: "ID", render: (c) => String(c.id) },
    { key: "equipment_id", label: "Equipment", input: "number", creatable: true },
    { key: "member_id", label: "Member", input: "number" },
    { key: "status_id", label: "Status", input: "select" },
    { key: "start_time", label: "Start", input: "datetime-local", creatable: true },
    { key: "end_time", label: "End", input: "datetime-local", creatable: true },
  ],
};

// ---- Maintenance ticket ----
export const maintenanceConfig: ResourceConfig<MaintenanceTicket> = {
  resource: "maintenance",
  urlSegment: "maintenance",
  title: "Maintenance tickets",
  singularTitle: "Maintenance ticket",
  list: () => [],
  idOf: (t) => t.id,
  columns: [
    { key: "id", label: "ID", render: (t) => String(t.id), link: (t) => t.id },
    { key: "equipment_id", label: "Equipment", render: () => "" },
    { key: "creation_time", label: "Created", render: (t) => t.creation_time },
  ],
  fields: [
    { key: "id", label: "ID", render: (t) => String(t.id) },
    { key: "equipment_id", label: "Equipment", input: "number", creatable: true },
    { key: "member_id", label: "Member", input: "number", creatable: true },
    { key: "status_id", label: "Status", input: "select", creatable: true },
  ],
};

// ---- Member ----
export const memberConfig: ResourceConfig<Member> = {
  resource: "member",
  urlSegment: "member",
  title: "Members",
  singularTitle: "Member",
  list: () => [],
  idOf: (m) => m.id,
  columns: [
    { key: "first_name", label: "Name", render: (m) => `${m.first_name} ${m.last_name ?? ""}`.trim(), link: (m) => m.id },
    { key: "email", label: "Email", render: (m) => m.email },
    { key: "is_admin", label: "Role", render: (m) => (m.is_admin ? "admin" : "member") },
  ],
  fields: [
    { key: "id", label: "ID", render: (m) => String(m.id) },
    { key: "first_name", label: "First name", input: "text", creatable: true },
    { key: "last_name", label: "Last name", input: "text", creatable: true },
    { key: "email", label: "Email", input: "text", creatable: true },
    { key: "phone_number", label: "Phone", input: "text", creatable: true },
    { key: "is_admin", label: "Admin", input: "select", options: [{ label: "Member", value: 0 }, { label: "Admin", value: 1 }] },
  ],
};

// Hooks to resolve foreign-key columns at render time. The list pages call
// these to fill in the equipment/member/status names that the API returns
// as raw ids.
// Resolve foreign-key columns (those whose config render returns "")
// into human-readable names using the shared lookups.
export function useResolvedColumns<T>(
  config: ResourceConfig<T>
): ColumnDef<T>[] {
  const equipmentName = useEquipmentName();
  const memberName = useMemberName();
  const statusName = useStatusName();
  const equipmentTypeName = useEquipmentTypeOptions();
  const consumableUnitName = useConsumableUnitOptions();
  const ticketStatusName = useTicketStatusOptions();

  // Build a map from id -> name for each FK type so we can resolve
  // the column renderers.
  const typeById = new Map(equipmentTypeName.map((o) => [o.value, o.label]));
  const unitById = new Map(consumableUnitName.map((o) => [o.value, o.label]));
  const ticketById = new Map(ticketStatusName.map((o) => [o.value, o.label]));

  return config.columns.map((col) => {
    switch (col.key) {
      case "equipment_id":
        return { ...col, render: (item: T) => equipmentName((item as unknown as { equipment_id: number }).equipment_id) };
      case "member_id":
        return { ...col, render: (item: T) => memberName((item as unknown as { member_id: number }).member_id) };
      case "status_id":
        return { ...col, render: (item: T) => statusName((item as unknown as { status_id: number }).status_id) };
      case "type_id":
        return { ...col, render: (item: T) => typeById.get((item as unknown as { type_id: number }).type_id) ?? `type #${(item as unknown as { type_id: number }).type_id}` };
      case "unit_id":
        return { ...col, render: (item: T) => unitById.get((item as unknown as { unit_id: number }).unit_id) ?? `unit #${(item as unknown as { unit_id: number }).unit_id}` };
      case "ticket_status_id":
        return { ...col, render: (item: T) => ticketById.get((item as unknown as { status_id: number }).status_id) ?? `status #${(item as unknown as { status_id: number }).status_id}` };
      default:
        return col;
    }
  });
}

// Return the select options for a given FK field key, or undefined if
// the field is not a select.
export function useOptionsForField(key: string): { label: string; value: number }[] | undefined {
  const equipmentTypeOptions = useEquipmentTypeOptions();
  const consumableUnitOptions = useConsumableUnitOptions();
  const ticketStatusOptions = useTicketStatusOptions();
  const statusOptions = useStatusOptions();
  switch (key) {
    case "type_id":
      return equipmentTypeOptions;
    case "unit_id":
      return consumableUnitOptions;
    case "status_id":
      // status_id can be checkout status or ticket status; we try both.
      // The caller knows which one to use based on the resource.
      return statusOptions;
    case "ticket_status_id":
      return ticketStatusOptions;
    default:
      return undefined;
  }
}
