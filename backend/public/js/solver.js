document.addEventListener('DOMContentLoaded', () => {
    const solveBtn = document.getElementById('solve-btn');
    const equationInput = document.getElementById('equation-input');
    const stepsContainer = document.querySelector('.steps-container');

    solveBtn.addEventListener('click', () => {
        const equation = equationInput.value.trim();
        if (!equation) {
            alert('請輸入方程式');
            return;
        }
        
        // 發送求解請求
        solveEquation(equation);
    });

    equationInput.addEventListener('keypress', (e) => {
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
    stepsContainer.innerHTML = ''; // 清空現有內容

    solution.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        stepElement.innerHTML = `
            <div class="step-header">
                <span class="step-number">步驟 ${index + 1}</span>
                <span class="step-description">${step.description}</span>
            </div>
            <div class="step-equation">
                ${step.equation}
            </div>
        `;
        stepsContainer.appendChild(stepElement);
    });

    // 重新渲染數學公式
    if (window.MathJax) {
        MathJax.typesetPromise && MathJax.typesetPromise();
    }
} 