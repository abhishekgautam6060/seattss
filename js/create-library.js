const HOST_URL ="http://localhost:8080/";

function createLibrary() {

    const libraryName = document.getElementById("libraryName").value;
    const totalSeats = document.getElementById("totalSeats").value;
    const logoUrl = document.getElementById("logoUrl").value;

    fetch(`${HOST_URL}/api/libraries`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            libraryName: libraryName,
            totalSeats: Number(totalSeats),
            logoUrl: logoUrl
        })
    })
    .then(res => {
        if (res.ok) {
            window.location.href = "/dashboard.html";
        } else if (res.status === 403) {
            alert("Session expired. Please login again.");
            window.location.href = "/login.html";
        } else {
            return res.text().then(msg => {
                alert("Failed to create library: " + msg);
            });
        }
    })
    .catch(err => {
        console.error(err);
        alert("Something went wrong");
    });
}
