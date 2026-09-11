const CURRENT_LIBRARY_ID = localStorage.getItem("LIBRARY_ID")
  ? Number(localStorage.getItem("LIBRARY_ID"))
  : null;

const token = localStorage.getItem("TOKEN");

if (!CURRENT_LIBRARY_ID) {
  alert("Library not loaded");
  throw new Error("Library missing");
}

// const HOST_URL = "https://seat-manager-backend-production.up.railway.app";
const HOST_URL = "http://localhost:8080";

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
    Authorization: "Bearer " + token,
  };
}

/*********************************
 * LOAD STUDENTS
 *********************************/
console.log("Student API URL:", `/api/student/library/${CURRENT_LIBRARY_ID}`);

fetch(`${HOST_URL}/api/student/library/${CURRENT_LIBRARY_ID}`, {
  headers: getAuthHeaders(),
})
  .then((res) => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then((data) => {
    console.log("Loaded students:", data);
    const table = document.getElementById("studentsTable");
    table.innerHTML = "";

    data.forEach((s) => {
      const row = document.createElement("tr");
      row.classList.add("student-row");

      row.innerHTML = `
          <td>${s.seatNumber}</td>
          <td>${s.name}</td>
          <td>${s.phone}</td>
          <td>${formatDate(s.endDate)}</td>
          <td>₹${s.amount}</td>
          <td>
            <button onclick="vacate(${
              s.seatNumber
            }); event.stopPropagation()">Vacate</button>
          </td>
        `;

      row.addEventListener("click", () => {
        document
          .querySelectorAll(".student-table tr")
          .forEach((r) => r.classList.remove("active"));
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

  fetch(
    `${HOST_URL}/api/vacate/libraryId/${CURRENT_LIBRARY_ID}/seatId/${seatNumber}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to vacate");
      location.reload();
    })
    .catch((err) => alert(err.message));
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
    document.getElementById("editEndDate").value = s.endDate.split("T")[0];
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
    endDate: document.getElementById("editEndDate").value + "T00:00:00",
  };

  fetch(`${HOST_URL}/api/students/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Update failed");
      location.reload();
    })
    .catch((err) => alert(err.message));
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
      Authorization: "Bearer " + localStorage.getItem("TOKEN"),
    },
  })
    .then((res) => res.json())
    .then(renderStudentTable)
    .catch((err) => console.error(err));
}

/*********************************
 * PROFILE PANEL
 *********************************/
function openProfile(s) {
  console.log("Opening profile for:", s);
  document.getElementById("studentProfile").innerHTML = `
    <div class="profile">
      <h3>${s.name}</h3>
      <p>${s.phone}</p>

      <hr>

      <p><b>Seat:</b> ${s.seatNumber}</p>
      <p><b>Joined:</b> ${formatDate(s.bookingDate)}</p>
      
      <p><b>Expires:</b> ${formatDate(s.expireDate)}</p>

      <p class="badge ${s.active ? "active" : "expired"}">
        ${s.active ? "Active" : "Expired"}
      </p>
    </div>
  `;
}

function loadStudentProfile(s) {
  /* =========================================
     DESKTOP / TABLET
  ========================================= */

  console.log("Selected student:", s);

  if (window.innerWidth > 768) {
    const panel = document.getElementById("studentProfile");
    const emptyState = document.getElementById("studentEmptyState");

    // Hide empty message
    emptyState.classList.add("hidden");

    // Show profile
    panel.classList.remove("hidden");

    document.getElementById("pName").innerText = s.name || "-";

    document.getElementById("pPhone").innerText = s.phone || "-";

    document.getElementById("pSeat").innerText = s.seatNumber ?? "-";

    document.getElementById("pJoined").innerText = s.bookingDate
      ? formatDate(s.bookingDate)
      : "-";

    document.getElementById("pExpire").innerText = s.expireDate
      ? formatDate(s.expireDate)
      : "-";

    // Student-specific history
    renderStudentHistory(s.history, "desktopHistory");

    return;
  }

  /* =========================================
     MOBILE
  ========================================= */

  document.getElementById("mobilePName").innerText = s.name || "-";

  document.getElementById("mobilePPhone").innerText = s.phone || "-";

  document.getElementById("mobilePSeat").innerText = s.seatNumber ?? "-";

  document.getElementById("mobilePJoined").innerText = s.bookingDate
    ? formatDate(s.bookingDate)
    : "-";

  document.getElementById("mobilePExpire").innerText = s.expireDate
    ? formatDate(s.expireDate)
    : "-";

  // Student-specific history
  renderStudentHistory(s.history, "mobileHistory");

  // Open mobile popup
  const modal = document.getElementById("mobileStudentModal");

  modal.classList.add("show");

  document.body.classList.add("mobile-profile-open");
}

function closeMobileStudentProfile() {
  const modal = document.getElementById("mobileStudentModal");

  modal.classList.remove("show");

  document.body.classList.remove("mobile-profile-open");
}

document
  .getElementById("mobileStudentModal")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      closeMobileStudentProfile();
    }
  });

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

// EXPORT STUDENTS TO EXCEL
function exportExcel() {
  if (!CURRENT_LIBRARY_ID) {
    alert("Library not loaded. Please refresh.");
    return;
  }

  const url = `${HOST_URL}/api/student/export/library/${CURRENT_LIBRARY_ID}`;

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to export students");
      }

      return response.blob();
    })
    .then((blob) => {
      // Create temporary download URL
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create temporary anchor
      const a = document.createElement("a");
      a.href = downloadUrl;

      // Generate filename
      const today = new Date().toISOString().split("T")[0];

      a.download = `students_export_${today}.xlsx`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      alert("Students exported successfully!");
    })
    .catch((error) => {
      console.error("Export failed:", error);

      alert("Export Failed");
    });
}

function renderStudentHistory(history, containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  // Clear previous student's history
  container.innerHTML = "";

  // No history available
  if (!Array.isArray(history) || history.length === 0) {
    return;
  }

  const historyHTML = `
    <div class="history">

      <h4>Seat Change History</h4>

      <ul class="timeline">

        ${history
          .map(
            (item, index) => `
          <li>

            <span class="dot ${index === 0 ? "active" : ""}"></span>

            <div>
              <b>${item.date ? formatDate(item.date) : "-"}</b>
              <p>${item.description || "-"}</p>
            </div>

          </li>
        `
          )
          .join("")}

      </ul>

    </div>
  `;

  container.innerHTML = historyHTML;
}
