import type { Equipment } from "./types";

// Groups equipment by its type, preserving insertion order. The API returns
// each equipment's type as `type_name` (Equipment.to_dict() in models.py).
export interface EquipmentByType {
  type: string;
  items: { id: number; name: string }[];
}

export function sortEquipmentTypes(equipment: Equipment[]): EquipmentByType[] {
  const order: string[] = [];
  const perType: Record<string, { id: number; name: string }[]> = {};

  equipment.forEach((eq) => {
    const type = eq.type_name ?? "(untyped)";
    if (!(type in perType)) {
      perType[type] = [];
      order.push(type);
    }
    perType[type].push({ id: eq.id, name: eq.unique_name ?? "(unnamed)" });
  });

  return order.map((type) => ({ type, items: perType[type] }));
}
