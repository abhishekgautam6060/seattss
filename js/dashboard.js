/*********************************
 * GLOBAL STATE
 *********************************/
let allAlerts = [];
let showAllAlerts = false;
let currentLibraryId = null;

let CURRENT_LIBRARY_ID =
  localStorage.getItem("LIBRARY_ID")
    ? Number(localStorage.getItem("LIBRARY_ID"))
    : null;

console.log("✅ dashboard.js loaded");

const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";




/*********************************
 * WINDOW LOAD (ONLY ONE)
 *********************************/

 const IS_DASHBOARD_PAGE =
   window.location.pathname.includes("dashboard.html");

window.onload = function () {
    if (!IS_DASHBOARD_PAGE) return;
  console.log("🚀 window.onload triggered");

  // Hide modals safely
  hideModal("bookingModal");
  hideModal("studentModal");

  // Check library
  checkLibraryAndLoad();
//  loadingDashboardCards();
//  loadExpiryNotifications();
};


/*********************************
 * LIBRARY + SEAT FLOW
 *********************************/
function checkLibraryAndLoad() {
  fetch(`${HOST_URL}/api/libraries/exists`, {
    credentials: "include"
  })
      .then(res => {
        console.log("📡 ${HOST_URL}/api/libraries/exists status:", res.status);
        if (!res.ok) throw new Error("Library exists API failed");
        return res.json();
      })
      .then(data => {
        console.log("📚 Library exists response:", data);

        if (!data.exists) {
          console.warn("➡️ No library found, redirecting...");
          window.location.href = "/create-library.html";
          return;
        }

        // ✅ STORE LIBRARY ID GLOBALLY
            localStorage.setItem("LIBRARY_ID", data.libraryId);
            localStorage.setItem("LIBRARY_NAME", data.libraryName);

        const libraryId = data.libraryId;
        console.log("🏛 Library ID:", libraryId);

        loadSeats(libraryId);
        loadingDashboardCards();
        loadExpiryNotifications();
      })
      .catch(err => {
        console.error("❌ Library exists check failed", err);
      });
  }

function loadSeats(libraryId) {
  console.log("🪑 Fetching seats for library:", libraryId);

  fetch(`${HOST_URL}/api/seats/library/${libraryId}`)
    .then(res => {
      console.log("📡 Seats API status:", res.status);
      return res.json();
    })
    .then(seats => {
      console.log("🪑 Seats received:", seats.length);
      console.log(seats);
      renderSeats(seats);
    })
    .catch(err => console.error("❌ Seat fetch failed", err));
}


/*********************************
 * SEAT RENDERING
 *********************************/
function renderSeats(seats) {
  console.log("🎨 Rendering seats...");
  const container = document.getElementById("seatContainer");
  if (!container) return;

  container.innerHTML = "";
  const seatsPerRow = 10;
  let row = [];

  seats.forEach((seat, index) => {
    row.push(seat);

    if (row.length === seatsPerRow || index === seats.length - 1) {
      const isReverse = Math.floor(index / seatsPerRow) % 2 !== 0;
      const finalRow = isReverse ? [...row].reverse() : row;

      finalRow.forEach(s => {
        const div = document.createElement("div");
        div.className = "seat";
        div.innerText = s.seatNumber;

        if (s.occupied) {
          div.classList.add("occupied");
          div.onclick = () => openStudentModal(s.seatNumber);
        } else {
          div.classList.add("vacant");
          div.onclick = () => bookSeat(s.seatNumber);
        }

        container.appendChild(div);
      });

      row = [];
    }
  });
}


/*********************************
 * DASHBOARD COUNTS
 *********************************/

 function loadingDashboardCards() {

  const CURRENT_LIBRARY_ID =
    localStorage.getItem("LIBRARY_ID")
      ? Number(localStorage.getItem("LIBRARY_ID"))
      : null;

    if (!CURRENT_LIBRARY_ID) {
      alert("Library not loaded. Please refresh.");
      return;
    }
fetch(`${HOST_URL}/api/dashboards/${CURRENT_LIBRARY_ID}`)
  .then(res => res.json())
  .then(data => {
    console.log("📊 Dashboard stats loaded", data);
    console.log("📊 Dashboard stats loaded", data);
    document.getElementById("totalSeats").innerText = data.totalSeats;
    document.getElementById("filledSeats").innerText = data.filledSeats;
    document.getElementById("vacantSeats").innerText = data.vacantSeats;
    document.getElementById("halfDayCount").innerText = data.halfDayStudents;
  })
  .catch(err => console.error("❌ Dashboard stats failed", err));

}


/*********************************
 Expire Notifications
 *********************************/


function loadExpiryNotifications() {

console.log(" expiry notification triggered ");

 const CURRENT_LIBRARY_ID =
    localStorage.getItem("LIBRARY_ID")
      ? Number(localStorage.getItem("LIBRARY_ID"))
      : null;

    if (!CURRENT_LIBRARY_ID) {
      alert("Library not loaded. Please refresh.");
      return;
    }

    Promise.all([
      fetch(`${HOST_URL}/api/student/expiring-soon/${CURRENT_LIBRARY_ID}`)
        .then(r => r.json()),

      fetch(`${HOST_URL}/api/student/expired/${CURRENT_LIBRARY_ID}`)
        .then(r => r.json())
    ])
    .then(([expiring, expired]) => {

      console.log("Expiring Data:", expiring);
      console.log("Expired Data:", expired);

      renderExpiryList([...expired, ...expiring]);
    });
}


function renderExpiryList(data) {
  allAlerts = data;

  const box = document.getElementById("expiryBody");
  box.innerHTML = "";

   console.log(" Data ", data);

  const alertsToShow = showAllAlerts ? allAlerts : allAlerts.slice(0, 20);

  alertsToShow.forEach(s => {
    const statusClass = getExpiryClass(s.expireDate);

    const div = document.createElement("div");
    div.className = "alert-item";

    div.innerHTML = `
      <div class="alert-top">
        <div class="alert-user">
          <div class="avatar">
            <i class="fa-solid fa-user"></i>
          </div>

          <div class="user-info">
            <div class="name">${s.name}</div>
            <div class="meta">Seat: ${s.seatNumber}</div>
          </div>
        </div>

        <span class="status ${statusClass}">
          ${statusClass === "expired" ? "EXPIRED" : "EXPIRING SOON"}
        </span>
      </div>

      <div class="alert-actions">
        <button class="btn whatsapp"
          onclick="sendReminder('${s.phone}', '${s.name}', ${s.seatNumber}, '${s.expiryDate}')">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp
        </button>

       <button class="btn call"
         onclick="callPerson('${s.phone}')">
         <i class="fa-solid fa-phone"></i> Call
       </button>
      </div>
    `;

    box.appendChild(div);
  });
   updateViewAllText();
}


function sendReminder(phone, name, seat, expiry) {
  if (!phone) {
    alert("Phone number not available");
    return;
  }

  const cleanPhone = phone.replace(/\D/g, "");

  const message =
`Hello ${name} 👋

Your library seat (Seat No: ${seat})
is expiring on ${expiry}.

Please renew to continue your seat.
Thank you 🙏`;

  const encodedMessage = encodeURIComponent(message);

  const url = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;

  window.open(url, "_blank");
}



function callPerson(phone) {

  if (!phone) {
    alert("Phone number not available");
    return;
  }

  if (!confirm(`Call ${phone}?`)) return;

  // Remove spaces or special chars
  const cleanPhone = phone.replace(/\D/g, "");

  // Open dialer
  window.location.href = `tel:+91${cleanPhone}`;
}



function getExpiryClass(expiryDateStr) {
 if (!expiryDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = expiryDateStr.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  console.log(diffDays)

  if (diffDays < 0) {
    return "expired";           // 🔴 already expired
  } else if (diffDays === 0) {
    return "expired";           // 🔴 expires today
  } else if (diffDays <= 3) {
    return "expiring-soon";     // 🟠 1–3 days left
  }

  return null;
}


function updateViewAllText() {
  const btn = document.querySelector(".view-all");
  btn.innerText = showAllAlerts ? "Show Less" : "View All Alerts";
}

/*********************************
  * BOOK SEAT
  *********************************/
 let selectedSeat = null;

 function bookSeat(seatNumber) {
   selectedSeat = seatNumber;
   document.getElementById("seatNo").innerText = seatNumber;
   showModal("bookingModal");
 }

 function confirmBooking() {

 const CURRENT_LIBRARY_ID =
   localStorage.getItem("LIBRARY_ID")
     ? Number(localStorage.getItem("LIBRARY_ID"))
     : null;

   if (!CURRENT_LIBRARY_ID) {
     alert("Library not loaded. Please refresh.");
     return;
   }

   const payload = {
     libraryId: CURRENT_LIBRARY_ID,   // 🔥 REQUIRED
     seatNumber: selectedSeat,
     name: value("name"),
     phone: value("phone"),
     amountPaid: value("amount"),
     studentType: "FULL_DAY"
   };

   console.log("📦 Booking payload:", payload);

   fetch(`${HOST_URL}/api/book`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(payload)
   })
     .then(res => {
       if (!res.ok) throw new Error("Booking failed");
       return res.text();
     })
     .then(msg => {
       console.log("✅ Booking success:", msg);
       location.reload();
     })
     .catch(err => alert(err.message));
 }

/*********************************
 * STUDENT MODAL
 *********************************/
let currentSeatNumber = null;
let currentStudentId = null;


function openStudentModal(seatNumber) {

const CURRENT_LIBRARY_ID =
   localStorage.getItem("LIBRARY_ID")
     ? Number(localStorage.getItem("LIBRARY_ID"))
     : null;

   if (!CURRENT_LIBRARY_ID) {
     alert("Library not loaded. Please refresh.");
     return;
   }

  currentSeatNumber = seatNumber;

  fetch(`${HOST_URL}/api/student/seat/${seatNumber}/library/${CURRENT_LIBRARY_ID}`)
      .then(res => {
        if (res.status === 404) {
          alert("This seat is vacant.");
          return null;
        }
        return res.json();
      })
      .then(student => {
        if (!student) return;
         currentStudentId = student.id;

        fillStudentModal(student);
        loadAvailableSeats(currentSeatNumber);
        showModal("studentModal");
      })
      .catch(err => console.error(err));
}

function fillStudentModal(student) {
  setText("detailSeatNo", currentSeatNumber);
  setValue("detailName", student.name);
  setValue("detailPhone", student.phone);
  setValue("detailJoinDate", student.bookingDate);
  setValue("detailExpireDate", student.expiryDate);
  setValue("detailAmount", student.amountPaid);
}


/*********************************
 // Vacate Button (Reuse Existing API)
 *********************************/

function vacateSeat() {

const CURRENT_LIBRARY_ID =
   localStorage.getItem("LIBRARY_ID")
     ? Number(localStorage.getItem("LIBRARY_ID"))
     : null;

   if (!CURRENT_LIBRARY_ID) {
     alert("Library not loaded. Please refresh.");
     return;
   }
    fetch(`${HOST_URL}/api/vacate/libraryId/${CURRENT_LIBRARY_ID}/seatId/${currentSeatNumber}`, { method: "POST" })
        .then(() => {
            closeStudentModal();
            refreshUI();
        });
}

/*********************************
 // Update Button
 *********************************/
function updateStudent() {

const CURRENT_LIBRARY_ID =
   localStorage.getItem("LIBRARY_ID")
     ? Number(localStorage.getItem("LIBRARY_ID"))
     : null;

   if (!CURRENT_LIBRARY_ID) {
     alert("Library not loaded. Please refresh.");
     return;
   }
    const payload = {
        name: document.getElementById("detailName").value,
        phone: document.getElementById("detailPhone").value,
        amountPaid: document.getElementById("detailAmount").value,
        expireDate: document.getElementById("detailExpireDate").value,
         seatNumber: parseInt(document.getElementById("detailSeatNumber").value)
    };

    fetch(`${HOST_URL}/api/student/${currentSeatNumber}/library/${CURRENT_LIBRARY_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Update failed");
        return res.text();
    })
    .then(() => {
        alert("Updated successfully");
        closeStudentModal();
        refreshUI();
    })
    .catch(err => alert(err.message));
}



function loadAvailableSeats(currentSeat) {

const CURRENT_LIBRARY_ID =
   localStorage.getItem("LIBRARY_ID")
     ? Number(localStorage.getItem("LIBRARY_ID"))
     : null;

   if (!CURRENT_LIBRARY_ID) {
     alert("Library not loaded. Please refresh.");
     return;
   }


  fetch(`${HOST_URL}/api/seats/library/${CURRENT_LIBRARY_ID}`)
    .then(res => res.json())
    .then(seats => {
      const select = document.getElementById("detailSeatNumber");
      select.innerHTML = "";

      seats.forEach(seat => {
        // show vacant seats + current seat
        if (!seat.occupied || seat.seatNumber === currentSeat) {
          const option = document.createElement("option");
          option.value = seat.seatNumber;
          option.text = seat.seatNumber;
          if (seat.seatNumber === currentSeat) {
            option.selected = true;
          }
          select.appendChild(option);
        }
      });
    });
}



/*********************************
 * HELPERS
 *********************************/
function hideModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function refreshUI() {
    location.reload();
}

function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function value(id) {
  return document.getElementById(id)?.value || "";
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val || "";
}

function closeStudentModal() {
    document.getElementById("studentModal").style.display = "none";
}

function toggleViewAll() {
  showAllAlerts = !showAllAlerts;
  renderExpiryList(allAlerts);
}


function scrollToSeats() {
  document.querySelector(".seat-card")
    .scrollIntoView({ behavior: "smooth" });
}

function openActiveFullDayStudents() {
  window.location.href = "/students.html";
}

function openHalfDayForm() {
  window.location.href = "/halfday-student.html";
}


/*********************************
 * MOBILE NAV
 *********************************/
function goTo(path) {
  window.location.href = path;
}
