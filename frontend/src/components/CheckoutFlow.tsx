import { useState } from "react";
import type { ChangeEvent } from "react";
import { createCheckout } from "../api";
import type { CheckoutPayload } from "../types";

// Validation logic for checkout times (similar to reservation validation).
function validateTimes(start: string, end: string): string | null {
  if (start === "" || end === "") {
    return "Please select checkout start and finish time.";
  }
  const startObj = new Date(start);
  const endObj = new Date(end);
  const now = new Date();
  if (startObj < now || endObj < now) {
    return "Checkout start or finish time cannot be in the past.";
  }
  const hours = (endObj.getTime() - startObj.getTime()) / 3600000;
  if (hours > 24) {
    return "A checkout cannot be more than 24 hours.";
  }
  if (isNaN(hours)) {
    return "What are you, a time traveler?";
  }
  return null;
}

interface CheckoutFlowProps {
  equipmentId: number;
  equipmentName: string;
  memberId: number;
  onClose: () => void;
}

// The checkout modal + success modal, self-contained. On a successful
// POST it shows the success window; closing that reloads so the new
// checkout appears in the aside.
export function CheckoutFlow({
  equipmentId,
  equipmentName,
  memberId,
  onClose,
}: CheckoutFlowProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<CheckoutPayload | null>(null);

  const handleConfirm = () => {
    const error = validateTimes(start, end);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    const payload: CheckoutPayload = {
      equipment_id: equipmentId,
      member_id: memberId,
      status_id: 1, // Default status - assuming 1 is the default checkout status
      start_time: start,
      end_time: end,
    };
    createCheckout(payload)
      .then(() => {
        setResult(payload);
        setDone(true);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to check out.";
        setMessage(msg);
      });
  };

  if (done && result) {
    return (
      <div id="successWindow" style={{ display: "block" }}>
        <h1>Success!</h1>
        <p>
          You've successfully checked out <span id="successName">{equipmentName}</span>
          {" "}from <span id="successStart">{result.start_time}</span> to
          <span id="successEnd">{result.end_time}</span>.
        </p>
        <button onClick={() => window.location.reload()}>Confirm</button>
      </div>
    );
  }

  return (
    <div id="selectWindow" data-equipment-id={equipmentId} style={{ display: "block" }}>
      <h1>Checkout</h1>
      <p>You are checking out: <span id="reserveName">{equipmentName}</span></p>
      <p>
        Checkout start:
        <input
          type="datetime-local"
          value={start}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
        />
      </p>
      <p>
        Checkout finish:
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

export default CheckoutFlow;
