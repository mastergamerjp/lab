const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

const html = fs.readFileSync('math.html', 'utf8');

test('MathGen Monolith Content', () => {
    assert.ok(html.includes('MathGen - Treino de Cálculo e Álgebra'), 'Title missing');
    assert.ok(html.includes('id="root"'), 'Root element missing');
    assert.ok(html.includes('const formatTerm'), 'formatTerm missing');
});

const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

test('formatTerm Logic', () => {
    const match = scriptContent.match(/const formatTerm = \((.*?)\) => \{([\s\S]*?)\n        \};/);
    if (match) {
        const formatTerm = new Function(match[1], match[2]);
        assert.strictEqual(formatTerm(1, 2, true), "x^{2}");
        assert.strictEqual(formatTerm(-1, 1, false), " - x");
    }
});
