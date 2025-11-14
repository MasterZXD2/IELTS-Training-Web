let userData;

// Load users.json
fetch("users.json")
    .then(response => response.json())
    .then(data => {
        userData = data.users;
    })
    .catch(err => {
        console.error("Error loading users.json:", err);
    });

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const errorMsg = document.getElementById("errorMsg");

    if (!userData) {
        errorMsg.innerText = "Unable to load user database.";
        errorMsg.style.display = "block";
        return;
    }

    const found = userData.find(
        user => user.username === username && user.password === password
    );

    if (found) {
        // Save current user in localStorage
        localStorage.setItem("currentUser", username);

        // Go to main menu
        window.location.href = "main.html"; 
    } else {
        errorMsg.style.display = "block";
    }
}
