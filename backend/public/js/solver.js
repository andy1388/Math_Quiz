document.addEventListener('DOMContentLoaded', async () => {
    const operationType = document.getElementById('operation-type');
    const difficulty = document.getElementById('difficulty');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const generatedQuestion = document.querySelector('.generated-question');
    const stepsContainer = document.querySelector('.steps-container');

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
            
            // 顯示生成的題目，使用 MathJax 渲染
            generatedQuestion.innerHTML = `
                <div class="question-display">
                    <div class="question-text">\\(${data.question}\\)</div>
                </div>
            `;

            // 更新生成記錄，確保 LaTeX 格式正確
            const historyList = document.getElementById('history-list');
            const listItem = document.createElement('li');
            
            // 創建題目文本，使用 MathJax 渲染
            const questionText = document.createElement('span');
            questionText.innerHTML = `\\(${data.question}\\)`;
            
            // 創建難度標籤
            const difficultyLabel = document.createElement('span');
            difficultyLabel.className = `difficulty-label level-${difficulty.value}`;
            difficultyLabel.textContent = `Level ${difficulty.value}`;
            
            // 將元素添加到列表項
            listItem.appendChild(questionText);
            listItem.appendChild(difficultyLabel);
            
            // 添加點擊事件
            listItem.addEventListener('click', () => {
                document.getElementById('equation-input').value = data.question;
            });

            // 將新記錄添加到列表頂部
            if (historyList.firstChild) {
                historyList.insertBefore(listItem, historyList.firstChild);
            } else {
                historyList.appendChild(listItem);
            }

            // 限制記錄數量為10條
            while (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }

            // 重新渲染所有數學公式
            MathJax.typesetPromise();

            // 自動填入求解器輸入框
            document.getElementById('equation-input').value = data.question;

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
        
        solveEquation(equation, operationType.value, difficulty.value);
    });

    document.getElementById('equation-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            solveBtn.click();
        }
    });
});

async function solveEquation(equation, type, difficulty) {
    try {
        const response = await fetch('/api/solver/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                equation,
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
                <pre class="math">${step.operation}</pre>
            </div>
            ${step.result ? `<div class="step-result">${step.result}</div>` : ''}
        `;
        stepsContainer.appendChild(stepElement);
    });

    // 重新渲染數學公式
    if (window.MathJax) {
        MathJax.typesetPromise && MathJax.typesetPromise();
    }
} 