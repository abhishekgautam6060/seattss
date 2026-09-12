const CURRENT_LIBRARY_ID = localStorage.getItem("LIBRARY_ID")
  ? Number(localStorage.getItem("LIBRARY_ID"))
  : null;

const token = localStorage.getItem("TOKEN");

if (!CURRENT_LIBRARY_ID) {
  alert("Library not loaded");
  throw new Error("Library missing");
}

 const HOST_URL = "https://seat-manager-backend-production-bb04.up.railway.app";
//const HOST_URL = "http://localhost:8080";

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

        // Desktop
        if (window.innerWidth > 768) {
          loadStudentProfile(s);
        }

        // Mobile
        else {
          openMobileStudentProfile(s);
        }
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
  const panel = document.getElementById("studentProfile");

  if (!panel) {
    return;
  }

  // Show profile
  panel.classList.remove("hidden");

  // ==========================================
  // BASIC PROFILE DATA
  // ==========================================

  document.getElementById("pName").innerText = s.name || "-";

  document.getElementById("pPhone").innerText = s.phone || "-";

  document.getElementById("pSeat").innerText = s.seatNumber ?? "-";

  document.getElementById("pJoined").innerText = s.startDate
    ? formatDate(s.startDate)
    : "-";

  document.getElementById("pExpire").innerText = s.endDate
    ? formatDate(s.endDate)
    : "-";

  // ==========================================
  // LOAD SEAT CHANGE HISTORY
  // ==========================================

  if (s.id) {
    loadSeatChangeHistory(s.id);
  } else {
    console.error("Student ID missing. Cannot load seat history.");
  }
}

/*********************************
 * LOAD DESKTOP SEAT HISTORY
 *********************************/
function loadSeatChangeHistory(studentId) {
  const container = document.getElementById("seatChangeTimeline");

  if (!container) {
    console.error("Desktop history container not found");
    return;
  }

  // Show loading
  container.innerHTML = `
    <li class="history-loading">
      <span class="dot"></span>
      <div>
        <p>Loading history...</p>
      </div>
    </li>
  `;

  fetch(
    `${HOST_URL}/api/student/${studentId}/seat-history/library/${CURRENT_LIBRARY_ID}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`History API failed: ${response.status} ${errorText}`);
      }

      return response.json();
    })

    .then((history) => {
      console.log("🖥️ Desktop seat history:", history);

      container.innerHTML = "";

      // No history
      if (!Array.isArray(history) || history.length === 0) {
        container.innerHTML = `
          <li class="history-empty">

            <span class="dot"></span>

            <div>
              <p>No seat changes recorded.</p>
            </div>

          </li>
        `;

        return;
      }

      // Render history
      history.forEach((item, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <span class="dot ${index === 0 ? "active" : ""}"></span>

          <div>

            <b>
              ${item.changedAt ? formatHistoryDate(item.changedAt) : "-"}
            </b>

            <p>
              Seat changed from
              <strong>${item.oldSeat}</strong>
              →
              <strong>${item.newSeat}</strong>
            </p>

          </div>
        `;

        container.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("❌ Desktop seat history error:", error);

      container.innerHTML = `
        <li class="history-empty">

          <span class="dot"></span>

          <div>
            <p>Unable to load seat history.</p>
          </div>

        </li>
      `;
    });
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

  if (!file) {
    return;
  }

  const fileName = file.name.toLowerCase();

  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
    alert("Please select a valid Excel file.");

    event.target.value = "";

    return;
  }

  if (!CURRENT_LIBRARY_ID) {
    alert("Library not loaded. Please refresh.");

    event.target.value = "";

    return;
  }

  const formData = new FormData();

  formData.append("file", file);

  fetch(`${HOST_URL}/api/student/import/library/${CURRENT_LIBRARY_ID}`, {
    method: "POST",

    headers: {
      Authorization: "Bearer " + token,
    },

    body: formData,
  })
    .then(async (response) => {
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data || "Import failed");
      }

      return data;
    })

    .then((result) => {
      console.log("Import result:", result);

      alert(
        `Import completed!\n\n` +
          `Imported: ${result.importedCount}\n` +
          `Failed: ${result.failedCount}`
      );

      location.reload();
    })

    .catch((error) => {
      console.error("Import failed:", error);

      alert(error.message || "Import failed");
    })

    .finally(() => {
      // Allow same file to be selected again
      event.target.value = "";
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
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = downloadUrl;

      const today = new Date().toISOString().split("T")[0];

      a.download = `students_export_${today}.xlsx`;

      document.body.appendChild(a);

      a.click();

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

/*********************************
 * MOBILE STUDENT PROFILE
 *********************************/
function openMobileStudentProfile(s) {
  const modal = document.getElementById("mobileStudentModal");

  if (!modal) {
    console.error("Mobile student modal not found");
    return;
  }

  console.log("📱 Opening mobile student profile:", s);

  // -----------------------------
  // BASIC STUDENT INFORMATION
  // -----------------------------

  document.getElementById("mobilePName").innerText = s.name || "-";

  document.getElementById("mobilePPhone").innerText = s.phone || "-";

  document.getElementById("mobilePSeat").innerText = s.seatNumber ?? "-";

  document.getElementById("mobilePJoined").innerText = s.startDate
    ? formatDate(s.startDate)
    : "-";

  document.getElementById("mobilePExpire").innerText = s.endDate
    ? formatDate(s.endDate)
    : "-";

  // -----------------------------
  // SHOW LOADING STATE
  // -----------------------------

  const historyContainer = document.getElementById("mobileSeatChangeTimeline");

  if (historyContainer) {
    historyContainer.innerHTML = `
      <li class="history-loading">
        Loading history...
      </li>
    `;
  }

  // -----------------------------
  // SHOW MODAL
  // -----------------------------

  modal.classList.add("show");

  document.body.classList.add("mobile-profile-open");

  // -----------------------------
  // LOAD HISTORY
  // -----------------------------

  if (s.id) {
    loadMobileSeatChangeHistory(s.id, CURRENT_LIBRARY_ID);
  } else {
    console.error("Student ID missing. Cannot load mobile history.");

    if (historyContainer) {
      historyContainer.innerHTML = `
        <li class="history-empty">
          <span class="dot"></span>
          <div>
            <p>Student ID not available.</p>
          </div>
        </li>
      `;
    }
  }
}

/*********************************
 * LOAD MOBILE SEAT HISTORY
 *********************************/
function loadMobileSeatChangeHistory(studentId, libraryId) {
  const container = document.getElementById("mobileSeatChangeTimeline");

  if (!container) {
    console.error("mobileSeatChangeTimeline not found");
    return;
  }

  console.log("📱 Loading mobile seat history:", studentId, libraryId);

  fetch(
    `${HOST_URL}/api/student/${studentId}/seat-history/library/${libraryId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`History API failed: ${response.status} ${errorText}`);
      }

      return response.json();
    })

    .then((history) => {
      console.log("📱 Mobile seat history:", history);

      container.innerHTML = "";

      if (!Array.isArray(history) || history.length === 0) {
        container.innerHTML = `
          <li class="history-empty">
            <span class="dot"></span>

            <div>
              <p>No seat changes recorded.</p>
            </div>
          </li>
        `;

        return;
      }

      history.forEach((item, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <span class="dot ${index === 0 ? "active" : ""}"></span>

          <div>

            <b>
              ${item.changedAt ? formatHistoryDate(item.changedAt) : "-"}
            </b>

            <p>
              Seat changed from
              <strong>${item.oldSeat}</strong>
              →
              <strong>${item.newSeat}</strong>
            </p>

          </div>
        `;

        container.appendChild(li);
      });
    })

    .catch((error) => {
      console.error("❌ Failed to load mobile seat history:", error);

      container.innerHTML = `
        <li class="history-empty">

          <span class="dot"></span>

          <div>
            <p>
              Unable to load seat history.
            </p>
          </div>

        </li>
      `;
    });
}

function formatHistoryDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
