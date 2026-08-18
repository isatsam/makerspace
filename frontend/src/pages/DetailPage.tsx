import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ResourceConfig } from "../resources";
import { useOptionsForField } from "../resources";
import { fetchItem, patchItem, deleteItem, ApiError } from "../api";
import { FieldInput } from "./ListPage";

interface DetailPageProps<T> {
  config: ResourceConfig<T>;
  id: number | string;
  // Optional extra actions rendered at the bottom (e.g. the Reserve button
  // on the equipment detail page).
  extraActions?: (item: T) => React.ReactNode;
  // Optional custom title (e.g. "Your account" for member detail)
  title?: string;
}

type DetailState<T> =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; item: T };

export function DetailPage<T extends { id: number }>({
  config,
  id,
  extraActions,
  title,
}: DetailPageProps<T>) {
  const [state, setState] = useState<DetailState<T>>({ kind: "loading" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    fetchItem<T>(config.resource, id)
      .then((item) => {
        if (cancelled) return;
        setState({ kind: "ready", item });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load.";
        setState({ kind: "error", message: msg });
      });
    return () => {
      cancelled = true;
    };
  }, [config.resource, id]);

  if (state.kind === "loading") return <p>Loading</p>;
  if (state.kind === "error") return <p>Could not load: {state.message}</p>;
  const item = state.item;

  const startEdit = () => {
    const d: Record<string, string> = {};
    for (const f of config.fields) {
      const raw = (item as unknown as Record<string, unknown>)[f.key];
      d[f.key] = raw === null || raw === undefined ? "" : String(raw);
    }
    setDraft(d);
    setEditing(true);
    setMessage("");
  };

  const handleSave = () => {
    const changes: Record<string, unknown> = {};
    for (const f of config.fields) {
      if (!f.input) continue; // read-only field (e.g. id)
      const raw = draft[f.key];
      if (raw === undefined) continue;
      // skip the id field and other non-editable keys implicitly (no input)
      changes[f.key] =
        f.input === "number" || f.input === "select" ? Number(raw) : raw;
    }
    patchItem<T>(config.resource, item.id, changes)
      .then((updated) => {
        setState({ kind: "ready", item: updated });
        setEditing(false);
        setMessage("");
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to save.";
        setMessage(msg);
      });
  };

  const handleDelete = () => {
    if (!confirm(`Delete this ${config.singularTitle.toLowerCase()}?`)) return;
    deleteItem(config.resource, item.id)
      .then(() => {
        // go back to the list page
        window.location.href = `/${config.urlSegment}`;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to delete.";
        setMessage(msg);
      });
  };

  // Use custom title if provided, otherwise use default
  const displayTitle = title ?? `${config.singularTitle} #${item.id}`;

  return (
    <>
      <p>
        <Link to={`/${config.urlSegment}`}>&larr; Back to {config.title}</Link>
      </p>
      <h1>{displayTitle}</h1>

      <table className="equipment-table">
        <tbody>
          {config.fields.map((f) => {
            const raw = (item as unknown as Record<string, unknown>)[f.key];
            const display = f.render ? f.render(item) : raw === null || raw === undefined ? "" : String(raw);
            const options = f.input === "select" ? useOptionsForField(f.key) : undefined;
            const fieldWithOpts = options ? { ...f, options } : f;
            return (
              <tr key={f.key}>
                <th>{f.label}</th>
                <td>
                  {editing && f.input ? (
                    <FieldInput
                      field={fieldWithOpts}
                      value={draft[f.key] ?? ""}
                      onChange={(v) => setDraft({ ...draft, [f.key]: v })}
                    />
                  ) : (
                    display
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {message && <p id="selectWindowMessage" style={{ fontWeight: 700 }}>{message}</p>}

      <p>
        {!editing && (
          <>
            <button className="reserve-button" onClick={startEdit}>Edit</button>{" "}
            <button className="reserve-button" onClick={handleDelete}>Delete</button>
          </>
        )}
        {editing && (
          <>
            <button className="reserve-button" onClick={handleSave}>Save</button>{" "}
            <button onClick={() => setEditing(false)}>Cancel</button>
          </>
        )}
        {extraActions && extraActions(item)}
      </p>
    </>
  );
}

export default DetailPage;
