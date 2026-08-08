function startReserve(eqId, eqType) {
  let  eq = equipment.find((e) => e.id === eqId);
  reserveName.innerText = eq.unique_name;
  selectWindow.setAttribute("data-equipment-id", eq.id);

  selectWindow.style.display = "block";
}

function submitReserve() {
  if (startTime.value === "" || endTime.value === "") {
    selectWindowMessage.innerText = "Please select reservation start and finish time."
    return;
  }
  const startTimeObj = new Date(startTime.value);
  const endTimeObj = new Date(endTime.value);
  const now = new Date();
  if (startTimeObj < now || endTimeObj < now) {
    selectWindowMessage.innerText = "Reservation start or finish time cannot be in the past."
    return;
  }
  const difference = endTimeObj - startTimeObj / 3600000;
  if (difference < 24) {
    selectWindowMessage.innerText = "A reservation cannot be more than 24 hours."
    return;
  }
  if (isNaN(parseFloat(difference))) {
    selectWindowMessage.innerText = "What are you, a time traveler?"
    return;
  }

  selectWindowMessage.innerText = "";
  const reservation = {
    "equipment_id": Number(selectWindow.attributes["data-equipment-id"].value),
    "member_id": member.id,
    "start_time": startTime.value,
    "end_time": endTime.value,
  };
  const json = JSON.stringify(reservation);
  console.log(`Pretended to have sent to server: ${json}`)
  goToSuccessWindow(reservation);
}

function closeReserveWindow() {
  selectWindow.style.display = "none";
}

function goToSuccessWindow(r) {
  closeReserveWindow()
  successName.innerText = equipment.find((e) => e.id === r.equipment_id).unique_name;
  successStart.innerText = r.start_time;
  successEnd.innerText = r.end_time;
  successWindow.style.display = "block";
}
