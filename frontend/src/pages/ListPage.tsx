import { useState } from "react";
import { Link } from "react-router-dom";
import type { ResourceConfig, FieldDef } from "../resources";
import { useResolvedColumns } from "../resources";
import { useSharedData, useStatusOptions } from "../dataContext";
import { createItem, ApiError } from "../api";

interface ListPageProps<T> {
  config: ResourceConfig<T>;
  items: T[];
}

// Generic list page for any resource. Renders a table of the resource's
// columns; admins also see an "Add new" button that opens an overlay modal
// (same style as the reservation window) to create a new item via POST.
export function ListPage<T extends { id: number }>({ config, items }: ListPageProps<T>) {
  const { currentMember } = useSharedData();
  const columns = useResolvedColumns(config);
  const isAdmin = currentMember.is_admin;
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="page-title-row">
        <h1>{config.title}</h1>
        {isAdmin && (
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
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr data-item-id={item.id} key={item.id}>
                {columns.map((col) => {
                  const value = col.render(item);
                  if (col.link) {
                    return (
                      <td key={col.key}>
                        <Link to={`/${config.urlSegment}/${col.link(item)}`}>
                          {value}
                        </Link>
                      </td>
                    );
                  }
                  return <td key={col.key}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding && isAdmin && (
        <AddWindow
          config={config}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

// Overlay modal to create a new item. Posts the creatable fields to the
// resource's group endpoint, then reloads so the new item appears.
function AddWindow<T extends { id: number }>({
  config,
  onClose,
}: {
  config: ResourceConfig<T>;
  onClose: () => void;
}) {
  const statusOptions = useStatusOptions();
  const creatable = config.fields.filter((f) => f.creatable);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {};
    for (const f of creatable) {
      const raw = values[f.key];
      if (raw === undefined || raw === "") {
        setMessage(`Please fill in ${f.label}.`);
        return;
      }
      payload[f.key] = f.input === "number" || f.input === "select" ? Number(raw) : raw;
    }
    createItem(config.resource, payload)
      .then(() => {
        window.location.reload();
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to create.";
        setMessage(msg);
      });
  };

  return (
    <div id="selectWindow" style={{ display: "block" }}>
      <h1>New {config.singularTitle.toLowerCase()}</h1>
      {creatable.map((f) => (
        <p key={f.key}>
          {f.label}:
          <FieldInput
            field={f.input === "select" && f.key === "status_id" ? { ...f, options: statusOptions } : f}
            value={values[f.key] ?? ""}
            onChange={(v) => setValues({ ...values, [f.key]: v })}
          />
        </p>
      ))}
      <p id="selectWindowMessage" style={{ fontWeight: 700 }}>{message}</p>
      <p>
        <button onClick={handleSubmit}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </p>
    </div>
  );
}

// Shared input renderer used by both Add and Edit.
export function FieldInput<T>({
  field,
  value,
  onChange,
}: {
  field: FieldDef<T>;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.input === "select" && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.input === "datetime-local") {
    // Convert ISO -> the value format <input type=datetime-local> expects.
    const v = value ? new Date(value).toISOString().slice(0, 16) : "";
    return (
      <input
        type="datetime-local"
        value={v}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      type={field.input === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default ListPage;
