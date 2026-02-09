const HOST_URL ="http://localhost:8080";

console.log(" Signup JS Loaded", {HOST_URL});

function signup() {

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    console.log("name", name);
    console.log("phone", phone);
    console.log("password", password);


    console.log(" full URL ", `${HOST_URL}/api/auth/signup`);
    fetch(`${HOST_URL}/api/auth/signup`, {    
        method: "POST",
        credentials: "include", // 🔥 IMPORTANT
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
        if (res.ok) {
            // 🔥 DIRECTLY GO TO CREATE LIBRARY
            window.location.href = "/createlibrary.html";
        } else {
            return res.text().then(msg => {
                alert("Signup failed: " + msg);
            });
        }
    });
}
