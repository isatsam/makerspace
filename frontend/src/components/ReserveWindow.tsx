import { useState } from "react";
import type { ReservationPayload } from "../types";

interface ReserveWindowProps {
  equipmentId: number;
  equipmentName: string;
  memberId: number;
  onConfirm: (reservation: ReservationPayload) => void;
  onCancel: () => void;
}

// Port of the validation logic from prototype/reserve.js submitReserve().
// The original used `endTimeObj - startTimeObj / 3600000` which, due to
// operator precedence, divided startTimeObj (coerced to a number) before
// subtracting. Here we compute the intended duration in hours directly.
function validateTimes(
  startTime: string,
  endTime: string
): string | null {
  if (startTime === "" || endTime === "") {
    return "Please select reservation start and finish time.";
  }
  const startTimeObj = new Date(startTime);
  const endTimeObj = new Date(endTime);
  const now = new Date();

  if (startTimeObj < now || endTimeObj < now) {
    return "Reservation start or finish time cannot be in the past.";
  }
  const differenceHours = (endTimeObj.getTime() - startTimeObj.getTime()) / 3600000;
  if (differenceHours > 24) {
    return "A reservation cannot be more than 24 hours.";
  }
  if (isNaN(differenceHours)) {
    return "What are you, a time traveler?";
  }
  return null;
}

function ReserveWindow({
  equipmentId,
  equipmentName,
  memberId,
  onConfirm,
  onCancel,
}: ReserveWindowProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    const error = validateTimes(startTime, endTime);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    onConfirm({
      equipment_id: equipmentId,
      member_id: memberId,
      start_time: startTime,
      end_time: endTime,
    });
  };

  return (
    <div id="selectWindow" data-equipment-id={equipmentId} style={{ display: "block" }}>
      <h1>Reservation</h1>
      <p>You are reserving: <span id="reserveName">{equipmentName}</span></p>
      <p>
        Reservation start:
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </p>
      <p>
        Reservation finish:
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </p>
      <p id="selectWindowMessage" style={{ fontWeight: 700 }}>{message}</p>
      <p>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </p>
    </div>
  );
}

export default ReserveWindow;
