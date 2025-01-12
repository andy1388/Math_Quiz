document.addEventListener('DOMContentLoaded', async () => {
    const operationType = document.getElementById('operation-type');
    const difficulty = document.getElementById('difficulty');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const generatedQuestion = document.querySelector('.generated-question');
    const stepsContainer = document.querySelector('.steps-container');
    const equationInput = document.getElementById('equation-input');
    const previewContent = document.querySelector('.preview-content');

    // 添加加載難度信息的函數
    async function loadDifficulties(type) {
        try {
            const response = await fetch(`/api/solver/difficulties/${type}`);
            if (!response.ok) {
                throw new Error('獲取難度信息失敗');
            }

            const difficulties = await response.json();
            
            // 更新難度選擇器
            difficulty.innerHTML = difficulties.map(diff => `
                <option value="${diff.level}">Level ${diff.level} - ${diff.name} [${diff.description}]</option>
            `).join('');

            // 更新提示信息
            const infoText = document.querySelector('.info-text');
            if (infoText) {
                infoText.textContent = `選擇不同難度等級來練習不同類型的${type === 'addition' ? '加法' : ''}題目`;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('加載難度信息失敗：' + error.message);
        }
    }

    // 當運算類型改變時加載相應的難度信息
    operationType.addEventListener('change', () => {
        loadDifficulties(operationType.value);
    });

    // 初始加載難度信息
    await loadDifficulties('addition');

    generateBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/solver/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: operationType.value,
                    difficulty: parseInt(difficulty.value)
                })
            });

            if (!response.ok) {
                throw new Error('生成失敗');
            }

            const data = await response.json();
            
            // 更新生成記錄
            const historyList = document.getElementById('history-list');
            const listItem = document.createElement('li');
            
            // 创建一个容器来包装分数
            const fractionContainer = document.createElement('div');
            fractionContainer.style.display = 'inline-block';
            fractionContainer.style.verticalAlign = 'middle';
            fractionContainer.innerHTML = `\\[${data.question}\\]`;
            
            // 创建难度标签
            const difficultyLabel = document.createElement('span');
            difficultyLabel.className = `difficulty-label level-${difficulty.value}`;
            difficultyLabel.textContent = `Level ${difficulty.value}`;
            
            // 将元素添加到列表项
            listItem.appendChild(fractionContainer);
            listItem.appendChild(difficultyLabel);
            
            // 添加点击事件
            listItem.addEventListener('click', () => {
                const equation = data.question;
                equationInput.value = equation;
                previewContent.innerHTML = `\\[${equation}\\]`;
                MathJax.typesetPromise();
                solveEquation(equation, operationType.value, difficulty.value);
            });

            // 将新记录添加到列表顶部
            if (historyList.firstChild) {
                historyList.insertBefore(listItem, historyList.firstChild);
            } else {
                historyList.appendChild(listItem);
            }

            // 限制记录数量为10条
            while (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }

            // 重新渲染所有数学公式
            MathJax.typesetPromise();

            // 自动填入求解器输入框并更新预览
            document.getElementById('equation-input').value = data.question;
            previewContent.innerHTML = `\\[${data.question}\\]`;
            MathJax.typesetPromise();

        } catch (error) {
            console.error('Error:', error);
            alert('生成題目失敗：' + error.message);
        }
    });

    solveBtn.addEventListener('click', () => {
        const equation = document.getElementById('equation-input').value.trim();
        if (!equation) {
            alert('請輸入算式');
            return;
        }
        
        // 如果输入不是 LaTeX 格式，转换为 LaTeX 格式
        const latexEquation = equation.startsWith('\\') ? equation : convertToLatex(equation);
        solveEquation(latexEquation, operationType.value, difficulty.value);
    });

    document.getElementById('equation-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            solveBtn.click();
        }
    });

    // 添加输入监听器来更新预览
    equationInput.addEventListener('input', () => {
        const input = equationInput.value.trim();
        const latex = input.startsWith('\\') ? input : convertToLatex(input);
        previewContent.innerHTML = `\\[${latex}\\]`;
        MathJax.typesetPromise();
    });
});

async function solveEquation(equation, type, difficulty) {
    try {
        // 如果输入是 LaTeX 格式，保持原样；如果是普通分数格式，转换为 LaTeX
        const latexEquation = equation.startsWith('\\') ? equation : convertToLatex(equation);
        
        const response = await fetch('/api/solver/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                equation: latexEquation,
                type: type || 'addition',
                difficulty: parseInt(difficulty || '1')
            })
        });

        if (!response.ok) {
            throw new Error('求解失敗');
        }

        const solution = await response.json();
        displaySolution(solution);
    } catch (error) {
        console.error('Error:', error);
        alert('求解失敗：' + error.message);
    }
}

function displaySolution(solution) {
    const stepsContainer = document.querySelector('.steps-container');
    stepsContainer.innerHTML = '';

    solution.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        stepElement.innerHTML = `
            <div class="step-header">
                <span class="step-number">步驟 ${index + 1}</span>
                <span class="step-description">${step.description}</span>
            </div>
            <div class="step-equation">
                <div class="math">\\[${step.operation}\\]</div>
            </div>
            ${step.result ? `<div class="step-result">\\[${step.result}\\]</div>` : ''}
        `;
        stepsContainer.appendChild(stepElement);
    });

    // 重新渲染數學公式
    MathJax.typesetPromise();
}

// 修改 convertToLatex 函数，使其更智能地处理各种输入
function convertToLatex(input) {
    // 移除多余的空格
    input = input.trim();
    
    // 如果已经是 LaTeX 格式，直接返回
    if (input.includes('\\frac')) {
        return input;
    }
    
    // 检查是否是分数格式 (例如: 12/28)
    const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        return `\\frac{${fractionMatch[1]}}{${fractionMatch[2]}}`;
    }
    
    // 如果是普通数字，直接返回
    if (/^\d+$/.test(input)) {
        return input;
    }
    
    return input;
} 