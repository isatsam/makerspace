import { useState } from "react";
import { Link } from "react-router-dom";
import { ReserveFlow } from "../components/ReserveFlow";
import { CheckoutFlow } from "../components/CheckoutFlow";
import { equipmentConfig } from "../resources";
import { useSharedData } from "../dataContext";
import { useResolvedColumns, useOptionsForField } from "../resources";
import type { FieldDef } from "../resources";
import { createItem, ApiError } from "../api";
import { FieldInput } from "./ListPage";
import type { Equipment } from "../types";

// Custom list page for Equipment that adds a "Reserve" or "Check out" button column
// and manages the ReserveFlow or CheckoutFlow modal.
export function EquipmentListPage() {
  const { equipmentById, currentMember } = useSharedData();
  const items = [...equipmentById.values()];
  const columns = useResolvedColumns(equipmentConfig);
  const [actionId, setActionId] = useState<number | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [adding, setAdding] = useState(false);

  // Custom render for rows to add Reserve/Checkout button
  const renderRow = (item: Equipment) => {
    return (
      <tr data-item-id={item.id} key={item.id}>
        {columns.map((col) => {
          const value = col.render(item);
          if (col.link) {
            return (
              <td key={col.key}>
                <Link to={`/${equipmentConfig.urlSegment}/${col.link(item)}`}>
                  {value}
                </Link>
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

  // Add new equipment modal
  const creatable = equipmentConfig.fields.filter((f) => f.creatable);
  const [addValues, setAddValues] = useState<Record<string, string>>({});
  const [addMessage, setAddMessage] = useState("");

  const handleAddSubmit = () => {
    const payload: Record<string, unknown> = {};
    for (const f of creatable) {
      const raw = addValues[f.key];
      if (raw === undefined || raw === "") {
        setAddMessage(`Please fill in ${f.label}.`);
        return;
      }
      payload[f.key] = f.input === "number" || f.input === "select" ? Number(raw) : raw;
    }
    createItem(equipmentConfig.resource, payload)
      .then(() => {
        window.location.reload();
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to create.";
        setAddMessage(msg);
      });
  };

  return (
    <>
      <div className="page-title-row">
        <h1>{equipmentConfig.title}</h1>
        {currentMember.is_admin && (
          <button className="reserve-button" onClick={() => setAdding(true)}>
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
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{items.map(renderRow)}</tbody>
        </table>
      )}

      {adding && currentMember.is_admin && (
        <div id="selectWindow" style={{ display: "block" }}>
          <h1>New {equipmentConfig.singularTitle.toLowerCase()}</h1>
          {creatable.map((f) => {
            const options = f.input === "select" ? useOptionsForField(f.key, equipmentConfig.resource) : undefined;
            const fieldWithOpts = options ? { ...f, options } : f;
            return (
              <p key={f.key}>
                {f.label}:
                <FieldInput
                  field={fieldWithOpts as FieldDef<unknown>}
                  value={addValues[f.key] ?? ""}
                  onChange={(v) => setAddValues({ ...addValues, [f.key]: v })}
                />
              </p>
            );
          })}
          <p id="selectWindowMessage" style={{ fontWeight: 700 }}>{addMessage}</p>
          <p>
            <button onClick={handleAddSubmit}>Create</button>
            <button onClick={() => setAdding(false)}>Cancel</button>
          </p>
        </div>
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
