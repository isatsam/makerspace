import type { EquipmentByType } from "../sortEquipment";

interface EquipmentListProps {
  groups: EquipmentByType[];
  onReserve: (equipmentId: number, type: string) => void;
}

function EquipmentList({ groups, onReserve }: EquipmentListProps) {
  return (
    <main id="main">
      <h1>Reserve makerspace's equipment</h1>
      {groups.map(({ type, items }) => (
        <section className="equipment-section" key={type}>
          <h1>{type}s</h1>
          <table className="equipment-table">
            <tbody>
              {items.map((eq) => (
                <tr data-equipment={eq.id} key={eq.id}>
                  <td>{eq.name}</td>
                  <td>
                    <button
                      onClick={() => onReserve(eq.id, type)}
                      className="reserve-button"
                    >
                      Reserve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  );
}

export default EquipmentList;
