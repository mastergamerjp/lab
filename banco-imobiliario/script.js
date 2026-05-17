/**
 * Banco Imobiliário - Maquininha Digital Logic
 */

// --- Constants & Config ---
const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#71717a'  // gray
];

// --- State Management ---
let players = JSON.parse(localStorage.getItem('bi_players')) || [];
let transactions = JSON.parse(localStorage.getItem('bi_transactions')) || [];
let initialBalance = parseInt(localStorage.getItem('bi_initial_balance')) || 25000;

// --- DOM Elements ---
const playersContainer = document.getElementById('players-container');
const emptyState = document.getElementById('empty-state');
const playerCountSpan = document.getElementById('player-count');
const addPlayerForm = document.getElementById('add-player-form');
const playerNameInput = document.getElementById('player-name-input');
const playerColorInput = document.getElementById('player-color-input');
const colorPicker = document.getElementById('color-picker');
const initialBalanceInput = document.getElementById('initial-balance-input');
const resetAllBtn = document.getElementById('reset-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');

// --- Initialization ---
function init() {
    setupColorPicker();
    renderPlayers();
    setupEventListeners();
    applyTheme();
    initialBalanceInput.value = initialBalance;
}

function setupColorPicker() {
    colorPicker.innerHTML = '';
    COLORS.forEach(color => {
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.backgroundColor = color;
        if (color === playerColorInput.value) dot.classList.add('selected');
        
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
            dot.classList.add('selected');
            playerColorInput.value = color;
        });
        colorPicker.appendChild(dot);
    });
}

function setupEventListeners() {
    addPlayerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addPlayer(playerNameInput.value, playerColorInput.value);
        playerNameInput.value = '';
    });

    initialBalanceInput.addEventListener('change', (e) => {
        initialBalance = parseInt(e.target.value) || 0;
        localStorage.setItem('bi_initial_balance', initialBalance);
    });

    resetAllBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja resetar todos os jogadores e saldos?')) {
            players = [];
            saveAndRender();
        }
    });

    themeToggle.addEventListener('click', toggleTheme);
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// --- Player Actions ---
function addPlayer(name, color) {
    const player = {
        id: Date.now().toString(),
        name,
        color,
        balance: initialBalance
    };
    players.push(player);
    saveAndRender();
}

function deletePlayer(id) {
    if (confirm('Remover este cartão?')) {
        players = players.filter(p => p.id !== id);
        saveAndRender();
    }
}

function updateBalance(id, amount) {
    const player = players.find(p => p.id === id);
    if (player) {
        player.balance += amount;
        const type = amount > 0 ? 'RECEIVE' : 'PAY';
        const desc = amount > 0 ? `Recebeu ${formatValue(amount)}` : `Pagou ${formatValue(Math.abs(amount))}`;
        addTransaction(type, id, null, Math.abs(amount), desc);
    }
}

function setBalance(id, amount) {
    const player = players.find(p => p.id === id);
    if (player) {
        const oldBalance = player.balance;
        player.balance = amount;
        addTransaction('EDIT', id, null, amount, `Saldo alterado para ${formatValue(amount)}`, oldBalance);
    }
}

function transfer(fromId, toId, amount) {
    const fromPlayer = players.find(p => p.id === fromId);
    const toPlayer = players.find(p => p.id === toId);
    
    if (fromPlayer && toPlayer && fromPlayer.balance >= amount) {
        fromPlayer.balance -= amount;
        toPlayer.balance += amount;
        addTransaction('TRANSFER', fromId, toId, amount, `Transferiu ${formatValue(amount)} para ${toPlayer.name}`);
        return true;
    }
    return false;
}

function formatValue(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value).replace('R$', '₩');
}

// Update addTransaction to accept oldBalance for EDIT
function addTransaction(type, fromId, toId, amount, description, oldBalance = null) {
    const transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        type,
        fromId,
        toId,
        amount,
        description,
        oldBalance
    };
    transactions.unshift(transaction); 
    saveAndRender();
}

function rollbackTransaction(transactionId) {
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return;
    
    const t = transactions[index];
    
    if (t.type === 'TRANSFER') {
        const fromPlayer = players.find(p => p.id === t.fromId);
        const toPlayer = players.find(p => p.id === t.toId);
        if (fromPlayer && toPlayer) {
            fromPlayer.balance += t.amount;
            toPlayer.balance -= t.amount;
        }
    } else if (t.type === 'RECEIVE' || t.type === 'PAY' || t.type === 'EDIT') {
        const player = players.find(p => p.id === t.fromId);
        if (player) {
            if (t.type === 'RECEIVE') player.balance -= t.amount;
            if (t.type === 'PAY') player.balance += Math.abs(t.amount);
            if (t.type === 'EDIT') player.balance = t.oldBalance; // Need to store oldBalance for EDIT
        }
    }
    
    transactions.splice(index, 1);
    saveAndRender();
}

// --- Rendering ---
function saveAndRender() {
    localStorage.setItem('bi_players', JSON.stringify(players));
    localStorage.setItem('bi_transactions', JSON.stringify(transactions));
    renderPlayers();
}

function renderPlayers() {
    playersContainer.innerHTML = '';
    
    if (players.length === 0) {
        emptyState.classList.remove('hidden');
        playerCountSpan.textContent = '0 jogadores';
    } else {
        emptyState.classList.add('hidden');
        playerCountSpan.textContent = `${players.length} jogador(es)`;
        
        players.forEach(player => {
            const card = createPlayerCard(player);
            playersContainer.appendChild(card);
        });
    }
}

function createPlayerCard(player) {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 card-glow flex flex-col';
    
    const formattedBalance = formatValue(player.balance);

    // Get last transaction for this player
    const lastT = transactions.find(t => t.fromId === player.id || t.toId === player.id);
    let historyHtml = `
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider italic">Nenhuma movimentação</span>
        </div>
    `;

    if (lastT) {
        const isAgent = lastT.fromId === player.id;
        historyHtml = `
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end gap-2">
                <div class="flex-grow min-w-0">
                    <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Última Movimentação</span>
                    <p class="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">${lastT.description}</p>
                </div>
                ${isAgent ? `
                <button onclick="rollbackTransaction('${lastT.id}')" class="flex-shrink-0 p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500 rounded-lg transition-colors" title="Desfazer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                ` : ''}
            </div>
        `;
    }

    div.innerHTML = `
        <div class="h-2" style="background-color: ${player.color}"></div>
        <div class="p-5 flex-grow flex flex-col">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-lg">${player.name}</h3>
                    <p class="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1">${formattedBalance}</p>
                </div>
                <button onclick="deletePlayer('${player.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-2 mt-auto">
                <button onclick="openReceiveModal('${player.id}')" class="flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 py-2 rounded-lg font-bold text-sm hover:bg-emerald-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Receber
                </button>
                <button onclick="openPayModal('${player.id}')" class="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                    Pagar
                </button>
                <button onclick="openTransferModal('${player.id}')" class="col-span-2 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    Transferir
                </button>
                <button onclick="openEditModal('${player.id}')" class="col-span-2 text-gray-400 text-[10px] hover:text-gray-600 dark:hover:text-gray-200 py-1 transition-colors uppercase font-bold tracking-tighter">
                    Editar Saldo Manualmente
                </button>
            </div>
            ${historyHtml}
        </div>
    `;
    return div;
}

// --- Modals ---
function openModal(contentHtml) {
    modalContent.innerHTML = contentHtml;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
}

window.openReceiveModal = (id) => {
    const player = players.find(p => p.id === id);
    openModal(`
        <h2 class="text-xl font-bold mb-4">Receber Valor</h2>
        <p class="text-sm text-gray-500 mb-4">Adicionar saldo para <strong>${player.name}</strong></p>
        <div class="space-y-4">
            <input type="number" id="modal-amount" autofocus placeholder="Valor (ex: 2000)" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold">
            <div class="grid grid-cols-2 gap-3">
                <button onclick="closeModal()" class="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">Cancelar</button>
                <button onclick="confirmReceive('${id}')" class="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold">Confirmar</button>
            </div>
        </div>
    `);
};

window.confirmReceive = (id) => {
    const amount = parseInt(document.getElementById('modal-amount').value);
    if (amount > 0) {
        updateBalance(id, amount);
        closeModal();
    }
};

window.openPayModal = (id) => {
    const player = players.find(p => p.id === id);
    openModal(`
        <h2 class="text-xl font-bold mb-4">Pagar Valor</h2>
        <p class="text-sm text-gray-500 mb-4">Subtrair saldo de <strong>${player.name}</strong></p>
        <div class="space-y-4">
            <input type="number" id="modal-amount" autofocus placeholder="Valor (ex: 500)" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-xl font-bold">
            <div class="grid grid-cols-2 gap-3">
                <button onclick="closeModal()" class="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">Cancelar</button>
                <button onclick="confirmPay('${id}')" class="py-3 px-4 rounded-xl bg-red-600 text-white font-bold">Confirmar</button>
            </div>
        </div>
    `);
};

window.confirmPay = (id) => {
    const amount = parseInt(document.getElementById('modal-amount').value);
    if (amount > 0) {
        updateBalance(id, -amount);
        closeModal();
    }
};

window.openEditModal = (id) => {
    const player = players.find(p => p.id === id);
    openModal(`
        <h2 class="text-xl font-bold mb-4">Editar Saldo</h2>
        <p class="text-sm text-gray-500 mb-4">Definir novo saldo para <strong>${player.name}</strong></p>
        <div class="space-y-4">
            <input type="number" id="modal-amount" value="${player.balance}" autofocus class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold">
            <div class="grid grid-cols-2 gap-3">
                <button onclick="closeModal()" class="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">Cancelar</button>
                <button onclick="confirmEdit('${id}')" class="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold">Salvar</button>
            </div>
        </div>
    `);
};

window.confirmEdit = (id) => {
    const amount = parseInt(document.getElementById('modal-amount').value);
    if (!isNaN(amount)) {
        setBalance(id, amount);
        closeModal();
    }
};

window.openTransferModal = (id) => {
    const fromPlayer = players.find(p => p.id === id);
    const otherPlayers = players.filter(p => p.id !== id);
    
    if (otherPlayers.length === 0) {
        alert('É necessário ter pelo menos outro jogador para transferir.');
        return;
    }

    let optionsHtml = otherPlayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    openModal(`
        <h2 class="text-xl font-bold mb-4">Transferência</h2>
        <p class="text-sm text-gray-500 mb-4">De: <strong>${fromPlayer.name}</strong></p>
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold uppercase text-gray-400 mb-1">Para:</label>
                <select id="modal-to-id" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none">
                    ${optionsHtml}
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold uppercase text-gray-400 mb-1">Valor:</label>
                <input type="number" id="modal-amount" autofocus placeholder="Ex: 1000" class="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <button onclick="closeModal()" class="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">Cancelar</button>
                <button onclick="confirmTransfer('${id}')" class="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold">Transferir</button>
            </div>
        </div>
    `);
};

window.openHistoryModal = () => {
    let historyLines = transactions.map(t => {
        const date = new Date(t.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div class="text-[10px] font-bold text-gray-400 min-w-[40px]">${date}</div>
                <div class="flex-grow">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">${t.description}</p>
                </div>
            </div>
        `;
    }).join('');

    if (transactions.length === 0) {
        historyLines = '<p class="text-center py-8 text-gray-400 italic">Nenhuma movimentação registrada.</p>';
    }

    openModal(`
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Histórico Geral</h2>
            <button onclick="clearHistory()" class="text-xs text-red-500 font-bold uppercase hover:underline">Limpar</button>
        </div>
        <div class="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            ${historyLines}
        </div>
        <button onclick="closeModal()" class="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold">Fechar</button>
    `);
};

window.clearHistory = () => {
    if (confirm('Deseja limpar todo o histórico? (Saldos não serão afetados)')) {
        transactions = [];
        saveAndRender();
        closeModal();
    }
};

// --- Theme Management ---
function applyTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-toggle-light-icon').classList.remove('hidden');
        document.getElementById('theme-toggle-dark-icon').classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-toggle-light-icon').classList.add('hidden');
        document.getElementById('theme-toggle-dark-icon').classList.remove('hidden');
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    applyTheme();
}

// Start
init();
