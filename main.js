// Load username from login
const username = localStorage.getItem("currentUser");

let vocabularyData;

fetch('vocab.json')
    .then(response => response.json())
    .then(data => {
        vocabularyData = data.words;
    });

document.getElementById("welcomeText").innerText =
    "Welcome, " + username;

// Quest system variables
const QUEST_GOAL = 20; // Weekly goal: 20 words
let weeklyProgress = 0;

// Initialize quest system
initQuestSystem();

// Fetch user data from Google Apps Script and update quest
function initQuestSystem() {
    const progressKey = `weeklyProgress_${username}`;
    const lastWeekKey = `lastWeek_${username}`;
    
    // Get current week info
    const currentWeek = getWeekNumber(new Date());
    const currentWeekKey = `${currentWeek.year}-W${currentWeek.week}`;
    
    // Check if it's a new week
    const lastWeek = localStorage.getItem(lastWeekKey);
    if (lastWeek !== currentWeekKey) {
        // New week - reset progress
        localStorage.setItem(progressKey, JSON.stringify([]));
        localStorage.setItem(lastWeekKey, currentWeekKey);
        weeklyProgress = 0;
        updateQuestUI();
    } else {
        // Load existing progress for current week
        let storedProgress = JSON.parse(localStorage.getItem(progressKey) || '[]');
        // Clean up old entries from previous weeks
        storedProgress = cleanupOldProgressEntries(storedProgress);
        localStorage.setItem(progressKey, JSON.stringify(storedProgress));
        weeklyProgress = calculateWeeklyProgress(storedProgress);
        updateQuestUI();
    }
    
    // Fetch user data from Google Apps Script (non-blocking, with error handling)
    fetch("https://script.google.com/macros/s/AKfycby9dKU7OLvykOX61gnFy3-bFA9-3t9bYOqIsz_JiNI8RvzYV11MOzhlPQaktcdQWN5EiQ/exec?user=" + encodeURIComponent(username))
        .then(r => {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        })
        .then(data => {
            console.log('User data:', data);
            if (data.status === 'success' && data.data) {
                // data.data is [user, time, count]
                const serverDate = data.data[1]; // time in DD/MM/YYYY format
                const serverCount = parseInt(data.data[2]) || 0;
                
                // Check if this entry is from current week
                if (isDateInCurrentWeek(serverDate)) {
                    // Update local storage with server data if not already present
                    const progressKey = `weeklyProgress_${username}`;
                    const storedProgress = JSON.parse(localStorage.getItem(progressKey) || '[]');
                    
                    // Check if this date entry already exists
                    const existingEntry = storedProgress.find(e => e.date === serverDate);
                    if (!existingEntry) {
                        storedProgress.push({ date: serverDate, count: serverCount });
                        localStorage.setItem(progressKey, JSON.stringify(storedProgress));
                        weeklyProgress = calculateWeeklyProgress(storedProgress);
                        updateQuestUI();
                    } else if (existingEntry.count !== serverCount) {
                        // Update count if different
                        existingEntry.count = serverCount;
                        localStorage.setItem(progressKey, JSON.stringify(storedProgress));
                        weeklyProgress = calculateWeeklyProgress(storedProgress);
                        updateQuestUI();
                    }
                }
            }
        })
        .catch(err => {
            // Silently handle CORS or network errors - app continues to work
            console.warn('Could not fetch user data (this is okay):', err.message);
        });
}

// Check if a date string (DD/MM/YYYY) is in the current week
function isDateInCurrentWeek(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const currentWeek = getWeekNumber(new Date());
    const dateWeek = getWeekNumber(date);
    return currentWeek.year === dateWeek.year && currentWeek.week === dateWeek.week;
}

// Calculate total progress from stored entries for current week
function calculateWeeklyProgress(storedProgress) {
    let total = 0;
    
    // Filter and sum only entries from current week
    storedProgress.forEach(entry => {
        if (entry.date && isDateInCurrentWeek(entry.date)) {
            total += parseInt(entry.count) || 0;
        }
    });
    
    return total;
}

// Clean up old entries from previous weeks (optional optimization)
function cleanupOldProgressEntries(storedProgress) {
    return storedProgress.filter(entry => {
        if (!entry.date) return false;
        return isDateInCurrentWeek(entry.date);
    });
}

// Update quest UI
function updateQuestUI() {
    const progressText = document.getElementById('questProgressText');
    const progressBar = document.getElementById('questProgressBar');
    const questStatus = document.getElementById('questStatus');
    
    if (!progressText || !progressBar || !questStatus) return;
    
    const percentage = Math.min((weeklyProgress / QUEST_GOAL) * 100, 100);
    
    progressText.textContent = `${weeklyProgress} / ${QUEST_GOAL} words`;
    progressBar.style.width = `${percentage}%`;
    
    if (weeklyProgress >= QUEST_GOAL) {
        questStatus.textContent = '🎉 Quest Completed! Great job!';
        questStatus.className = 'quest-status completed';
        progressBar.style.background = 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
    } else {
        const remaining = QUEST_GOAL - weeklyProgress;
        questStatus.textContent = `${remaining} more words to complete your weekly quest!`;
        questStatus.className = 'quest-status';
        progressBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
    }
}

// Function to add progress (called from quiz.js when quiz completes)
// Make it globally accessible
window.addWeeklyProgress = function(count) {
    const progressKey = `weeklyProgress_${username}`;
    const storedProgress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    
    // Get current date in DD/MM/YYYY format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const today = `${day}/${month}/${year}`;
    
    // Check if entry for today exists
    const todayEntry = storedProgress.find(e => e.date === today);
    if (todayEntry) {
        todayEntry.count = (parseInt(todayEntry.count) || 0) + count;
    } else {
        storedProgress.push({ date: today, count: count });
    }
    
    localStorage.setItem(progressKey, JSON.stringify(storedProgress));
    weeklyProgress = calculateWeeklyProgress(storedProgress);
    updateQuestUI();
};

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return {
        year: d.getUTCFullYear(),
        week: weekNum
    };
}

function isNewWeek(oldDateString) {
    const oldDate = new Date(oldDateString);
    const newDate = new Date(); // วันนี้
  
    const oldW = getWeekNumber(oldDate);
    const newW = getWeekNumber(newDate);
  
    return (oldW.year !== newW.year) || (oldW.week !== newW.week);
}

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
const overlay = document.getElementById("overlay");
let selectedHistoryWords = new Set();

// Open sidebar
function openHistory() {
    updateHistoryList();
    historySidebar.style.width = "540px";
    if (overlay) {
        overlay.style.display = "block";
        // ensure transition
        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
        });
    }
}

// Close sidebar
function closeHistory() {
    historySidebar.style.width = "0";
    if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
        }, 300);
    }
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
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "8px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedHistoryWords.has(word);
        checkbox.onchange = (e) => {
            if (e.target.checked) {
                selectedHistoryWords.add(word);
            } else {
                selectedHistoryWords.delete(word);
            }
        };

        const label = document.createElement("span");
        label.className = "historyWord";
        label.innerHTML = `<span style="text-decoration:underline; cursor:pointer;">${word}</span> — ${count} time${count > 1 ? 's' : ''}`;
        label.onclick = () => showWordInfo(word);

        li.appendChild(checkbox);
        li.appendChild(label);
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

// Multi-select history helpers
function selectAllHistory() {
    const history = JSON.parse(localStorage.getItem("wordHistory")) || {};
    selectedHistoryWords = new Set(Object.keys(history));
    updateHistoryList();
}

function clearHistorySelection() {
    selectedHistoryWords.clear();
    updateHistoryList();
}

function createCardSetFromHistory() {
    if (!vocabularyData || vocabularyData.length === 0) return;
    const selected = Array.from(selectedHistoryWords);
    if (selected.length === 0) {
        alert("Please select at least one word from history.");
        return;
    }
    const wordSet = new Set(selected);
    const selectedWords = vocabularyData.filter(v => wordSet.has(v.word));
    if (selectedWords.length === 0) {
        alert("Selected words were not found in the vocabulary list.");
        return;
    }
    localStorage.setItem("sessionWords", JSON.stringify(selectedWords));
    window.location.href = "cards.html";
}
