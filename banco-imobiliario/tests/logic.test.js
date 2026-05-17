const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

// Load the script content
const scriptContent = fs.readFileSync('banco-imobiliario/script.js', 'utf8');

// Prepare sandbox
// We strip DOM-dependent initialization to test logic in isolation
const testableScript = scriptContent
    .replace(/init\(\);/g, '');

const sandbox = new Function(`
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
    let now = 1000;
    const window = { 
        addEventListener: () => {},
        matchMedia: () => ({ matches: false }),
        Intl: Intl
    };
    const Date = { now: () => now++ };
    const localStorage = { 
        getItem: (key) => null, 
        setItem: (key, val) => {} 
    };
    const confirm = () => true;
    const alert = () => {};
    
    ${testableScript}
    
    return { addPlayer, updateBalance, transfer, setBalance, getPlayers: () => players };
`)();

test('Banco Imobiliário - Add Player', () => {
    const { addPlayer, getPlayers } = sandbox;
    const initialCount = getPlayers().length;
    addPlayer('Test Player', '#ff0000');
    assert.strictEqual(getPlayers().length, initialCount + 1);
    assert.strictEqual(getPlayers()[initialCount].name, 'Test Player');
});

test('Banco Imobiliário - Update Balance', () => {
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
    assert.strictEqual(sender.balance, 3000); // Should not change on failure
});
