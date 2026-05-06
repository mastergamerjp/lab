const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

const scriptContent = fs.readFileSync('math/script.js', 'utf8');

// Mock React for the script to execute
// Remove React components (JSX) to avoid SyntaxError in Node.js
const logicOnlyScript = scriptContent.split('/**\n * React Components\n */')[0];

const testableScript = `
    const React = { useState: () => [], useEffect: () => {}, useRef: () => ({}) };
    const ReactDOM = { createRoot: () => ({ render: () => {} }) };
    ${logicOnlyScript}
    return { MathUtils, generators };
`;

const sandbox = new Function(testableScript)();

test('MathGen - MathUtils.formatTerm', () => {
    const { formatTerm } = sandbox.MathUtils;
    assert.strictEqual(formatTerm(1, 2, true), "x^{2}");
    assert.strictEqual(formatTerm(-2, 0, false), " - 2");
    assert.strictEqual(formatTerm(3, 1, false), " + 3x");
    assert.strictEqual(formatTerm(0, 5, false), "");
});

test('MathGen - Generators structure', () => {
    const { generators } = sandbox;
    for (const key in generators) {
        const gen = generators[key];
        assert.ok(gen.name, `Generator ${key} missing name`);
        const result = gen.generate();
        assert.ok(result.type, `Generator ${key} result missing type`);
        assert.ok(result.question, `Generator ${key} result missing question`);
        assert.ok(result.answer, `Generator ${key} result missing answer`);
    }
});
