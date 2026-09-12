 const HOST_URL = "https://seat-manager-backend-production-bb04.up.railway.app";
//const HOST_URL = "http://localhost:8080";

function signup() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  fetch(`${HOST_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      phone: phone,
      password: password,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.json();
    })
    .then((data) => {
      // ✅ Store JWT token
      localStorage.setItem("TOKEN", data.token);

      // ✅ Go to create library
      window.location.href = "/createlibrary.html";
    })
    .catch((err) => {
      alert("Signup failed: " + err.message);
    });
}
