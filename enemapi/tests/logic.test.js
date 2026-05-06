const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

// Load the script content
const scriptContent = fs.readFileSync('enemapi/script.js', 'utf8');

// Prepare sandbox
// We remove 'export' and 'DOMContentLoaded' listener to test functions in isolation
const testableScript = scriptContent
    .replace(/export /g, '')
    .replace(/document\.addEventListener\('DOMContentLoaded', init\);/g, '');

const sandbox = new Function(`
    const document = { 
        getElementById: () => ({ addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } }),
        querySelectorAll: () => []
    };
    const window = { addEventListener: () => {} };
    const localStorage = { getItem: () => null, setItem: () => null };
    ${testableScript}
    return { formatArea, parseContext, getQuestionIndexByArea };
`)();

test('EnemAPI - formatArea', () => {
    assert.strictEqual(sandbox.formatArea('matematica'), 'Matemática');
    assert.strictEqual(sandbox.formatArea('ciencias-natureza'), 'Ciências da Natureza');
    assert.strictEqual(sandbox.formatArea('unknown'), 'unknown');
});

test('EnemAPI - parseContext', () => {
    const markdown = 'Texto base\n![](http://image.png)';
    const html = sandbox.parseContext(markdown);
    assert.ok(html.includes('<br>'));
    assert.ok(html.includes('<img src="http://image.png"'));
});

test('EnemAPI - getQuestionIndexByArea', () => {
    const mathIdx = sandbox.getQuestionIndexByArea('matematica');
    assert.ok(mathIdx >= 136 && mathIdx <= 180);
    
    const randomIdx = sandbox.getQuestionIndexByArea('');
    assert.ok(randomIdx >= 1 && randomIdx <= 180);
});
