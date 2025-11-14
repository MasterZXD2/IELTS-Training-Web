let quizWords = JSON.parse(localStorage.getItem("quizWords")) || [];
let index = 0;
let correctCount = 0;
let results = [];

const thaiWord = document.getElementById("thaiWord");
const answerInput = document.getElementById("answerInput");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const quizResult = document.getElementById("quizResult");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const nextSessionBtn = document.getElementById("nextSessionBtn");

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

    counter.innerText = `Question ${index + 1} / ${quizWords.length}`;
    progressBar.style.width = `${(index / quizWords.length) * 100}%`;

    // Hide next button until answer submitted
    nextBtn.style.display = "none";
}

function submitAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = quizWords[index].word.toLowerCase();

    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) correctCount++;

    results.push({
        thai: quizWords[index].thai,
        answer: userAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect
    });

    // Show feedback
    answerInput.style.borderColor = isCorrect ? "green" : "red";

    // Disable input and submit
    answerInput.disabled = true;
    submitBtn.disabled = true;

    // Show Next button
    nextBtn.style.display = "inline-block";
}

function nextQuestion() {
    index++;
    loadQuiz();
}

function showResults() {
    thaiWord.style.display = "none";
    answerInput.style.display = "none";
    submitBtn.style.display = "none";
    nextBtn.style.display = "none";
    counter.style.display = "none";
    progressBar.style.width = "100%";

    // Show results
    let html = `<h3>Quiz Complete! Score: ${correctCount} / ${quizWords.length}</h3><ul>`;
    results.forEach(r => {
        html += `<li><b>${r.thai}</b> → Your answer: "${r.answer}" | Correct: "${r.correct}" 
                 ${r.isCorrect ? '✅' : '❌'}</li>`;
    });
    html += "</ul>";

    quizResult.innerHTML = html;
    quizResult.style.display = "block";

    nextSessionBtn.style.display = "inline-block";
}

function goToSessionEnd() {
    window.location.href = "session_end.html";
}
