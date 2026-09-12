const CURRENT_LIBRARY_ID = Number(localStorage.getItem("LIBRARY_ID"));

if (!CURRENT_LIBRARY_ID) {
  alert("Library not loaded");
  window.location.href = "/dashboard.html";
  throw new Error("Library missing");
}

 const HOST_URL = "https://seat-manager-backend-production-bb04.up.railway.app";
//const HOST_URL = "http://localhost:8080";

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
 * LOAD PROFILE
 *********************************/
fetch(`${HOST_URL}/api/profile/library/${CURRENT_LIBRARY_ID}`, {
  headers: getAuthHeaders(),
})
  .then((res) => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then((data) => {
    console.log("Profile data:", data);
    document.getElementById("name").innerText = data.adminName;
    document.getElementById("adminPhone").innerText = data.adminPhone;
    document.getElementById("libraryName").innerText = data.libraryName;
    document.getElementById("totalSeats").innerText = data.totalSeats;
  })
  .catch(() => {
    localStorage.removeItem("TOKEN");
    window.location.href = "/login.html";
  });

/*********************************
 * NAVIGATION
 *********************************/
function goTo(path) {
  window.location.href = path;
}
