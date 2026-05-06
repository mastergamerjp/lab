const { useState, useEffect, useRef } = React;

/**
 * Math Utilities for Problem Generation
 */
const MathUtils = {
    getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    formatTerm: (coef, exp, isFirst) => {
        if (coef === 0) return "";
        let str = "";
        if (coef > 0 && !isFirst) str += " + ";
        if (coef < 0) str += " - ";
        
        const absCoef = Math.abs(coef);
        if (absCoef !== 1 || exp === 0) str += absCoef;
        
        if (exp > 0) str += "x";
        if (exp > 1) str += `^{${exp}}`;
        return str;
    }
};

/**
 * Problem Generators
 */
const generators = {
    derivative: {
        name: "Derivada (Polinomial Simples)",
        generate: () => {
            const terms = MathUtils.getRandomInt(2, 4);
            let funcStr = "";
            let derivStr = "";
            let isFirst = true;

            for (let i = terms; i >= 0; i--) {
                if (i < terms && Math.random() > 0.6) continue; 
                const coef = MathUtils.getRandomInt(-9, 9);
                if (coef === 0) continue;

                funcStr += MathUtils.formatTerm(coef, i, isFirst);
                if (i > 0) derivStr += MathUtils.formatTerm(coef * i, i - 1, isFirst);
                isFirst = false;
            }
            if (derivStr === "") derivStr = "0";
            if (funcStr === "") funcStr = "0";

            return {
                type: "Cálculo",
                question: `\\text{Calcule a derivada de: } f(x) = ${funcStr}`,
                answer: `f'(x) = ${derivStr}`
            };
        }
    },
    derivativeRules: {
        name: "Derivada (Produto, Cadeia, Mista)",
        generate: () => {
            const mode = MathUtils.getRandomInt(1, 3);
            
            if (mode === 1) { // Produto
                const n = MathUtils.getRandomInt(1, 3);
                const term1 = n === 1 ? "x" : `x^${n}`;
                const term1D = n === 1 ? "1" : `${n}x^${n-1}`;
                const funcType = MathUtils.getRandomInt(0, 1);
                let term2, term2D;
                if (funcType === 0) { term2 = "\\sin(x)"; term2D = "\\cos(x)"; }
                else { term2 = "e^x"; term2D = "e^x"; }
                
                return {
                    type: "Regra do Produto",
                    question: `\\text{Calcule a derivada: } f(x) = ${term1} \\cdot ${term2}`,
                    answer: `f'(x) = (${term1})'(${term2}) + (${term1})(${term2})' = ${term1D}${term2} + ${term1}${term2D}`
                };
            } else if (mode === 2) { // Cadeia
                const subMode = MathUtils.getRandomInt(0, 1);
                if (subMode === 0) {
                    const a = MathUtils.getRandomInt(2, 5);
                    const b = MathUtils.getRandomInt(1, 9);
                    const n = MathUtils.getRandomInt(3, 5);
                    const sign = Math.random() > 0.5 ? "+" : "-";
                    const inner = `${a}x ${sign} ${b}`;
                    return {
                        type: "Regra da Cadeia",
                        question: `\\text{Calcule a derivada: } f(x) = (${inner})^{${n}}`,
                        answer: `f'(x) = ${n}(${inner})^{${n-1}} \\cdot (${a}) = ${n*a}(${inner})^{${n-1}}`
                    };
                } else {
                    const a = MathUtils.getRandomInt(2, 5);
                    const isSin = Math.random() > 0.5;
                    const inner = `${a}x`;
                    const func = isSin ? `\\sin(${inner})` : `\\cos(${inner})`;
                    const deriv = isSin ? `${a}\\cos(${inner})` : `-${a}\\sin(${inner})`;
                    return {
                        type: "Regra da Cadeia",
                        question: `\\text{Calcule a derivada: } f(x) = ${func}`,
                        answer: `f'(x) = ${deriv}`
                    };
                }
            } else { // Soma Mista
                const a = MathUtils.getRandomInt(2, 5);
                const n = MathUtils.getRandomInt(2, 4);
                return {
                    type: "Regra da Soma (Mista)",
                    question: `\\text{Calcule: } f(x) = ${a}x^${n} + \\ln(x) + \\cos(x)`,
                    answer: `f'(x) = ${a*n}x^${n-1} + \\frac{1}{x} - \\sin(x)`
                };
            }
        }
    },
    integral: {
        name: "Integral Indefinida (Simples)",
        generate: () => {
            const terms = MathUtils.getRandomInt(1, 3);
            let funcStr = "";
            let integralStr = "";
            let isFirst = true;

            for (let i = terms; i >= 0; i--) {
                const power = i;
                const newPower = i + 1;
                let coef = MathUtils.getRandomInt(-5, 5) * newPower; 
                if (coef === 0) coef = newPower; 

                funcStr += MathUtils.formatTerm(coef, power, isFirst);
                integralStr += MathUtils.formatTerm(coef / newPower, newPower, isFirst);
                isFirst = false;
            }

            return {
                type: "Cálculo",
                question: `\\text{Calcule a integral: } \\int (${funcStr}) \\, dx`,
                answer: `${integralStr} + C`
            };
        }
    },
    dotProduct: {
        name: "Produto Escalar",
        generate: () => {
            const size = MathUtils.getRandomInt(2, 3);
            const v1 = Array.from({length: size}, () => MathUtils.getRandomInt(-5, 8));
            const v2 = Array.from({length: size}, () => MathUtils.getRandomInt(-5, 8));
            const result = v1.reduce((acc, val, idx) => acc + (val * v2[idx]), 0);
            const vecToTex = (v) => `\\begin{pmatrix} ${v.join(" \\\\ ")} \\end{pmatrix}`;

            return {
                type: "Álgebra Linear",
                question: `\\text{Calcule } u \\cdot v: \\quad u = ${vecToTex(v1)}, \\; v = ${vecToTex(v2)}`,
                answer: `u \\cdot v = ${result}`
            };
        }
    },
    matrixMult: {
        name: "Multiplicação de Matrizes (2x2)",
        generate: () => {
            const a11 = MathUtils.getRandomInt(-3, 5), a12 = MathUtils.getRandomInt(-3, 5);
            const a21 = MathUtils.getRandomInt(-3, 5), a22 = MathUtils.getRandomInt(-3, 5);
            const b11 = MathUtils.getRandomInt(-3, 5), b12 = MathUtils.getRandomInt(-3, 5);
            const b21 = MathUtils.getRandomInt(-3, 5), b22 = MathUtils.getRandomInt(-3, 5);

            const c11 = a11*b11 + a12*b21;
            const c12 = a11*b12 + a12*b22;
            const c21 = a21*b11 + a22*b21;
            const c22 = a21*b12 + a22*b22;

            return {
                type: "Álgebra Linear",
                question: `\\text{Calcule } A \\times B: \\quad A = \\begin{pmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{pmatrix}, \\; B = \\begin{pmatrix} ${b11} & ${b12} \\\\ ${b21} & ${b22} \\end{pmatrix}`,
                answer: `AB = \\begin{pmatrix} ${c11} & ${c12} \\\\ ${c21} & ${c22} \\end{pmatrix}`
            };
        }
    },
    linearComb: {
        name: "Combinação Linear",
        generate: () => {
            const c1 = MathUtils.getRandomInt(-3, 4);
            const c2 = MathUtils.getRandomInt(-3, 4);
            const v1 = [MathUtils.getRandomInt(1, 5), MathUtils.getRandomInt(-2, 2)];
            const v2 = [MathUtils.getRandomInt(-2, 2), MathUtils.getRandomInt(1, 5)];

            const resX = c1*v1[0] + c2*v2[0];
            const resY = c1*v1[1] + c2*v2[1];

            return {
                type: "Álgebra Linear",
                question: `\\text{Sendo } v_1 = (${v1[0]}, ${v1[1]}) \\text{ e } v_2 = (${v2[0]}, ${v2[1]}), \\text{ calcule: } w = ${c1}v_1 + ${c2}v_2`,
                answer: `w = (${resX}, ${resY})`
            };
        }
    }
};

/**
 * React Components
 */

const KatexRenderer = ({ tex }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        if (typeof window.katex === 'undefined') {
            containerRef.current.textContent = tex;
            return;
        }

        try {
            window.katex.render(tex, containerRef.current, {
                throwOnError: false,
                displayMode: true
            });
            setError(false);
        } catch (e) {
            console.error("Katex Error:", e);
            setError(true);
            containerRef.current.textContent = tex;
        }
    }, [tex]);

    return <div ref={containerRef} className={`text-slate-800 ${error ? 'text-red-500 text-sm' : ''}`} />;
};

const FormulaModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <h2 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                        <i className="ph-bold ph-function"></i>
                        Fórmulas Úteis
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
                        aria-label="Fechar"
                    >
                        <i className="ph-bold ph-x text-2xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-10">
                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Derivadas Básicas</h3>
                        <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                            <div className="text-center">
                                <KatexRenderer tex="f(x) = x^n \implies f'(x) = nx^{n-1}" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="(\sin x)' = \cos x" />
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="(\cos x)' = -\sin x" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="(e^x)' = e^x" />
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="(\ln x)' = \frac{1}{x}" />
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Regras de Derivação</h3>
                        <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 mb-2">PRODUTO</p>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="(u \cdot v)' = u'v + uv'" />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 mb-2">CADEIA</p>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                    <KatexRenderer tex="[f(g(x))]' = f'(g(x)) \cdot g'(x)" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Cálculo Integral</h3>
                        <div className="bg-indigo-50/50 p-6 rounded-2xl">
                            <KatexRenderer tex="\int x^n dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)" />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Álgebra Linear</h3>
                        <div className="bg-slate-50 p-6 rounded-2xl">
                            <p className="text-xs font-semibold text-slate-400 mb-3">PRODUTO ESCALAR</p>
                            <KatexRenderer tex="u \cdot v = \sum_{i=1}^n u_i v_i = |u||v|\cos \theta" />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 text-center">
                    <button 
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Entendi!
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [topic, setTopic] = useState("derivative");
    const [problem, setProblem] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showFormulas, setShowFormulas] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loader = document.getElementById('loading-fallback');
        if(loader) loader.style.display = 'none';

        const checkKatex = setInterval(() => {
            if (window.katex) {
                setIsReady(true);
                clearInterval(checkKatex);
                setProblem(generators["derivative"].generate());
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkKatex);
            setIsReady(true);
            if(!problem) setProblem(generators["derivative"].generate());
        }, 3000);

        return () => clearInterval(checkKatex);
    }, []);

    const generateProblem = () => {
        setAnimating(true);
        setShowAnswer(false);
        
        setTimeout(() => {
            const gen = generators[topic];
            setProblem(gen.generate());
            setAnimating(false);
        }, 150);
    };

    if (!isReady) return null;

    return (
        <div className="min-h-screen flex flex-col items-center py-10 px-4 relative">
            <button 
                onClick={() => setShowFormulas(true)}
                className="fixed top-4 right-4 z-40 bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-indigo-100"
                title="Fórmulas"
            >
                <i className="ph ph-function text-2xl"></i>
            </button>

            <div className="w-full max-w-2xl mt-8">
                <header className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
                        <i className="ph ph-radical text-4xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">MathGen</h1>
                    <p className="text-slate-500 mt-1">Treino infinito de Cálculo e Álgebra</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-6 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ph ph-list text-slate-400"></i>
                        </div>
                        <select 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 bg-transparent text-slate-700 focus:outline-none cursor-pointer font-medium appearance-none rounded-xl hover:bg-slate-50 transition"
                        >
                            {Object.entries(generators).map(([key, val]) => (
                                <option key={key} value={key}>{val.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="ph ph-caret-down text-slate-400"></i>
                        </div>
                    </div>
                    <button 
                        onClick={generateProblem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition active:transform active:scale-95 flex items-center justify-center gap-2 min-w-[160px]"
                    >
                        <i className="ph ph-arrows-clockwise text-lg font-bold"></i>
                        Gerar Novo
                    </button>
                </div>

                <div className={`transition-all duration-200 ${animating ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
                    {problem && (
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-8 text-center min-h-[160px] flex flex-col items-center justify-center">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide mb-4">
                                    {problem.type}
                                </span>
                                <div className="text-xl sm:text-2xl text-slate-800 font-medium w-full overflow-x-auto">
                                    <KatexRenderer tex={problem.question} />
                                </div>
                            </div>

                            <div className="bg-slate-50 border-t border-slate-200/60">
                                <div className={`transition-all duration-500 ease-out overflow-hidden ${showAnswer ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 text-center border-b border-slate-200/60">
                                        <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                            <i className="ph ph-check-circle"></i> Solução
                                        </p>
                                        <div className="text-lg text-slate-700 overflow-x-auto">
                                            <KatexRenderer tex={problem.answer} />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowAnswer(!showAnswer)}
                                    className="w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50/50 transition active:bg-indigo-100"
                                >
                                    {showAnswer ? "Esconder Resposta" : "Exibir Resposta"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FormulaModal isOpen={showFormulas} onClose={() => setShowFormulas(false)} />
            
            <div className="mt-8 text-center text-slate-400 text-xs">
                Desenvolvido para treino rápido de matemática.
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
