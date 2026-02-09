const HOST_URL ="http://localhost:8080";

function login() {
    fetch(`${HOST_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phone: phone.value,
            password: password.value
        })
    }).then(res => {
              if (!res.ok) {
                  alert("Invalid credentials");
                  return;
              }

              // 🔍 CHECK IF LIBRARY EXISTS
              fetch(`${HOST_URL}/api/libraries/exists`)
                  .then(r => r.json())
                  .then(hasLibrary => {
                      if (hasLibrary) {
                          // ✅ Existing user
                          window.location.href = "/dashboard.html";
                      } else {
                          // 🚨 First-time user
                          window.location.href = "/create-library.html";
                      }
                  });
          });
}
