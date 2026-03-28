// const CURRENT_LIBRARY_ID =
//   localStorage.getItem("LIBRARY_ID")
//     ? Number(localStorage.getItem("LIBRARY_ID"))
//     : null;

// if (!CURRENT_LIBRARY_ID) {
//   alert("Library not loaded");
//   throw new Error("Library missing");
// }

// const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

// console.log(
//   "Student API URL:",
//   `/api/student/library/${CURRENT_LIBRARY_ID}`
// );
// fetch(`${HOST_URL}/api/student/library/${CURRENT_LIBRARY_ID}` , { credentials: "include" })
//   .then(res => {
//     console.log("Student res : ", res)
//     if (!res.ok) throw new Error("Unauthorized");
//     return res.json();
//   })
//   .then(data => {

//   console.log("Student Data : ", data)
//     const table = document.getElementById("studentsTable");
//     table.innerHTML = "";

//     data.forEach(s => {
//       const row = document.createElement("tr");
//       row.classList.add("student-row");
//        row.innerHTML = `
//           <td>${s.seatNumber}</td>
//           <td>${s.name}</td>
//           <td>${s.phone}</td>
//           <td>${formatDate(s.endDate)}</td>
//           <td>₹${s.amount}</td>
//           <td>
//             <button onclick="vacate(${s.seatNumber}); event.stopPropagation()">Vacate</button>
//           </td>
//         `;
//       // 🔥 THIS IS IMPORTANT
//       row.addEventListener("click", () => {
//         document.querySelectorAll(".table tr").forEach(r => r.classList.remove("active"));
//         row.classList.add("active");
//         loadStudentProfile(s);
//       });
// //      row.onclick = () => openProfile(s);
//       table.appendChild(row);
//     });
//   })
//   .catch(() => {
//     window.location.href = "/dashboard.html";
//   });




// /*********************************
//  // Vacate Button (Reuse Existing API)
//  *********************************/

// function vacate(seatNumber) {

// const CURRENT_LIBRARY_ID =
//    localStorage.getItem("LIBRARY_ID")
//      ? Number(localStorage.getItem("LIBRARY_ID"))
//      : null;

//    if (!CURRENT_LIBRARY_ID) {
//      alert("Library not loaded. Please refresh.");
//      return;
//    }
//     fetch(`${HOST_URL}/api/vacate/libraryId/${CURRENT_LIBRARY_ID}/seatId/${seatNumber}`, { method: "POST", credentials: "include" })
//         .then(() => location.reload());
// }


// function formatDate(date) {
//   return new Date(date).toLocaleDateString();
// }


// function openEditModal(s) {
//   document.getElementById("editId").value = s.id;
//   document.getElementById("editName").value = s.name;
//   document.getElementById("editPhone").value = s.phone;
//   document.getElementById("editSeat").value = s.seatNumber;

//   if (s.endDate) {
//     document.getElementById("editEndDate").value =
//       s.endDate.split("T")[0];
//   }

//   document.getElementById("editModal").classList.remove("hidden");
// }

// function closeModal() {
//   document.getElementById("editModal").classList.add("hidden");
// }


// function saveStudent() {
//   const id = document.getElementById("editId").value;

//   const payload = {
//     name: document.getElementById("editName").value,
//     phone: document.getElementById("editPhone").value,
//     seatNumber: parseInt(document.getElementById("editSeat").value),
//     endDate: document.getElementById("editEndDate").value + "T00:00:00"
//   };

//   fetch(`${HOST_URL}/api/students/${id}`, {
//     method: "PUT",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
//   })
//   .then(() => location.reload());
// }

// //search student / Filter student
// function searchStudents() {
//   const name = document.getElementById("searchName").value;
//   const phone = document.getElementById("searchPhone").value;
//   const seat = document.getElementById("searchSeat").value;

//   let url = "/api/student/search?";
//   if (name) url += `name=${name}&`;
//   if (phone) url += `phone=${phone}&`;
//   if (seat) url += `seat=${seat}`;

//   fetch(url)
//     .then(res => res.json())
//     .then(renderStudentTable);
// }



// function openProfile(s) {
//   document.getElementById("studentProfile").innerHTML = `
//     <div class="profile">
//       <h3>${s.name}</h3>
//       <p>${s.phone}</p>

//       <hr>

//       <p><b>Seat:</b> ${s.seatNumber}</p>
//       <p><b>Joined:</b> ${formatDate(s.startDate)}</p>
//       <p><b>Expires:</b> ${formatDate(s.endDate)}</p>

//       <p class="badge ${s.active ? "active" : "expired"}">
//         ${s.active ? "Active" : "Expired"}
//       </p>
//     </div>
//   `;
// }



// function loadStudentProfile(s) {
//   const panel = document.getElementById("studentProfile");
//   panel.classList.remove("hidden");

//   document.getElementById("pName").innerText = s.name;
//   document.getElementById("pPhone").innerText = s.phone;
//   document.getElementById("pSeat").innerText = s.seatNumber;

//   document.getElementById("pJoined").innerText =
//     s.startDate ? formatDate(s.startDate) : "-";

//   document.getElementById("pExpire").innerText =
//     s.endDate ? formatDate(s.endDate) : "-";
// }

// function goTo(path) {
//   window.location.href = path;
// }

const CURRENT_LIBRARY_ID =
  localStorage.getItem("LIBRARY_ID")
    ? Number(localStorage.getItem("LIBRARY_ID"))
    : null;

const token = localStorage.getItem("TOKEN");

if (!CURRENT_LIBRARY_ID) {
  alert("Library not loaded");
  throw new Error("Library missing");
}

const HOST_URL = "https://seat-manager-backend-production.up.railway.app";

/*********************************
 * AUTH HEADER HELPER
 *********************************/
function getAuthHeaders() {

  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "/login.html";
    throw new Error("No token found");
  }

  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}


/*********************************
 * LOAD STUDENTS
 *********************************/
console.log(
  "Student API URL:",
  `/api/student/library/${CURRENT_LIBRARY_ID}`
);

fetch(`${HOST_URL}/api/student/library/${CURRENT_LIBRARY_ID}`, {
  headers: getAuthHeaders()
})
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {

    const table = document.getElementById("studentsTable");
    table.innerHTML = "";

    data.forEach(s => {

      const row = document.createElement("tr");
      row.classList.add("student-row");

      row.innerHTML = `
          <td>${s.seatNumber}</td>
          <td>${s.name}</td>
          <td>${s.phone}</td>
          <td>${formatDate(s.endDate)}</td>
          <td>₹${s.amount}</td>
          <td>
            <button onclick="vacate(${s.seatNumber}); event.stopPropagation()">Vacate</button>
          </td>
        `;

      row.addEventListener("click", () => {
        document.querySelectorAll(".table tr").forEach(r => r.classList.remove("active"));
        row.classList.add("active");
        loadStudentProfile(s);
      });

      table.appendChild(row);
    });
  })
  .catch(() => {
    window.location.href = "/dashboard.html";
  });


/*********************************
 * VACATE
 *********************************/
function vacate(seatNumber) {

  if (!CURRENT_LIBRARY_ID) {
    alert("Library not loaded. Please refresh.");
    return;
  }

  fetch(`${HOST_URL}/api/vacate/libraryId/${CURRENT_LIBRARY_ID}/seatId/${seatNumber}`, {
    method: "POST",
    headers: getAuthHeaders()
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to vacate");
    location.reload();
  })
  .catch(err => alert(err.message));
}


/*********************************
 * EDIT STUDENT
 *********************************/
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function openEditModal(s) {
  document.getElementById("editId").value = s.id;
  document.getElementById("editName").value = s.name;
  document.getElementById("editPhone").value = s.phone;
  document.getElementById("editSeat").value = s.seatNumber;

  if (s.endDate) {
    document.getElementById("editEndDate").value =
      s.endDate.split("T")[0];
  }

  document.getElementById("editModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
}


function saveStudent() {

  const id = document.getElementById("editId").value;

  const payload = {
    name: document.getElementById("editName").value,
    phone: document.getElementById("editPhone").value,
    seatNumber: parseInt(document.getElementById("editSeat").value),
    endDate: document.getElementById("editEndDate").value + "T00:00:00"
  };

  fetch(`${HOST_URL}/api/students/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error("Update failed");
    location.reload();
  })
  .catch(err => alert(err.message));
}


/*********************************
 * SEARCH STUDENTS
 *********************************/
function searchStudents() {

  const name = document.getElementById("searchName").value;
  const phone = document.getElementById("searchPhone").value;
  const seat = document.getElementById("searchSeat").value;

  let url = `${HOST_URL}/api/student/search?`;

  if (name) url += `name=${name}&`;
  if (phone) url += `phone=${phone}&`;
  if (seat) url += `seat=${seat}`;

  fetch(url, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("TOKEN")
    }
  })
    .then(res => res.json())
    .then(renderStudentTable)
    .catch(err => console.error(err));
}


/*********************************
 * PROFILE PANEL
 *********************************/
function openProfile(s) {
  document.getElementById("studentProfile").innerHTML = `
    <div class="profile">
      <h3>${s.name}</h3>
      <p>${s.phone}</p>

      <hr>

      <p><b>Seat:</b> ${s.seatNumber}</p>
      <p><b>Joined:</b> ${formatDate(s.startDate)}</p>
      <p><b>Expires:</b> ${formatDate(s.endDate)}</p>

      <p class="badge ${s.active ? "active" : "expired"}">
        ${s.active ? "Active" : "Expired"}
      </p>
    </div>
  `;
}

function loadStudentProfile(s) {
  const panel = document.getElementById("studentProfile");
  panel.classList.remove("hidden");

  document.getElementById("pName").innerText = s.name;
  document.getElementById("pPhone").innerText = s.phone;
  document.getElementById("pSeat").innerText = s.seatNumber;

  document.getElementById("pJoined").innerText =
    s.startDate ? formatDate(s.startDate) : "-";

  document.getElementById("pExpire").innerText =
    s.endDate ? formatDate(s.endDate) : "-";
}


/*********************************
 * NAVIGATION
 *********************************/
function goTo(path) {
  window.location.href = path;
}



// IMPORT
function importExcel(event) {
  const file = event.target.files[0];

  let formData = new FormData();
  formData.append("file", file);

  console.log("Importing file:", file),
    console.log(
      "URL",
      `${HOST_URL}/api/student/import/library/${CURRENT_LIBRARY_ID}`
    );

  fetch(`${HOST_URL}/api/student/import/library/${CURRENT_LIBRARY_ID}`, {
    method: "POST",
    // ✅ IMPORTANT: Only send Authorization
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  })
    .then((res) => res.text())
    .then((data) => {
      alert("Import Successful");
      location.reload();
    })
    .catch((err) => {
      alert("Import Failed");
      console.error(err);
    });
}
