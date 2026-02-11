let CURRENT_LIBRARY_ID =
  localStorage.getItem("LIBRARY_ID")
    ? Number(localStorage.getItem("LIBRARY_ID"))
    : null;

const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

fetch(`${HOST_URL}/api/student/halfday/library/${CURRENT_LIBRARY_ID}` , { credentials: "include" })
  .then(res => {
    if (!res.ok) return [];
    return res.json();
  })
  .then(data => {
    const table = document.getElementById("halfDayTable");
    table.innerHTML = "";

    data.forEach(s => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><div class="student-name">${s.name}</div></td>
        <td>${s.phone}</td>
        <td>
          <span class="badge ${s.halfDaySlot.toLowerCase()}">
            ${s.halfDaySlot}
          </span>
        </td>
        <td>${formatDate(s.expiryDate)}</td>
        <td>₹${s.amount}</td>
        <td>
          <button onclick="vacate(${s.id})">Vacate</button>
        </td>
      `;

      tr.onclick = () => loadProfile(s);
      table.appendChild(tr);
    });
  })
  .catch(err => console.error("Half day load failed", err));

function openHalfDayModal() {
  document.getElementById("halfDayModal").classList.remove("hidden");
}

function closeHalfDayModal() {
  document.getElementById("halfDayModal").classList.add("hidden");
}

function saveHalfDayStudent() {
  const payload = {
    name: hdName.value,
    phone: hdPhone.value,
    shift: hdShift.value,
    amountPaid: hdAmount.value,
    expiryDate: hdExpiry.value
  };

  fetch(`${HOST_URL}/api/student/halfday` , { credentials: "include" }, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(() => {
    closeHalfDayModal();
    location.reload();
  });
}

function loadProfile(s) {
  document.getElementById("halfDayProfile").classList.remove("hidden");
  document.getElementById("pName").innerText = s.name;
  document.getElementById("pPhone").innerText = s.phone;
  document.getElementById("pShift").innerText = s.shift;
  document.getElementById("pJoined").innerText = formatDate(s.startDate);
  document.getElementById("pExpire").innerText = formatDate(s.expiryDate);
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : "-";
}


function createHalfDayStudent() {

  const payload = {
    name: document.getElementById("hdName").value,
    phone: document.getElementById("hdPhone").value,
    amount: parseInt(document.getElementById("hdAmount").value),

    studentType: "HALF_DAY",
    halfDaySlot: document.getElementById("hdSlot").value
  };

  fetch(`${HOST_URL}/api/student/create/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" },  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to create student");
    return res.text();
  })
  .then(() => {
    closeHalfDayModal();
    location.reload(); // reload list
  })
  .catch(err => alert(err.message));
}