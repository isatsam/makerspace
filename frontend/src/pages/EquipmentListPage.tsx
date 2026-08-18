import { useState } from "react";
import { ReserveFlow } from "../components/ReserveFlow";
import { equipmentConfig } from "../resources";
import { useSharedData } from "../dataContext";
import type { Equipment } from "../types";

// Custom list page for Equipment that adds a "Reserve" button column
// and manages the ReserveFlow modal.
export function EquipmentListPage() {
  const { equipmentById, currentMember } = useSharedData();
  const items = [...equipmentById.values()];
  const [reservingId, setReservingId] = useState<number | null>(null);

  // Custom render for rows to add Reserve button
  const renderRow = (item: Equipment) => {
    return (
      <tr data-item-id={item.id} key={item.id}>
        {equipmentConfig.columns.map((col) => {
          const value = col.render(item);
          if (col.link) {
            return (
              <td key={col.key}>
                <a href={`#/${equipmentConfig.urlSegment}/${col.link(item)}`}>
                  {value}
                </a>
              </td>
            );
          }
          return <td key={col.key}>{value}</td>;
        })}
        <td>
          <button
            className="reserve-button"
            onClick={() => setReservingId(item.id)}
          >
            Reserve
          </button>
        </td>
      </tr>
    );
  };

  const reservingItem = reservingId !== null ? items.find((e) => e.id === reservingId) : null;

  return (
    <>
      <div className="page-title-row">
        <h1>{equipmentConfig.title}</h1>
        {currentMember.is_admin && (
          <button className="reserve-button" onClick={() => setReservingId(null)}>
            Add new
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="nothing-rn" style={{ display: "block" }}>
          Nothing here yet.
        </p>
      ) : (
        <table className="equipment-table">
          <thead>
            <tr>
              {equipmentConfig.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{items.map(renderRow)}</tbody>
        </table>
      )}

      {reservingId !== null && reservingItem && (
        <ReserveFlow
          equipmentId={reservingId}
          equipmentName={reservingItem.unique_name ?? ""}
          memberId={currentMember.id}
          onClose={() => setReservingId(null)}
        />
      )}
    </>
  );
}

export default EquipmentListPage;
