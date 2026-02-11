function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

function logout() {
  fetch(`${HOST_URL}/api/auth/logout`, { credentials: "include" }, { method: "POST" })
    .then(() => window.location.href = "/login.html");
}

// Close dropdown on outside click
document.addEventListener("click", function (e) {
  const wrapper = document.querySelector(".profile-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById("profileMenu").style.display = "none";
  }
});

fetch(`${HOST_URL}/api/header`, { credentials: "include" })
  .then(res => {
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  })
  .then(data => {
    document.getElementById("libraryName").innerText = data.libraryName;
    document.getElementById("adminName").innerText = data.adminName;

    if (data.logoUrl) {
      document.getElementById("libraryLogo").src = data.logoUrl;
    }
  })
  .catch(() => {
    window.location.href = "/login.html";
  });


function goToDashboard() {
    window.location.href = "/dashboard.html";
}