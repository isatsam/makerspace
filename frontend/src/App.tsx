import { useMemo, useState } from "react";
import Header from "./components/Header";
import EquipmentList from "./components/EquipmentList";
import UserAside from "./components/UserAside";
import ReserveWindow from "./components/ReserveWindow";
import SuccessWindow from "./components/SuccessWindow";
import { equipment, user_data, member } from "./data";
import { sortEquipmentTypes } from "./sortEquipment";
import type { Reservation } from "./types";

// reservation window
type ReservationState =
  | { kind: "idle" }
  | { kind: "reserving"; equipmentId: number }
  | { kind: "success"; reservation: Reservation };

function App() {
  const groupedEquipment = useMemo(() => sortEquipmentTypes(equipment), []);
  const [state, setState] = useState<ReservationState>({ kind: "idle" });

  const startReserve = (equipmentId: number) => {
    setState({ kind: "reserving", equipmentId });
  };

  const submitReserve = (reservation: Reservation) => {
    // Pretended to have sent to server.
    console.log(`Pretended to have sent to server: ${JSON.stringify(reservation)}`);
    setState({ kind: "success", reservation });
  };

  const closeReserveWindow = () => setState({ kind: "idle" });

  return (
    <>
      <Header firstName={member.first_name} />
      <div className="flex">
        <EquipmentList groups={groupedEquipment} onReserve={startReserve} />
        <UserAside data={user_data} />
      </div>

      {state.kind === "reserving" && (
        <ReserveWindow
          equipmentId={state.equipmentId}
          equipmentName={
            equipment.find((e) => e.id === state.equipmentId)?.unique_name ??
            "something"
          }
          memberId={member.id}
          onConfirm={submitReserve}
          onCancel={closeReserveWindow}
        />
      )}

      {state.kind === "success" && (
        <SuccessWindow
          equipmentName={
            equipment.find((e) => e.id === state.reservation.equipment_id)
              ?.unique_name ?? "something"
          }
          start={state.reservation.start_time}
          end={state.reservation.end_time}
          onClose={closeReserveWindow}
        />
      )}
    </>
  );
}

export default App;
