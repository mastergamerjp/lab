const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

// Load the script content
const scriptContent = fs.readFileSync('banco-imobiliario/script.js', 'utf8');

// Prepare sandbox factory
function createSandbox() {
    let now = 1000;
    const testableScript = scriptContent.replace(/init\(\);/g, '');
    
    return new Function(`
        const document = { 
            getElementById: (id) => ({
                addEventListener: () => {},
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
                innerHTML: '',
                value: '',
                textContent: ''
            }),
            querySelectorAll: () => [],
            createElement: () => ({ classList: { add: () => {}, remove: () => {} }, style: {}, addEventListener: () => {} })
        };
        const window = { 
            addEventListener: () => {},
            matchMedia: () => ({ matches: false }),
            Intl: Intl
        };
        class MockDate {
            constructor(ts) { this.ts = ts || now; }
            toISOString() { return "2026-05-17T00:00:00.000Z"; }
            toLocaleTimeString() { return "00:00"; }
            static now() { return now++; }
        }
        let now = 1000;
        const Date = MockDate;
        const localStorage = { 
            getItem: (key) => null, 
            setItem: (key, val) => {} 
        };
        const confirm = () => true;
        const alert = () => {};
        
        ${testableScript}
        
        return { 
            addPlayer, 
            updateBalance, 
            transfer, 
            setBalance, 
            rollbackTransaction, 
            getPlayers: () => players, 
            getTransactions: () => transactions 
        };
    `)();
}

test('Banco Imobiliário - Add Player', () => {
    const sandbox = createSandbox();
    const { addPlayer, getPlayers } = sandbox;
    const initialCount = getPlayers().length;
    addPlayer('Test Player', '#ff0000');
    assert.strictEqual(getPlayers().length, initialCount + 1);
    assert.strictEqual(getPlayers()[initialCount].name, 'Test Player');
});

test('Banco Imobiliário - Update Balance', () => {
    const sandbox = createSandbox();
    const { addPlayer, updateBalance, getPlayers } = sandbox;
    addPlayer('Balance Test', '#00ff00');
    const players = getPlayers();
    const player = players[players.length - 1];
    const initialBalance = player.balance;
    
    updateBalance(player.id, 1000);
    assert.strictEqual(player.balance, initialBalance + 1000);
    
    updateBalance(player.id, -500);
    assert.strictEqual(player.balance, initialBalance + 500);
});

test('Banco Imobiliário - Transfer', () => {
    const sandbox = createSandbox();
    const { addPlayer, transfer, getPlayers } = sandbox;
    addPlayer('Sender', '#0000ff');
    addPlayer('Receiver', '#ffff00');
    
    const players = getPlayers();
    const sender = players[players.length - 2];
    const receiver = players[players.length - 1];
    
    sender.balance = 5000;
    receiver.balance = 1000;
    
    const success = transfer(sender.id, receiver.id, 2000);
    assert.strictEqual(success, true);
    assert.strictEqual(sender.balance, 3000);
    assert.strictEqual(receiver.balance, 3000);
    
    const failure = transfer(sender.id, receiver.id, 10000);
    assert.strictEqual(failure, false);
    assert.strictEqual(sender.balance, 3000);
});

test('Banco Imobiliário - Transaction History', () => {
    const sandbox = createSandbox();
    const { addPlayer, updateBalance, getTransactions, getPlayers } = sandbox;
    addPlayer('History Test', '#ff00ff');
    const player = getPlayers()[0];
    
    updateBalance(player.id, 500);
    const transactions = getTransactions();
    assert.strictEqual(transactions.length, 1);
    assert.strictEqual(transactions[0].type, 'RECEIVE');
    assert.strictEqual(transactions[0].amount, 500);
});

test('Banco Imobiliário - Rollback Receive', () => {
    const sandbox = createSandbox();
    const { addPlayer, updateBalance, rollbackTransaction, getPlayers, getTransactions } = sandbox;
    addPlayer('Rollback Test', '#00ffff');
    const player = getPlayers()[0];
    const initialBalance = player.balance;
    
    updateBalance(player.id, 1000);
    assert.strictEqual(player.balance, initialBalance + 1000);
    
    const lastT = getTransactions()[0];
    rollbackTransaction(lastT.id);
    assert.strictEqual(player.balance, initialBalance);
    assert.strictEqual(getTransactions().length, 0);
});

test('Banco Imobiliário - Rollback Transfer', () => {
    const sandbox = createSandbox();
    const { addPlayer, transfer, rollbackTransaction, getPlayers, getTransactions } = sandbox;
    addPlayer('S', '#111111');
    addPlayer('R', '#222222');
    const players = getPlayers();
    const s = players[0];
    const r = players[1];
    
    s.balance = 2000;
    r.balance = 2000;
    
    transfer(s.id, r.id, 500);
    assert.strictEqual(s.balance, 1500);
    assert.strictEqual(r.balance, 2500);
    
    const lastT = getTransactions()[0];
    rollbackTransaction(lastT.id);
    
    assert.strictEqual(s.balance, 2000);
    assert.strictEqual(r.balance, 2000);
});
