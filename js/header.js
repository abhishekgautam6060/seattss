// const HOST_URL = "https://seat-manager-backend-production.up.railway.app";
const HOST_URL = "http://localhost:8080";

/*********************************
 * PROFILE DROPDOWN
 *********************************/
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/*********************************
 * AUTH HEADER HELPER
 *********************************/
function getAuthHeaders() {
  const token = localStorage.getItem("TOKEN");

  if (!token) {
    window.location.href = "/login.html";
    throw new Error("No token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

/*********************************
 * LOGOUT (JWT VERSION)
 *********************************/
function logout() {
  // 🧹 Remove token
  localStorage.removeItem("TOKEN");
  localStorage.removeItem("LIBRARY_ID");
  localStorage.removeItem("LIBRARY_NAME");

  // 🔄 Redirect
  window.location.href = "/login.html";
}

/*********************************
 * CLOSE DROPDOWN ON OUTSIDE CLICK
 *********************************/
document.addEventListener("click", function (e) {
  const wrapper = document.querySelector(".profile-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById("profileMenu").style.display = "none";
  }
});

/*********************************
 * LOAD HEADER DATA
 *********************************/
fetch(`${HOST_URL}/api/header`, {
  headers: getAuthHeaders(),
})
  .then((res) => {
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  })
  .then((data) => {
    document.getElementById("libraryName").innerText = data.libraryName;
    document.getElementById("adminName").innerText = data.adminName;

    if (data.logoUrl) {
      document.getElementById("libraryLogo").src = data.logoUrl;
    }
  })
  .catch(() => {
    localStorage.removeItem("TOKEN");
    window.location.href = "/login.html";
  });

/*********************************
 * NAVIGATION
 *********************************/
function goToDashboard() {
  window.location.href = "/dashboard.html";
}
