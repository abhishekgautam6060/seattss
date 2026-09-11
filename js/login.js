// const HOST_URL = "https://seat-manager-backend-production.up.railway.app";
const HOST_URL = "http://localhost:8080";

function login() {
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  fetch(`${HOST_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phone,
      password: password,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      return res.json();
    })
    .then((data) => {
      // ✅ STORE TOKEN
      localStorage.setItem("TOKEN", data.token);

      // 🔍 CHECK IF LIBRARY EXISTS (WITH TOKEN)
      return fetch(`${HOST_URL}/api/libraries/exists`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("TOKEN"),
        },
      });
    })
    .then((res) => res.json())
    .then((hasLibrary) => {
      if (hasLibrary.exists) {
        window.location.href = "/dashboard.html";
      } else {
        window.location.href = "/create-library.html";
      }
    })
    .catch((err) => {
      alert(err.message);
    });
}
