const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

function login() {
    fetch(`${HOST_URL}/api/auth/login`,  { credentials: "include" }, {
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
