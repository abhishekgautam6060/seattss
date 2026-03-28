// const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

// console.log(" Signup JS Loaded", {HOST_URL});

// function signup() {

//     const name = document.getElementById("name").value;
//     const phone = document.getElementById("phone").value;
//     const password = document.getElementById("password").value;

//     console.log("name", name);
//     console.log("phone", phone);
//     console.log("password", password);


//     console.log(" full URL ", `${HOST_URL}/api/auth/signup`);
//     fetch(`${HOST_URL}/api/auth/signup`, {    
//         method: "POST",
//         credentials: "include", // 🔥 IMPORTANT
//         headers: {
//             "Content-Type": "application/json"
//         },        
//         body: JSON.stringify({
//             name: name,
//             phone: phone,
//             password: password
//         })        
//     })
//     .then(res => {
//         if (res.ok) {
//             // 🔥 DIRECTLY GO TO CREATE LIBRARY
//             window.location.href = "/createlibrary.html";
//         } else {
//             return res.text().then(msg => {
//                 alert("Signup failed: " + msg);
//             });
//         }
//     });
// }



const HOST_URL = "https://seat-manager-backend-production.up.railway.app";

function signup() {

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    fetch(`${HOST_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            phone: phone,
            password: password
        })
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(msg => {
                throw new Error(msg);
            });
        }
        return res.json();
    })
    .then(data => {

        // ✅ Store JWT token
        localStorage.setItem("TOKEN", data.token);

        // ✅ Go to create library
        window.location.href = "/createlibrary.html";
    })
    .catch(err => {
        alert("Signup failed: " + err.message);
    });
}
