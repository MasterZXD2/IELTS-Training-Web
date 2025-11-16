let quizWords = JSON.parse(localStorage.getItem("quizWords")) || [];
let index = 0;
let results = [];
let correctionsWord = 0;
let correctionsPos = 0;
let currentDone = false;

const thaiWord = document.getElementById("thaiWord");
const answerInput = document.getElementById("answerInput");
const posSelect = document.getElementById("posSelect");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const quizResult = document.getElementById("quizResult");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const nextSessionBtn = document.getElementById("nextSessionBtn");
const skipBtn = document.getElementById("skipBtn");

// Shuffle words
quizWords = quizWords.sort(() => Math.random() - 0.5);

loadQuiz();

function loadQuiz() {
    if (index >= quizWords.length) {
        showResults();
        return;
    }

    const w = quizWords[index];
    thaiWord.innerText = w.thai;
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.style.borderColor = "#ccc";
    if (posSelect) {
        posSelect.value = "";
        posSelect.disabled = false;
        posSelect.style.borderColor = "#ccc";
    }
    correctionsWord = 0;
    correctionsPos = 0;
    currentDone = false;

    counter.innerText = `Question ${index + 1} / ${quizWords.length}`;
    progressBar.style.width = `${(index / quizWords.length) * 100}%`;

    // Hide next button until answer submitted
    nextBtn.style.display = "none";
    if (skipBtn) skipBtn.style.display = "inline-block";
}

function submitAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = quizWords[index].word.toLowerCase();
    const userPos = (posSelect?.value || "").trim().toLowerCase();
    const correctPos = (quizWords[index].pos || "").trim().toLowerCase();

    let isWordCorrect = userAnswer === correctAnswer;
    let isPosCorrect = userPos !== "" && userPos === correctPos;

    // Count corrections only on incorrect submissions
    if (!isWordCorrect) {
        correctionsWord++;
    }
    if (posSelect && userPos !== "" && !isPosCorrect) {
        correctionsPos++;
    }

    // If both are correct, record result once and unlock Next
    if (!currentDone && isWordCorrect && (correctPos === "" || isPosCorrect)) {
        results.push({
            thai: quizWords[index].thai,
            correct: correctAnswer,
            posCorrect: correctPos || "-",
            correctionsWord: correctionsWord,
            correctionsPos: correctPos ? correctionsPos : 0
        });
        currentDone = true;
    }

    // Show feedback
    answerInput.style.borderColor = isWordCorrect ? "green" : "red";
    if (posSelect) {
        posSelect.style.borderColor = isPosCorrect ? "green" : "red";
    }

    // Keep inputs enabled for unlimited edits
    answerInput.disabled = false;
    submitBtn.disabled = false;
    if (posSelect) posSelect.disabled = false;

    // Allow Next only when both are correct
    if (isWordCorrect && (correctPos === "" || isPosCorrect)) {
        nextBtn.style.display = "inline-block";
    } else {
        nextBtn.style.display = "none";
    }
}

function nextQuestion() {
    index++;
    loadQuiz();
}

function skipQuestion() {
    if (!currentDone) {
        const correctAnswer = quizWords[index].word.toLowerCase();
        const correctPos = (quizWords[index].pos || "").trim().toLowerCase();
        results.push({
            thai: quizWords[index].thai,
            correct: correctAnswer,
            posCorrect: correctPos || "-",
            correctionsWord: correctionsWord,
            correctionsPos: correctPos ? correctionsPos : 0,
            skipped: true
        });
        currentDone = true;
    }
    nextQuestion();
}

function showResults() {
    thaiWord.style.display = "none";
    answerInput.style.display = "none";
    submitBtn.style.display = "none";
    nextBtn.style.display = "none";
    if (posSelect) posSelect.style.display = "none";
    if (skipBtn) skipBtn.style.display = "none";
    counter.style.display = "none";
    progressBar.style.width = "100%";

    // Show results
    let html = `<h3>Quiz Complete!</h3><ul>`;
    results.forEach(r => {
        html += `<li>
                    <b>${r.thai}${r.skipped ? ' (Skipped)' : ''}</b><br>
                    Correct word: "${r.correct}"<br>
                    POS: "${r.posCorrect}"<br>
                    Corrections — word: ${r.correctionsWord}${r.posCorrect !== '-' ? `, pos: ${r.correctionsPos}` : ``}
                 </li>`;
    });
    html += "</ul>";

    quizResult.innerHTML = html;
    quizResult.style.display = "block";

    nextSessionBtn.style.display = "inline-block";
}

function goToSessionEnd() {
    window.location.href = "session_end.html";
}
