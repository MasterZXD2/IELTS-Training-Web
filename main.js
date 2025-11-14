// Load username from login
const username = localStorage.getItem("currentUser");

document.getElementById("welcomeText").innerText =
    "Welcome, " + username;

// Start learning
function startLearning() {
    const count = parseInt(document.getElementById("wordCount").value);
    const errorMsg = document.getElementById("errorMsg");

    if (isNaN(count) || count <= 0) {
        errorMsg.style.display = "block";
        return;
    }

    errorMsg.style.display = "none";

    // Load vocabulary JSON
    fetch("vocab.json")
        .then(res => res.json())
        .then(vocab => {
            const words = vocab.words;

            if (count > words.length) {
                errorMsg.innerText = "Not enough words in database.";
                errorMsg.style.display = "block";
                return;
            }

            // Shuffle and pick random words
            const selected = shuffle(words).slice(0, count);

            // Save selected words for the next page
            localStorage.setItem("sessionWords", JSON.stringify(selected));

            // Go to flashcards
            window.location.href = "cards.html";
        });
}

// Fisher–Yates Shuffle
function shuffle(array) {
    let a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
