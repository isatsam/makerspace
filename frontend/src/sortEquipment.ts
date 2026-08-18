import type { Equipment } from "./data";

// Port of the original prototype/index.js sortEquipmentTypes().
// Groups equipment by its `type` field, preserving insertion order.
export interface EquipmentByType {
  type: string;
  items: { id: number; name: string }[];
}

export function sortEquipmentTypes(equipment: Equipment[]): EquipmentByType[] {
  const order: string[] = [];
  const perType: Record<string, { id: number; name: string }[]> = {};

  equipment.forEach((eq) => {
    if (!(eq.type in perType)) {
      perType[eq.type] = [];
      order.push(eq.type);
    }
    perType[eq.type].push({ id: eq.id, name: eq.unique_name });
  });

  return order.map((type) => ({ type, items: perType[type] }));
}
