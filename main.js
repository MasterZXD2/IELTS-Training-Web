// Load username from login
const username = localStorage.getItem("currentUser");

let vocabularyData;

fetch('vocab.json')
    .then(response => response.json())
    .then(data => {
        vocabularyData= data.words;
    });

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

const historySidebar = document.getElementById("historySidebar");
const historyList = document.getElementById("historyList");

// Open sidebar
function openHistory() {
    updateHistoryList();
    historySidebar.style.width = "300px";
}

// Close sidebar
function closeHistory() {
    historySidebar.style.width = "0";
}

// Update history list from localStorage
function updateHistoryList() {
    const history = JSON.parse(localStorage.getItem("wordHistory")) || {};
    historyList.innerHTML = "";

    // Summary at the top
    const totalWords = vocabularyData.length;
    const foundWords = Object.keys(history).length;

    const summary = document.createElement("li");
    summary.innerHTML = `<b>You have encountered ${foundWords} out of ${totalWords} words.</b>`;
    summary.style.borderBottom = "2px solid #2196F3";
    summary.style.marginBottom = "10px";
    historyList.appendChild(summary);

    if (foundWords === 0) {
        const li = document.createElement("li");
        li.innerText = "No words encountered yet.";
        historyList.appendChild(li);
        return;
    }

    // List each word with count
for (const [word, count] of Object.entries(history)) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="historyWord">${word}</span> — ${count} time${count>1?'s':''}`;
    li.style.cursor = "pointer";

    // When clicked → show popup
    li.onclick = () => showWordInfo(word);

    historyList.appendChild(li);
}

}

// Show detailed vocab popup
function showWordInfo(word) {
    const vocab = vocabularyData.find(v => v.word === word);
    if (!vocab) return;

    const box = document.getElementById("wordInfoContent");

    box.innerHTML = `
        <h3>${vocab.word}</h3>
        <p><b>IPA:</b> ${vocab.ipa}</p>
        <p><b>Part of Speech:</b> ${vocab.pos}</p>
        <p><b>Meaning (TH):</b> ${vocab.thai}</p>
        <p><b>Usage:</b> ${vocab.usage}</p>
        <p><b>Synonyms:</b> ${vocab.synonyms?.join(", ") || "-"}</p>
    `;

    document.getElementById("wordInfoPopup").style.display = "block";
}

function closeWordInfo() {
    document.getElementById("wordInfoPopup").style.display = "none";
}
