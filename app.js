// ==========================================================
//  TestMaster3000 — Static Web Player (no file upload)
//  Test data is loaded from test_data.js as window.TEST_DATA
// ==========================================================

// --- State ---
let testData = null;
let questions = [];
let currentIndex = 0;
let userAnswers = {};          // questionIndex -> selectedAnswerId
let testOrder = [];            // indexes of questions in current session
let answerShuffleMap = {};     // questionIndex -> [shuffled answer indexes]

// --- DOM refs ---
const welcomeScreen = document.getElementById('welcome-screen');
const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');

const testTitleDisplay = document.getElementById('test-title-display');
const metaCount = document.getElementById('meta-count');
const btnStart = document.getElementById('btn-start');

const progressText = document.getElementById('progress-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const questionText = document.getElementById('question-text');
const questionImages = document.getElementById('question-images');
const answersContainer = document.getElementById('answers-container');
const feedbackBanner = document.getElementById('feedback-banner');

const btnPrev = document.getElementById('btn-prev');
const btnSubmit = document.getElementById('btn-submit');
const btnNext = document.getElementById('btn-next');
const btnToWelcome = document.getElementById('btn-to-welcome');

const scorePercentage = document.getElementById('score-percentage');
const scoreEmoji = document.getElementById('score-emoji');
const scoreDetails = document.getElementById('score-details');
const gradeText = document.getElementById('grade-text');
const ringFill = document.getElementById('ring-fill');
const errorsSection = document.getElementById('errors-section');
const errorsTableBody = document.querySelector('#errors-table tbody');
const btnRetryErrors = document.getElementById('btn-retry-errors');
const btnRestart = document.getElementById('btn-restart');

// ==========================================================
//  LOAD TEST DATA FROM JSON FILE
// ==========================================================
const TEST_JSON_FILE = 'test.electrojson.json';

(async function loadTestData() {
    try {
        const resp = await fetch(TEST_JSON_FILE);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        testData = data;
        questions = data.questions || [];

        const title = data.title || data.name || 'Тест';
        testTitleDisplay.textContent = title;
        metaCount.textContent = `${questions.length} вопросов`;
    } catch (err) {
        testTitleDisplay.textContent = 'Ошибка загрузки теста';
        btnStart.disabled = true;
        btnStart.style.opacity = '0.4';
        console.error('Failed to load test:', err);
    }
})();

// ==========================================================
//  START
// ==========================================================
btnStart.addEventListener('click', () => {
    if (!testData) return;
    initTest(testData);
});

// ==========================================================
//  UTILS
// ==========================================================
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ==========================================================
//  INIT TEST
// ==========================================================
function initTest(data, onlyErrors = false) {
    testData = data;

    if (onlyErrors) {
        const errorIndexes = [];
        testOrder.forEach(idx => {
            const q = questions[idx];
            const answerId = userAnswers[idx];
            const correct = q.answers.find(a => a.is_correct);
            if (!correct || correct.id !== answerId) errorIndexes.push(idx);
        });
        testOrder = shuffleArray(errorIndexes);
    } else {
        questions = data.questions;
        testOrder = shuffleArray(Array.from({ length: questions.length }, (_, i) => i));
    }

    currentIndex = 0;
    userAnswers = {};
    answerShuffleMap = {};

    testOrder.forEach(qIdx => {
        const q = questions[qIdx];
        answerShuffleMap[qIdx] = shuffleArray(Array.from({ length: q.answers.length }, (_, i) => i));
    });

    showScreen(testScreen);
    renderQuestion();
}

// ==========================================================
//  SCREEN SWITCHING
// ==========================================================
function showScreen(screen) {
    [welcomeScreen, testScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ==========================================================
//  RENDER QUESTION
// ==========================================================
function renderQuestion() {
    const qIndex = testOrder[currentIndex];
    const question = questions[qIndex];

    answersContainer.innerHTML = '';
    questionImages.innerHTML = '';
    feedbackBanner.style.display = 'none';
    feedbackBanner.className = 'feedback-bar';
    btnSubmit.style.display = 'flex';
    btnNext.style.display = 'none';

    // Progress
    progressText.textContent = `${currentIndex + 1} / ${testOrder.length}`;
    progressBarFill.style.width = `${((currentIndex + 1) / testOrder.length) * 100}%`;

    // Question text
    questionText.textContent = question.question_text;

    // Question images
    if (question.question_images && question.question_images.length > 0) {
        question.question_images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Изображение к вопросу';
            questionImages.appendChild(img);
        });
    }

    // Answers
    const hasAnswered = userAnswers[qIndex] !== undefined;
    const shuffled = answerShuffleMap[qIndex];

    shuffled.forEach(ansIdx => {
        const answer = question.answers[ansIdx];
        const card = document.createElement('div');
        card.className = 'answer-card';
        card.tabIndex = 0;
        card.dataset.answerId = answer.id;

        let imagesHtml = '';
        if (answer.images && answer.images.length > 0) {
            imagesHtml = '<div class="answer-images">';
            answer.images.forEach(src => {
                imagesHtml += `<img src="${src}" alt="Вариант ответа">`;
            });
            imagesHtml += '</div>';
        }

        card.innerHTML = `
            <div class="answer-content">
                <div class="custom-radio"><div class="custom-radio-inner"></div></div>
                <div class="answer-text-label">${answer.text}</div>
            </div>
            ${imagesHtml}
        `;

        if (!hasAnswered) {
            card.addEventListener('click', () => selectAnswer(card, answer.id));
        } else {
            card.classList.add('disabled');
        }

        answersContainer.appendChild(card);
    });

    // Back button
    btnPrev.disabled = currentIndex === 0;

    if (hasAnswered) {
        highlightAnswers(userAnswers[qIndex], question);
    } else {
        btnSubmit.disabled = true;
    }

    testScreen.focus();
}

// ==========================================================
//  SELECT ANSWER
// ==========================================================
function selectAnswer(cardEl, answerId) {
    answersContainer.querySelectorAll('.answer-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');

    const qIndex = testOrder[currentIndex];
    userAnswers[qIndex] = answerId;
    btnSubmit.disabled = false;
}

// ==========================================================
//  SUBMIT ANSWER
// ==========================================================
function submitAnswer() {
    const qIndex = testOrder[currentIndex];
    const question = questions[qIndex];
    const selectedId = userAnswers[qIndex];
    if (!selectedId) return;
    highlightAnswers(selectedId, question);
}

// ==========================================================
//  HIGHLIGHT ANSWERS
// ==========================================================
function highlightAnswers(selectedId, question) {
    const cards = answersContainer.querySelectorAll('.answer-card');
    const correct = question.answers.find(a => a.is_correct);
    const isCorrect = correct && correct.id === selectedId;

    cards.forEach(card => {
        card.classList.add('disabled');
        card.style.pointerEvents = 'none';
        const aid = card.dataset.answerId;
        if (aid === correct.id) card.classList.add('correct');
        else if (aid === selectedId && !isCorrect) card.classList.add('wrong');
    });

    feedbackBanner.style.display = 'block';
    if (isCorrect) {
        feedbackBanner.textContent = '✅ Правильно!';
        feedbackBanner.className = 'feedback-bar correct';
    } else {
        const txt = correct ? correct.text : '?';
        feedbackBanner.textContent = `❌ Неправильно\nВерный ответ: ${txt}`;
        feedbackBanner.className = 'feedback-bar wrong';
    }

    btnSubmit.style.display = 'none';
    btnNext.style.display = 'flex';
}

// ==========================================================
//  NAVIGATION
// ==========================================================
function nextQuestion() {
    if (currentIndex < testOrder.length - 1) { currentIndex++; renderQuestion(); }
    else finishTest();
}

function prevQuestion() {
    if (currentIndex > 0) { currentIndex--; renderQuestion(); }
}

// ==========================================================
//  FINISH TEST
// ==========================================================
function finishTest() {
    showScreen(resultScreen);

    let correctCount = 0;
    const errors = [];

    testOrder.forEach(qIdx => {
        const q = questions[qIdx];
        const aid = userAnswers[qIdx];
        const correct = q.answers.find(a => a.is_correct);
        if (correct && correct.id === aid) correctCount++;
        else errors.push({
            questionText: q.question_text,
            userAnswer: q.answers.find(a => a.id === aid)?.text || 'Нет ответа',
            correctAnswer: correct ? correct.text : '?'
        });
    });

    const pct = Math.round((correctCount / testOrder.length) * 100);
    const wrongCount = testOrder.length - correctCount;

    // Score ring animation
    const circumference = 2 * Math.PI * 52;  // r=52
    const offset = circumference - (circumference * pct / 100);
    ringFill.style.strokeDashoffset = offset;

    // Pick color & emoji
    let emoji = '🏆', grade = 'Отлично! Так держать! 🎉', color = 'var(--green)';
    if (pct < 40) { emoji = '📖'; grade = 'Нужно больше учить! 📖'; color = 'var(--red)'; }
    else if (pct < 60) { emoji = '💪'; grade = 'Удовлетворительно. Повтори материал 💪'; color = 'var(--amber)'; }
    else if (pct < 75) { emoji = '📚'; grade = 'Хорошо! Ещё немного подучить 📚'; color = 'var(--amber)'; }
    else if (pct < 90) { emoji = '👍'; grade = 'Отлично! Почти идеально 👍'; color = 'var(--green)'; }

    scorePercentage.textContent = `${pct}%`;
    scoreEmoji.textContent = emoji;
    scoreDetails.textContent = `Правильно: ${correctCount} из ${testOrder.length} · Ошибок: ${wrongCount}`;
    gradeText.textContent = grade;
    gradeText.style.color = color;
    ringFill.style.stroke = color;

    // Errors table
    errorsTableBody.innerHTML = '';
    if (errors.length > 0) {
        errors.forEach(e => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${e.questionText}</td><td>${e.userAnswer}</td><td>${e.correctAnswer}</td>`;
            errorsTableBody.appendChild(row);
        });
        errorsSection.style.display = 'block';
        btnRetryErrors.style.display = 'flex';
    } else {
        errorsSection.style.display = 'none';
        btnRetryErrors.style.display = 'none';
    }
}

// ==========================================================
//  BUTTON LISTENERS
// ==========================================================
btnSubmit.addEventListener('click', submitAnswer);
btnNext.addEventListener('click', nextQuestion);
btnPrev.addEventListener('click', prevQuestion);

btnToWelcome.addEventListener('click', () => {
    if (confirm('Прервать тест? Прогресс будет потерян.')) showScreen(welcomeScreen);
});

btnRestart.addEventListener('click', () => initTest(testData));
btnRetryErrors.addEventListener('click', () => initTest(testData, true));

// ==========================================================
//  KEYBOARD SHORTCUTS
// ==========================================================
document.addEventListener('keydown', (e) => {
    if (!testScreen.classList.contains('active')) return;

    const key = e.key;
    const qIndex = testOrder[currentIndex];
    const hasAnswered = userAnswers[qIndex] !== undefined;

    if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        if (!hasAnswered) { if (userAnswers[qIndex]) submitAnswer(); }
        else nextQuestion();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
        if (hasAnswered) return;

        const cards = Array.from(answersContainer.querySelectorAll('.answer-card'));
        if (!cards.length) return;

        const sel = cards.findIndex(c => c.classList.contains('selected'));
        let target;
        if (sel === -1) target = key === 'ArrowDown' ? 0 : cards.length - 1;
        else target = key === 'ArrowDown' ? (sel + 1) % cards.length : (sel - 1 + cards.length) % cards.length;

        selectAnswer(cards[target], cards[target].dataset.answerId);
        cards[target].focus();
    } else if (key === 'ArrowLeft') {
        if (currentIndex > 0) prevQuestion();
    } else if (key === 'ArrowRight') {
        if (hasAnswered) nextQuestion();
    }
});
