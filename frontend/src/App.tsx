import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import EquipmentList from "./components/EquipmentList";
import UserAside from "./components/UserAside";
import ReserveWindow from "./components/ReserveWindow";
import SuccessWindow from "./components/SuccessWindow";
import { getCurrentMember } from "./currentMember";
import { sortEquipmentTypes } from "./sortEquipment";
import {
  fetchEquipment,
  fetchReservations,
  fetchCheckouts,
  createReservation,
} from "./api";
import type { Equipment, Reservation, Checkout, ReservationPayload, ResolvedUserData } from "./types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      equipment: Equipment[];
      userData: ResolvedUserData;
    };

// Reservation modal flow.
type ReservationState =
  | { kind: "idle" }
  | { kind: "reserving"; equipmentId: number }
  | { kind: "success"; reservation: Reservation };

// Map a raw Reservation/Checkout list + equipment lookup into the
// resolved shape UserAside renders.
function resolveUserData(
  reservations: Reservation[],
  checkouts: Checkout[],
  equipmentById: Map<number, Equipment>
): ResolvedUserData {
  const nameFor = (id: number) =>
    equipmentById.get(id)?.unique_name ?? `equipment #${id}`;

  return {
    reservations: reservations.map((r) => ({
      id: r.id,
      equipment: nameFor(r.equipment_id),
    })),
    checkouts: checkouts.map((c) => ({
      id: c.id,
      equipment: nameFor(c.equipment_id),
      // The API returns status_id; there is no /api/checkout_status endpoint,
      // so we surface the raw id until that's exposed.
      status: `status #${c.status_id}`,
      start_time: c.start_time,
      end_time: c.end_time,
    })),
  };
}

function App() {
  const currentMember = getCurrentMember();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [reservationState, setReservationState] = useState<ReservationState>({
    kind: "idle",
  });

  // Fetch equipment + the current member's reservations/checkouts on mount.
  // Re-run whenever the logged-in member changes (the header switcher sets
  // the member_id cookie and reloads, which re-runs this).
  useEffect(() => {
    let cancelled = false;
    setLoad({ kind: "loading" });

    Promise.all([fetchEquipment(), fetchReservations(), fetchCheckouts()])
      .then(([equipment, reservations, checkouts]) => {
        if (cancelled) return;
        const byId = new Map(equipment.map((e) => [e.id, e]));
        setLoad({
          kind: "ready",
          equipment,
          userData: resolveUserData(reservations, checkouts, byId),
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load data from the API.";
        setLoad({ kind: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedEquipment = useMemo(
    () => (load.kind === "ready" ? sortEquipmentTypes(load.equipment) : []),
    [load]
  );

  const equipmentById = useMemo(() => {
    if (load.kind !== "ready") return new Map<number, Equipment>();
    return new Map(load.equipment.map((e) => [e.id, e]));
  }, [load]);

  const startReserve = (equipmentId: number) => {
    setReservationState({ kind: "reserving", equipmentId });
  };

  const submitReserve = (payload: ReservationPayload) => {
    createReservation(payload)
      .then((reservation) => {
        setReservationState({ kind: "success", reservation });
      })
      .catch((err: unknown) => {
        // Keep the modal open and surface the API error in the message line.
        const message =
          err instanceof Error ? err.message : "Failed to create reservation.";
        setReservationState({
          kind: "reserving",
          equipmentId: payload.equipment_id,
        });
        // Surface the error via the modal's message via window alert fallback:
        // the ReserveWindow manages its own message state, so we instead
        // re-open after reload is avoided; simplest is to alert.
        console.error("createReservation failed:", message);
        alert(`Could not create reservation: ${message}`);
      });
  };

  const closeReserveWindow = () => setReservationState({ kind: "idle" });

  const onSuccessClose = () => {
    // Reload so the freshly created reservation shows up in the aside.
    window.location.reload();
  };

  return (
    <>
      <Header currentMember={currentMember} />
      <div className="flex">
        {load.kind === "loading" && (
          <main id="main">
            <h1>Reserve makerspace's equipment</h1>
            <p>Loading equipment…</p>
          </main>
        )}
        {load.kind === "error" && (
          <main id="main">
            <h1>Reserve makerspace's equipment</h1>
            <p>Could not load data: {load.message}</p>
            <p>Make sure the Flask API is running on :5000 and that the
              selected member exists in the database.</p>
          </main>
        )}
        {load.kind === "ready" && (
          <>
            <EquipmentList groups={groupedEquipment} onReserve={startReserve} />
            <UserAside data={load.userData} />
          </>
        )}
      </div>

      {reservationState.kind === "reserving" && (
        <ReserveWindow
          equipmentId={reservationState.equipmentId}
          equipmentName={
            equipmentById.get(reservationState.equipmentId)?.unique_name ??
            "something"
          }
          memberId={currentMember.id}
          onConfirm={submitReserve}
          onCancel={closeReserveWindow}
        />
      )}

      {reservationState.kind === "success" && (
        <SuccessWindow
          equipmentName={
            equipmentById.get(reservationState.reservation.equipment_id)
              ?.unique_name ?? "something"
          }
          start={reservationState.reservation.start_time}
          end={reservationState.reservation.end_time}
          onClose={onSuccessClose}
        />
      )}
    </>
  );
}

export default App;
