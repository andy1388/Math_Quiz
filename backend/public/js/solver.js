document.addEventListener('DOMContentLoaded', () => {
    const operationType = document.getElementById('operation-type');
    const difficulty = document.getElementById('difficulty');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const generatedQuestion = document.querySelector('.generated-question');
    const stepsContainer = document.querySelector('.steps-container');

    generateBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/generate', {
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
            
            // 顯示生成的題目
            generatedQuestion.innerHTML = `
                <div class="question-display">
                    <div class="question-text">${data.question}</div>
                </div>
            `;

            // 自動填入求解器輸入框
            document.getElementById('equation-input').value = data.question;
            
            // 自動觸發求解
            solveBtn.click();

        } catch (error) {
            console.error('Error:', error);
            alert('生成題目失敗：' + error.message);
        }
    });

    solveBtn.addEventListener('click', () => {
        const equation = document.getElementById('equation-input').value.trim();
        if (!equation) {
            alert('請輸入方程式');
            return;
        }
        
        // 發送求解請求
        solveEquation(equation);
    });

    document.getElementById('equation-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            solveBtn.click();
        }
    });
});

async function solveEquation(equation) {
    try {
        const response = await fetch('/api/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equation })
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