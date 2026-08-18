import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentMember } from "./currentMember";
import {
  fetchEquipment,
  fetchReservations,
  fetchCheckouts,
  fetchCheckoutStatuses,
  fetchConsumables,
  fetchMaintenanceTickets,
  fetchMembers,
} from "./api";
import type {
  Equipment,
  Reservation,
  Checkout,
  CheckoutStatus,
  Member,
  ResolvedUserData,
} from "./types";
import { DataContext, type SharedData } from "./dataContext";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: SharedData };

function resolveUserData(
  reservations: Reservation[],
  checkouts: Checkout[],
  equipmentById: Map<number, Equipment>,
  statusById: Map<number, CheckoutStatus>
): ResolvedUserData {
  const nameFor = (id: number) =>
    equipmentById.get(id)?.unique_name ?? `equipment #${id}`;
  const statusFor = (id: number) =>
    statusById.get(id)?.name ?? `status #${id}`;
  return {
    reservations: reservations.map((r) => ({
      id: r.id,
      equipment: nameFor(r.equipment_id),
    })),
    checkouts: checkouts.map((c) => ({
      id: c.id,
      equipment: nameFor(c.equipment_id),
      status: statusFor(c.status_id),
      start_time: c.start_time,
      end_time: c.end_time,
    })),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const currentMember = getCurrentMember();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setLoad({ kind: "loading" });

    // Members list is admin-only; non-admins get a 403, which we swallow
    // (the aside and member pages degrade gracefully without it).
    const membersPromise = currentMember.is_admin
      ? fetchMembers().catch(() => [] as Member[])
      : Promise.resolve([] as Member[]);

    Promise.all([
      fetchEquipment(),
      fetchReservations(),
      fetchCheckouts(),
      fetchCheckoutStatuses(),
      fetchConsumables(),
      fetchMaintenanceTickets(),
      membersPromise,
    ])
      .then(
        ([
          equipment,
          reservations,
          checkouts,
          statuses,
          consumables,
          maintenanceTickets,
          members,
        ]) => {
          if (cancelled) return;
          const equipmentById = new Map(equipment.map((e) => [e.id, e]));
          const checkoutStatusById = new Map(statuses.map((s) => [s.id, s]));
          // Always include the current member in the members lookup even
          // when the /api/member list isn't available to non-admins.
          const membersList = [...members, currentMember];
          const membersById = new Map(membersList.map((m) => [m.id, m]));
          const data: SharedData = {
            currentMember,
            equipmentById,
            consumables,
            maintenanceTickets,
            checkoutStatusById,
            membersById,
            reservations,
            checkouts,
            userData: resolveUserData(
              reservations,
              checkouts,
              equipmentById,
              checkoutStatusById
            ),
          };
          setLoad({ kind: "ready", data });
        }
      )
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load data from the API.";
        setLoad({ kind: "error", message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    if (load.kind !== "ready") return null;
    return load.data;
  }, [load]);

  if (load.kind === "loading") {
    return <p style={{ margin: 25 }}>Loading…</p>;
  }
  if (load.kind === "error") {
    return (
      <div style={{ margin: 25 }}>
        <p>Could not load data: {load.message}</p>
        <p>
          Make sure the Flask API is running on :5000 and that the selected
          member exists in the database.
        </p>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
