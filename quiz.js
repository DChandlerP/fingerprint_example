
import { createIcons, Filter, ArrowRight, Award } from 'lucide';

// DOM Elements
const views = {
    loading: document.getElementById('loading-view'),
    category: document.getElementById('category-view'),
    quiz: document.getElementById('quiz-view'),
    results: document.getElementById('results-view')
};

const categoryList = document.getElementById('category-list');
const selectAllCheckbox = document.getElementById('select-all');
const startBtn = document.getElementById('start-btn');

const qCategory = document.getElementById('q-category');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const questionCountDisplay = document.getElementById('question-count-display');
const qText = document.getElementById('q-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress-bar');

const feedbackContainer = document.getElementById('feedback-container');
const feedbackAlert = document.getElementById('feedback-alert');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackRationale = document.getElementById('feedback-rationale');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');

// State
let allQuestions = [];
let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedCategories = new Set();
let timerInterval;
let startTime;

// Initialize
async function init() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        allQuestions = await response.json();

        // Extract unique categories
        const categories = [...new Set(allQuestions.map(q => q.category))].sort();

        renderCategories(categories);
        switchView('category');

        createIcons({
            icons: { Filter, ArrowRight, Award },
            nameAttr: 'data-lucide'
        });

    } catch (error) {
        console.error(error);
        views.loading.innerHTML = `<p class="text-red-500">Error loading quiz data. Please try again.</p>`;
    }
}

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
}

function renderCategories(categories) {
    categoryList.innerHTML = '';
    categories.forEach(cat => {
        if (!cat) return;
        const count = allQuestions.filter(q => q.category === cat).length;

        const wrapper = document.createElement('label');
        wrapper.className = 'flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition border border-gray-700 hover:border-blue-500/50';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = cat;
        checkbox.className = 'category-checkbox rounded bg-gray-900 border-gray-600 text-blue-500 focus:ring-blue-500 w-5 h-5';

        const label = document.createElement('span');
        label.className = 'text-gray-200 text-sm flex-1';
        label.textContent = cat;

        const countBadge = document.createElement('span');
        countBadge.className = 'text-gray-500 text-xs bg-gray-900 px-2 py-1 rounded';
        countBadge.textContent = `${count} Qs`;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        wrapper.appendChild(countBadge);

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) selectedCategories.add(cat);
            else selectedCategories.delete(cat);
            updateStartButton();
        });

        categoryList.appendChild(wrapper);
    });
}

function updateStartButton() {
    startBtn.disabled = selectedCategories.size === 0;
    const checkboxes = document.querySelectorAll('.category-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selectAllCheckbox.checked = allChecked && checkboxes.length > 0;
}

// Event Listeners
selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.category-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) selectedCategories.add(cb.value);
        else selectedCategories.delete(cb.value);
    });
    updateStartButton();
});

startBtn.addEventListener('click', startQuiz);

function startQuiz() {
    // Filter questions
    activeQuestions = allQuestions.filter(q => selectedCategories.has(q.category));

    // Shuffle questions logic (Fisher-Yates)
    for (let i = activeQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeQuestions[i], activeQuestions[j]] = [activeQuestions[j], activeQuestions[i]];
    }

    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.textContent = `Score: 0`;

    // Start Timer
    startTimer();

    switchView('quiz');
    loadQuestion();
}

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function loadQuestion() {
    if (currentQuestionIndex >= activeQuestions.length) {
        showResults();
        return;
    }

    const q = activeQuestions[currentQuestionIndex];

    // Update UI
    qCategory.textContent = q.category;
    qText.textContent = q.text;
    questionCountDisplay.textContent = `Q ${currentQuestionIndex + 1} of ${activeQuestions.length}`;

    const progress = ((currentQuestionIndex) / activeQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Reset Feedback
    feedbackContainer.classList.add('hidden');
    optionsContainer.innerHTML = '';

    // Render Options
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded-lg bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-500 transition-all duration-200 group flex items-start';

        btn.innerHTML = `
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">${opt.label}</span>
            <span class="text-gray-200">${opt.text}</span>
        `;

        btn.onclick = () => handleAnswer(opt, q, btn);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selectedOpt, question, btnElement) {
    // Disable all buttons
    const allBtns = optionsContainer.querySelectorAll('button');
    allBtns.forEach(btn => btn.disabled = true);

    const isCorrect = selectedOpt.label === question.answer;

    // Styling
    if (isCorrect) {
        btnElement.classList.remove('bg-gray-800', 'border-gray-700');
        btnElement.classList.add('bg-green-900/40', 'border-green-500');
        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        feedbackAlert.className = 'p-4 rounded-lg mb-4 border-l-4 bg-green-900/30 border-green-500 text-green-200';
        feedbackTitle.textContent = "Correct!";
    } else {
        btnElement.classList.remove('bg-gray-800', 'border-gray-700');
        btnElement.classList.add('bg-red-900/40', 'border-red-500');

        feedbackAlert.className = 'p-4 rounded-lg mb-4 border-l-4 bg-red-900/30 border-red-500 text-red-200';
        feedbackTitle.textContent = `Incorrect. The correct answer was ${question.answer}.`;

        // Highlight correct one
        const correctBtn = Array.from(allBtns).find(btn => btn.textContent.trim().startsWith(question.answer));
        if (correctBtn) {
            correctBtn.classList.add('ring-2', 'ring-green-500/50');
        }
    }

    // Show Rationale
    feedbackRationale.textContent = question.rationale || "No rationale provided.";
    feedbackContainer.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

quitBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    switchView('category');
});

function showResults() {
    clearInterval(timerInterval);
    switchView('results');
    document.getElementById('final-score').textContent = score;
    document.getElementById('total-questions').textContent = activeQuestions.length;
}

document.getElementById('restart-btn').addEventListener('click', startQuiz);
document.getElementById('new-topics-btn').addEventListener('click', () => {
    switchView('category');
});

// Start
init();
