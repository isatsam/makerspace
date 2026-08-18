import { useState } from "react";
import type { ChangeEvent } from "react";
import { createReservation } from "../api";
import type { ReservationPayload } from "../types";

// Validation logic ported from the original prototype/reserve.js.
function validateTimes(start: string, end: string): string | null {
  if (start === "" || end === "") {
    return "Please select reservation start and finish time.";
  }
  const startObj = new Date(start);
  const endObj = new Date(end);
  const now = new Date();
  if (startObj < now || endObj < now) {
    return "Reservation start or finish time cannot be in the past.";
  }
  const hours = (endObj.getTime() - startObj.getTime()) / 3600000;
  if (hours > 24) {
    return "A reservation cannot be more than 24 hours.";
  }
  if (isNaN(hours)) {
    return "What are you, a time traveler?";
  }
  return null;
}

interface ReserveFlowProps {
  equipmentId: number;
  equipmentName: string;
  memberId: number;
  onClose: () => void;
}

// The reservation modal + success modal, self-contained. On a successful
// POST it shows the success window; closing that reloads so the new
// reservation appears in the aside.
export function ReserveFlow({
  equipmentId,
  equipmentName,
  memberId,
  onClose,
}: ReserveFlowProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ReservationPayload | null>(null);

  const handleConfirm = () => {
    const error = validateTimes(start, end);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    const payload: ReservationPayload = {
      equipment_id: equipmentId,
      member_id: memberId,
      start_time: start,
      end_time: end,
    };
    createReservation(payload)
      .then(() => {
        setResult(payload);
        setDone(true);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to reserve.";
        setMessage(msg);
      });
  };

  if (done && result) {
    return (
      <div id="successWindow" style={{ display: "block" }}>
        <h1>Success!</h1>
        <p>
          You've successfully reserved <span id="successName">{equipmentName}</span>
          {" "}from <span id="successStart">{result.start_time}</span> to
          <span id="successEnd">{result.end_time}</span>.
        </p>
        <button onClick={() => window.location.reload()}>Confirm</button>
      </div>
    );
  }

  return (
    <div id="selectWindow" data-equipment-id={equipmentId} style={{ display: "block" }}>
      <h1>Reservation</h1>
      <p>You are reserving: <span id="reserveName">{equipmentName}</span></p>
      <p>
        Reservation start:
        <input
          type="datetime-local"
          value={start}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
        />
      </p>
      <p>
        Reservation finish:
        <input
          type="datetime-local"
          value={end}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)}
        />
      </p>
      <p id="selectWindowMessage" style={{ fontWeight: 700 }}>{message}</p>
      <p>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </p>
    </div>
  );
}

export default ReserveFlow;
