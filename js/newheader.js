function initHeader() {
  setLibraryName();
  setActiveNavLink();
}

function setLibraryName() {
  const libraryName = localStorage.getItem("LIBRARY_NAME");
  const libraryTitle = document.getElementById("librarytitle");

  if (libraryTitle) {
    libraryTitle.textContent = libraryName || "Success Library";
  }
}

/*********************************
 * NAVIGATION
 *********************************/
function goToDashboard() {
  window.location.href = "/dashboard.html";
}

/*********************************
 * PROFILE MENU
 *********************************/
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/*********************************
 * LOGOUT (JWT VERSION)
 *********************************/
function logout() {
  // Remove JWT + library data
  localStorage.removeItem("TOKEN");
  localStorage.removeItem("LIBRARY_ID");
  localStorage.removeItem("LIBRARY_NAME");

  // Redirect to landing page
  window.location.href = "/newindex.html";
}

/*********************************
 * CLOSE DROPDOWN ON OUTSIDE CLICK
 *********************************/
document.addEventListener("click", (e) => {
  const menu = document.getElementById("profileMenu");
  if (!e.target.closest(".profile-wrapper")) {
    if (menu) menu.style.display = "none";
  }
});

/*********************************
 * ACTIVE NAV LINK (DESKTOP)
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".nav-link").forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

/*********************************
 * ACTIVE NAV LINK (MOBILE)
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".mobile-footer .nav-item").forEach((item) => {
    if (currentPath.endsWith(item.dataset.path)) {
      item.classList.add("active");
    }
  });
});

/*********************************
 * MOBILE MENU
 *********************************/
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("hidden");
}

/* Close mobile menu on outside click */
document.addEventListener("click", function (e) {
  const menu = document.getElementById("mobileMenu");
  const btn = document.querySelector(".mobile-menu-btn");

  if (!menu || menu.classList.contains("hidden")) return;

  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.add("hidden");
  }
});
