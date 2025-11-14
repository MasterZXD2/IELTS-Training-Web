let words = JSON.parse(localStorage.getItem("sessionWords")) || [];
let index = 0;

const flashcard = document.getElementById("flashcard");
const front = document.getElementById("front");
const back = document.getElementById("back");
const counter = document.getElementById("counter");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");

function loadCard() {
    if (index >= words.length) {
        startQuiz();
        return;
    }

    const w = words[index];

    counter.innerText = `Word ${index + 1} / ${words.length}`;
    progressBar.style.width = ((index) / words.length * 100) + "%";

    front.innerHTML = `<h2>${w.word}</h2><p>${w.ipa}</p>`;
    back.innerHTML = `
        <p><b>Part of Speech:</b> ${w.pos}</p>
        <p><b>Meaning:</b> ${w.thai}</p>
        <p><b>Usage:</b> ${w.usage}</p>
        <p><b>Synonyms:</b> ${w.synonyms.join(", ")}</p>
    `;

    flashcard.classList.remove("flip");
    nextBtn.style.display = "none";
}

flashcard.addEventListener("click", () => {
    flashcard.classList.toggle("flip");
    nextBtn.style.display = flashcard.classList.contains("flip") ? "inline-block" : "none";
});

function nextCard() {
    index++;
    loadCard();
}

// ---------- Quiz Mode ----------
function startQuiz() {
    // Save session words to quizWords
    localStorage.setItem("quizWords", JSON.stringify(words));
    window.location.href = "quiz.html";
}

loadCard();
