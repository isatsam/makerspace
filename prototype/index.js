"use strict";

function sortEquipmentTypes() {
  let perType = {};
  equipment.forEach((eq) => {
    let type = eq.type;
    if (type in perType) {
      perType[type].push({ "id": eq.id, "name": eq.unique_name })
    } else {
      perType[type] = [];
      perType[type].push({ "id": eq.id, "name": eq.unique_name })
    }
  })
  console.log(perType);
  return perType;
}

function populateEquipment() {
  let html = "";
  for (const [type, equipments] of Object.entries(perType)) {
      html += `
      <section class="equipment-section">
          <h1>${type}s</h1>
          <table class="equipment-table">`;

      for (const eq of equipments) {
          html += `
              <tr data-equipment="${eq.id}">
                  <td>${eq.name}</td>
                  <td><button onclick="startReserve(${eq.id}, '${type}')" class="reserve-button">Reserve</button></td>
              </tr>`;
      }

      html += `
          </table>
      </section>`;
  }
  main.innerHTML += html;
};

function populateUserData() {
  if (user_data.reservations.length === 0) {
    userReservationsNothing.style.display = "block";
  } else {
    userReservations.innerHTML = user_data.reservations.map(r =>
      `<tr data-reservation-id="${r.id}"><td>${r.equipment}</td><td>...</td></tr>`
    ).join('');
  }

  if (user_data.checkouts.length === 0) {
    userCheckoutsNothing.style.display = "block";
  } else {
    userCheckouts.innerHTML = user_data.checkouts.map(c => `
      <tr data-checkout-id="${c.id}">
        <td><a href="/checkouts/${c.id}">${c.equipment}</a></td>
        ${c.status === "Overdue" ? `<td class="overdue">${c.status}</td>` : `<td>Until ${c.end_time}</td>`}
      </tr>
    `).join('');
  }
}

function populateUserHello() {
  userName.innerText = member.first_name;
}

const perType = sortEquipmentTypes();
populateEquipment();
populateUserData();
populateUserHello();
