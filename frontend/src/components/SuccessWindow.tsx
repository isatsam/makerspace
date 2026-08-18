interface SuccessWindowProps {
  equipmentName: string;
  start: string;
  end: string;
  onClose: () => void;
}

function SuccessWindow({ equipmentName, start, end, onClose }: SuccessWindowProps) {
  return (
    <div id="successWindow" style={{ display: "block" }}>
      <h1>Success!</h1>
      <p>
        You've successfully reserved <span id="successName">{equipmentName}</span>
        {" "}from <span id="successStart">{start}</span> to
        <span id="successEnd">{end}</span>.
      </p>
      <button onClick={onClose}>Confirm</button>
    </div>
  );
}

export default SuccessWindow;
