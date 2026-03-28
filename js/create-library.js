// const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

// function createLibrary() {

//     const libraryName = document.getElementById("libraryName").value;
//     const totalSeats = document.getElementById("totalSeats").value;
//     const logoUrl = document.getElementById("logoUrl").value;

//     fetch(`${HOST_URL}/api/libraries`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             libraryName: libraryName,
//             totalSeats: Number(totalSeats),
//             logoUrl: logoUrl
//         })
//     })
//     .then(res => {
//         if (res.ok) {
//             window.location.href = "/dashboard.html";
//         } else if (res.status === 403) {
//             alert("Session expired. Please login again.");
//             window.location.href = "/login.html";
//         } else {
//             return res.text().then(msg => {
//                 alert("Failed to create library: " + msg);
//             });
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         alert("Something went wrong");
//     });
// }
const HOST_URL = "https://seat-manager-backend-production.up.railway.app";

/*********************************
 * AUTH HEADER HELPER
 *********************************/
function getAuthHeaders() {
    const token = localStorage.getItem("TOKEN");

    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "/login.html";
        throw new Error("No token found");
    }

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}


/*********************************
 * CREATE LIBRARY
 *********************************/
function createLibrary() {

    const libraryName = document.getElementById("libraryName").value;
    const totalSeats = document.getElementById("totalSeats").value;
    const logoUrl = document.getElementById("logoUrl").value;

    fetch(`${HOST_URL}/api/libraries`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            libraryName: libraryName,
            totalSeats: Number(totalSeats),
            logoUrl: logoUrl
        })
    })
    .then(res => {

        if (res.status === 401 || res.status === 403) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("TOKEN");
            window.location.href = "/login.html";
            return;
        }

        if (!res.ok) {
            return res.text().then(msg => {
                throw new Error(msg);
            });
        }

        return res.text();
    })
    .then(() => {
        window.location.href = "/dashboard.html";
    })
    .catch(err => {
        console.error(err);
        alert("Failed to create library: " + err.message);
    });
}
