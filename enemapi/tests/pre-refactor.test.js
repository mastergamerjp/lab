const fs = require('fs');
const assert = require('node:assert');
const test = require('node:test');

const html = fs.readFileSync('enemapi.html', 'utf8');

test('EnemAPI Monolith Content', () => {
    assert.ok(html.includes('Buscador de Questões ENEM'), 'Title missing');
    assert.ok(html.includes('id="year-select"'), 'Year select missing');
    assert.ok(html.includes('id="result-container"'), 'Result container missing');
    assert.ok(html.includes('function formatArea'), 'formatArea function missing');
});

// Since we cannot easily run the full JS in this environment without a browser/complex setup,
// we will verify the logic by extracting the functions via regex and running them.
const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

function extractFuncBody(name) {
    const match = scriptContent.match(new RegExp(`function ${name}\\s*\\(.*?\\) \\{([\\s\\S]*?)\\n        \\}`, 's'));
    return match ? match[1] : null;
}

test('formatArea Logic', () => {
    const body = extractFuncBody('formatArea');
    if (body) {
        const AREA_MAP = {
            'ciencias-natureza': 'Ciências da Natureza',
            'ciencias-humanas': 'Ciências Humanas',
            'linguagens': 'Linguagens e Códigos',
            'matematica': 'Matemática'
        };
        const formatArea = new Function('disciplineKey', 'const AREA_MAP = ' + JSON.stringify(AREA_MAP) + ';' + body);
        assert.strictEqual(formatArea('matematica'), 'Matemática');
    }
});
