/**
 * ENEM Question Renderer
 * Handles fetching, parsing, and rendering ENEM questions from api.enem.dev
 */

// --- Constants & Configuration ---
const AREA_MAP = {
    'ciencias-natureza': 'Ciências da Natureza',
    'ciencias-humanas': 'Ciências Humanas',
    'linguagens': 'Linguagens e Códigos',
    'matematica': 'Matemática'
};

const API_BASE_URL = 'https://api.enem.dev/v1/exams';

// --- Application State ---
let currentCorrectAnswer = null;
let currentQuestionData = null;

// --- DOM Elements ---

// Search UI
const yearSelect = document.getElementById('year-select');
const areaSelect = document.getElementById('area-select');
const indexInput = document.getElementById('index-input');
const randomBtn = document.getElementById('random-btn');
const specificBtn = document.getElementById('specific-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const welcomePlaceholder = document.getElementById('welcome-placeholder');

// Question Renderer
const resultContainer = document.getElementById('result-container');
const questionIndex = document.getElementById('question-index');
const questionYear = document.getElementById('question-year');
const questionArea = document.getElementById('question-area');
const questionContext = document.getElementById('question-context');
const questionEnunciadoDiv = document.getElementById('question-enunciado-div');
const questionEnunciadoContent = document.getElementById('question-enunciado-content');
const optionsList = document.getElementById('options-list');

// Feedback & Stats
const saveStatus = document.getElementById('save-status');
const statsTotal = document.getElementById('stats-total');
const statsCorrect = document.getElementById('stats-correct');
const statsIncorrect = document.getElementById('stats-incorrect');

// --- Helper Functions ---

/**
 * Populates the year dropdown with ENEM exam years.
 */
function populateYears() {
    const currentYear = 2023; // Last available year in the API
    const startYear = 2009;
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

/**
 * Maps API discipline keys to friendly Brazilian Portuguese names.
 */
function formatArea(disciplineKey) {
    return AREA_MAP[disciplineKey] || disciplineKey;
}

/**
 * Displays an error message to the user.
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');
    welcomePlaceholder.classList.add('hidden');
}

/**
 * Resets the question UI before rendering a new one.
 */
function resetResultUI() {
    resultContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    
    saveStatus.classList.add('opacity-0');
    optionsList.innerHTML = '';
    optionsList.classList.remove('answered');
    questionContext.innerHTML = '';
    currentCorrectAnswer = null;
    currentQuestionData = null;

    // Reset previous answer highlights
    document.querySelectorAll('[data-letter]').forEach(el => {
        el.classList.remove('bg-green-100', 'bg-red-100', 'border-green-500', 'border-red-500', 'ring-2');
    });
}

/**
 * Parses markdown-style context strings (images and line breaks) into HTML.
 */
function parseContext(contextString) {
    if (!contextString) return '';

    // Convert ![] (url) to <img ...>
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let html = contextString.replace(
        imgRegex, 
        '<img src="$1" alt="Context image" class="w-full max-w-md mx-auto rounded-lg shadow-sm border my-4">'
    );
    
    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

/**
 * Returns a random question number based on the selected area.
 */
function getQuestionIndexByArea(area) {
    switch (area) {
        case "": return Math.floor(Math.random() * 180) + 1;
        case "linguagens": return Math.floor(Math.random() * 45) + 1;
        case "ciencias-humanas": return Math.floor(Math.random() * 45) + 46;
        case "ciencias-natureza": return Math.floor(Math.random() * 45) + 91;
        case "matematica": return Math.floor(Math.random() * 45) + 136;
        default: return Math.floor(Math.random() * 180) + 1;
    }
}

// --- core Functionality ---

/**
 * Renders a question object into the DOM.
 */
export function renderQuestion(questionData) {
    resetResultUI();
    welcomePlaceholder.classList.add('hidden');

    currentQuestionData = questionData;
    currentCorrectAnswer = questionData.correctAlternative;

    // Header info
    questionIndex.textContent = questionData.index;
    questionYear.textContent = questionData.year;
    questionArea.textContent = formatArea(questionData.discipline);

    // Context (text + images)
    const contextHtml = parseContext(questionData.context);
    if (contextHtml) {
        questionContext.innerHTML = contextHtml;
        questionContext.classList.remove('hidden');
    } else {
        questionContext.classList.add('hidden');
    }

    // Enunciado
    if (questionData.alternativesIntroduction) {
        questionEnunciadoContent.textContent = questionData.alternativesIntroduction;
        questionEnunciadoDiv.classList.remove('hidden');
    } else {
        questionEnunciadoDiv.classList.add('hidden');
    }

    // Alternatives
    questionData.alternatives.forEach(alt => {
        const optionElement = document.createElement('div');
        optionElement.className = 'border p-3 rounded-lg text-gray-700 transition duration-200 cursor-pointer hover:bg-gray-100 group';
        optionElement.setAttribute('data-letter', alt.letter);
        
        let optionHTML = `
            <div class="flex items-start">
                <span class="font-bold mr-3 bg-gray-200 px-2 py-1 rounded group-hover:bg-blue-200 transition-colors">${alt.letter}</span>
                <span class="flex-grow">${alt.text}</span>
            </div>
        `;
        
        if (alt.file) {
            optionHTML += `<img src="${alt.file}" alt="Alternative ${alt.letter}" class="w-full max-w-sm mx-auto rounded-lg shadow-sm border mt-3">`;
        }
        
        optionElement.innerHTML = optionHTML;

        // Auto-validate on click
        optionElement.addEventListener('click', () => {
            if (optionElement.classList.contains('pointer-events-none') || document.querySelector('.answered')) return;
            handleOptionSelection(alt.letter);
        });

        optionsList.appendChild(optionElement);
    });

    resultContainer.classList.remove('hidden');
}

/**
 * Handles the logic when a user selects an option.
 */
function handleOptionSelection(selectedLetter) {
    const isCorrect = selectedLetter === currentCorrectAnswer;
    
    // Mark as answered
    optionsList.classList.add('answered');
    document.querySelectorAll('[data-letter]').forEach(el => {
        el.classList.add('pointer-events-none');
        const letter = el.getAttribute('data-letter');
        
        if (letter === currentCorrectAnswer) {
            el.classList.add('bg-green-100', 'border-green-500', 'ring-2', 'ring-green-500');
            el.querySelector('span.font-bold').classList.replace('bg-gray-200', 'bg-green-500');
            el.querySelector('span.font-bold').classList.add('text-white');
        } else if (letter === selectedLetter && !isCorrect) {
            el.classList.add('bg-red-100', 'border-red-500', 'ring-2', 'ring-red-500');
            el.querySelector('span.font-bold').classList.replace('bg-gray-200', 'bg-red-500');
            el.querySelector('span.font-bold').classList.add('text-white');
        }
    });

    saveProgress(isCorrect);
}

// --- Data & Persistence ---

async function fetchQuestion(year, index) {
    const response = await fetch(`${API_BASE_URL}/${year}/questions/${index}`);
    if (!response.ok) throw new Error('Question not found');
    return await response.json();
}

/**
 * Updates the stats UI from localStorage.
 */
function updateStats() {
    const history = JSON.parse(localStorage.getItem('enem_history') || '[]');
    const correct = history.filter(q => q.isCorrect).length;
    const incorrect = history.length - correct;
    
    statsTotal.textContent = history.length;
    statsCorrect.textContent = correct;
    statsIncorrect.textContent = incorrect;
}

/**
 * Persists user performance for a question.
 */
function saveProgress(isCorrect) {
    if (!currentQuestionData) return;

    const history = JSON.parse(localStorage.getItem('enem_history') || '[]');
    const questionId = `${currentQuestionData.year}-${currentQuestionData.index}`;
    
    const filteredHistory = history.filter(q => q.id !== questionId);
    
    filteredHistory.push({
        id: questionId,
        year: currentQuestionData.year,
        area: currentQuestionData.discipline,
        isCorrect: isCorrect,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('enem_history', JSON.stringify(filteredHistory));
    
    saveStatus.classList.remove('opacity-0');
    setTimeout(() => saveStatus.classList.add('opacity-0'), 2000);
    updateStats();
}

// --- Initialization ---

function init() {
    populateYears();
    updateStats();

    randomBtn.addEventListener('click', async () => {
        const year = yearSelect.value;
        const area = areaSelect.value;
        if (!year) {
            showError('Por favor, selecione um ano primeiro.');
            return;
        }
        resetResultUI();
        loadingIndicator.classList.remove('hidden');
        welcomePlaceholder.classList.add('hidden');
        try {
            const index = getQuestionIndexByArea(area);
            const data = await fetchQuestion(year, index);
            renderQuestion(data);
        } catch (err) {
            showError('Erro ao buscar questão aleatória. Tente novamente.');
        }
    });

    specificBtn.addEventListener('click', async () => {
        const year = yearSelect.value;
        const index = indexInput.value;
        if (!year || !index) {
            showError('Por favor, informe o ano e o número da questão.');
            return;
        }
        resetResultUI();
        loadingIndicator.classList.remove('hidden');
        welcomePlaceholder.classList.add('hidden');
        try {
            const data = await fetchQuestion(year, index);
            renderQuestion(data);
        } catch (err) {
            showError('Questão não encontrada ou erro na API.');
        }
    });
}

// Global expose if needed, but preferably use modules
window.renderQuestion = renderQuestion;

document.addEventListener('DOMContentLoaded', init);
