
import { createIcons, Layers, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide';

// DOM Elements
const views = {
    loading: document.getElementById('loading-view'),
    category: document.getElementById('category-view'),
    flashcard: document.getElementById('flashcard-view'),
    complete: document.getElementById('complete-view')
};

const categoryList = document.getElementById('category-list');
const selectAllCheckbox = document.getElementById('select-all');
const shuffleCheckbox = document.getElementById('shuffle-cards');
const startBtn = document.getElementById('start-btn');

const deckName = document.getElementById('deck-name');
const cardCounter = document.getElementById('card-counter');
const cardInner = document.getElementById('card-inner');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');
const flipBtnMobile = document.getElementById('flip-btn-mobile');

// State
let allDecks = [];
let activeCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let selectedDecks = new Set();

// Helper: Basic Markdown Parser for Bold and Break
// CSVs contain **text** and <br> or \n
function formatText(text) {
    if (!text) return '';
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/<br\s*\/?>/gi, '<br>') // Ensure <br> is safe
        .replace(/\n/g, '<br>'); // Newlines to <br>
    return formatted;
}

// Initialize
async function init() {
    try {
        const response = await fetch('flashcards.json');
        if (!response.ok) throw new Error('Failed to load flashcards');
        allDecks = await response.json();

        renderCategories();
        switchView('category');

        createIcons({
            icons: { Layers, ArrowRight, ArrowLeft, CheckCircle2 },
            nameAttr: 'data-lucide'
        });

    } catch (error) {
        console.error(error);
        views.loading.innerHTML = `<p class="text-red-500">Error loading flashcard data. Please check console.</p>`;
    }
}

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
}

function renderCategories() {
    categoryList.innerHTML = '';
    allDecks.forEach(deck => {
        const wrapper = document.createElement('label');
        wrapper.className = 'flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition border border-gray-700 hover:border-emerald-500/50';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = deck.name;
        checkbox.className = 'deck-checkbox rounded bg-gray-900 border-gray-600 text-emerald-500 focus:ring-emerald-500 w-5 h-5';

        const label = document.createElement('span');
        label.className = 'text-gray-200 text-sm flex-1 truncate';
        label.textContent = deck.name;

        const countBadge = document.createElement('span');
        countBadge.className = 'text-gray-500 text-xs bg-gray-900 px-2 py-1 rounded shrink-0';
        countBadge.textContent = `${deck.cards.length}`;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        wrapper.appendChild(countBadge);

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) selectedDecks.add(deck.name);
            else selectedDecks.delete(deck.name);
            updateStartButton();
        });

        categoryList.appendChild(wrapper);
    });
}

function updateStartButton() {
    startBtn.disabled = selectedDecks.size === 0;
    const checkboxes = document.querySelectorAll('.deck-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selectAllCheckbox.checked = allChecked && checkboxes.length > 0;
}

// Event Listeners
selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.deck-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) selectedDecks.add(cb.value);
        else selectedDecks.delete(cb.value);
    });
    updateStartButton();
});

startBtn.addEventListener('click', startSession);

function startSession() {
    // Collect cards
    activeCards = [];
    allDecks.forEach(deck => {
        if (selectedDecks.has(deck.name)) {
            // Add deck name to card for reference
            const taggedCards = deck.cards.map(c => ({ ...c, deckName: deck.name }));
            activeCards.push(...taggedCards);
        }
    });

    // Shuffle if requested
    if (shuffleCheckbox.checked) {
        for (let i = activeCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeCards[i], activeCards[j]] = [activeCards[j], activeCards[i]];
        }
    }

    currentCardIndex = 0;
    switchView('flashcard');
    loadCard();
}

function loadCard() {
    if (currentCardIndex >= activeCards.length) {
        showComplete();
        return;
    }

    const card = activeCards[currentCardIndex];

    // Reset Flip State
    isFlipped = false;
    cardInner.classList.remove('rotate-y-180');

    // Update Content
    deckName.textContent = card.deckName;
    cardCounter.textContent = `${currentCardIndex + 1} / ${activeCards.length}`;

    cardFront.innerHTML = formatText(card.front);
    cardBack.innerHTML = formatText(card.back);

    // Update Nav Buttons
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = false;
}

// Flip Interaction
const handleFlip = (e) => {
    // Prevent flip if clicking scrolling back content content
    // But since back is only visible when flipped, simple toggle is fine.
    // Except if selecting text on back.
    if (isFlipped && (window.getSelection().toString().length > 0)) {
        return;
    }

    isFlipped = !isFlipped;
    if (isFlipped) cardInner.classList.add('rotate-y-180');
    else cardInner.classList.remove('rotate-y-180');
};

document.getElementById('card-container').addEventListener('click', handleFlip);
flipBtnMobile.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent double trigger
    handleFlip();
});


nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCardIndex++;
    loadCard();
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
        currentCardIndex--;
        loadCard();
    }
});

quitBtn.addEventListener('click', () => {
    switchView('category');
});

function showComplete() {
    switchView('complete');
    document.getElementById('total-reviewed').textContent = activeCards.length;
}

document.getElementById('restart-btn').addEventListener('click', () => {
    // Restart with same settings (reshuffle if checked)
    startSession();
});
document.getElementById('new-decks-btn').addEventListener('click', () => {
    switchView('category');
});

// Start
init();
