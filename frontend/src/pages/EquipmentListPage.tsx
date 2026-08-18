import { useState } from "react";
import { ReserveFlow } from "../components/ReserveFlow";
import { CheckoutFlow } from "../components/CheckoutFlow";
import { equipmentConfig } from "../resources";
import { useSharedData } from "../dataContext";
import type { Equipment } from "../types";

// Custom list page for Equipment that adds a "Reserve" or "Check out" button column
// and manages the ReserveFlow or CheckoutFlow modal.
export function EquipmentListPage() {
  const { equipmentById, currentMember } = useSharedData();
  const items = [...equipmentById.values()];
  const [actionId, setActionId] = useState<number | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);

  // Custom render for rows to add Reserve/Checkout button
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
            onClick={() => {
              setActionId(item.id);
              setIsCheckout(item.type_is_borrowable);
            }}
          >
            {item.type_is_borrowable ? "Check out" : "Reserve"}
          </button>
        </td>
      </tr>
    );
  };

  const actionItem = actionId !== null ? items.find((e) => e.id === actionId) : null;

  return (
    <>
      <div className="page-title-row">
        <h1>{equipmentConfig.title}</h1>
        {currentMember.is_admin && (
          <button className="reserve-button" onClick={() => setActionId(null)}>
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

      {actionId !== null && actionItem && isCheckout && (
        <CheckoutFlow
          equipmentId={actionId}
          equipmentName={actionItem.unique_name ?? ""}
          memberId={currentMember.id}
          onClose={() => setActionId(null)}
        />
      )}
      {actionId !== null && actionItem && !isCheckout && (
        <ReserveFlow
          equipmentId={actionId}
          equipmentName={actionItem.unique_name ?? ""}
          memberId={currentMember.id}
          onClose={() => setActionId(null)}
        />
      )}
    </>
  );
}

export default EquipmentListPage;
