document.addEventListener('DOMContentLoaded', async () => {
    // 等待 MathJax 加载完成
    if (!window.MathJax || !window.MathJax.typesetPromise) {
        await new Promise(resolve => {
            document.addEventListener('MathJaxReady', resolve);
        });
    }

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

    // 初始加載難度信息 - 使用當前選中的運算類型
    await loadDifficulties(operationType.value);

    // 修改所有使用 MathJax.typesetPromise 的地方
    async function typesetMath() {
        try {
            await MathJax.typesetPromise();
        } catch (error) {
            console.error('MathJax typeset error:', error);
        }
    }

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
            
            // 清空表达式历史
            const expressionHistory = document.querySelector('.expression-history');
            expressionHistory.innerHTML = '';
            
            // 添加初始表达式
            const initialStep = document.createElement('div');
            initialStep.className = 'expression-step';
            initialStep.innerHTML = `<div class="math">\\[${data.question}\\]</div>`;
            expressionHistory.appendChild(initialStep);
            
            // 重新渲染数学公式
            await typesetMath();
            
            // 更新表达式属性
            await updateExpressionStatus(data.question);
            
            // 更新生成記錄
            const historyList = document.getElementById('history-list');
            const listItem = document.createElement('li');
            
            // 创建分数容器
            const fractionContainer = document.createElement('div');
            fractionContainer.className = 'fraction-container';
            fractionContainer.innerHTML = `\\[${data.question}\\]`;
            
            // 创建难度标签
            const difficultyLabel = document.createElement('span');
            difficultyLabel.className = `difficulty-label level-${difficulty.value}`;
            difficultyLabel.textContent = `Level ${difficulty.value}`;
            
            // 将元素添加到列表项（先添加分数，后添加标签）
            listItem.appendChild(fractionContainer);
            listItem.appendChild(difficultyLabel);
            
            // 添加点击事件
            listItem.addEventListener('click', async () => {
                const equation = data.question;
                equationInput.value = equation;
                previewContent.innerHTML = `\\[${equation}\\]`;
                
                // 更新表达式属性
                await updateExpressionStatus(equation);
                
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
    equationInput.addEventListener('input', async () => {
        const input = equationInput.value.trim();
        const latex = input.startsWith('\\') ? input : convertToLatex(input);
        previewContent.innerHTML = `\\[${latex}\\]`;
        
        // 更新表达式属性
        await updateExpressionStatus(latex);
        
        MathJax.typesetPromise();
    });

    // 添加操作按钮事件处理
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const operation = btn.dataset.op;
            const expressionHistory = document.querySelector('.expression-history');
            const lastExpression = expressionHistory.lastElementChild?.querySelector('.math')?.textContent || '';
            
            // 如果没有表达式历史，使用生成的内容
            const content = lastExpression || document.querySelector('.generated-content').textContent;
            
            if (!content) {
                alert('請先生成或輸入題目');
                return;
            }

            try {
                const response = await fetch('/api/solver/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        latex: content,
                        operation: operation 
                    })
                });

                if (!response.ok) {
                    throw new Error('處理失敗');
                }

                const result = await response.json();
                
                // 创建新的表达式步骤
                const stepElement = document.createElement('div');
                stepElement.className = 'expression-step';
                
                // 如果是第一个表达式，不显示操作标签
                if (expressionHistory.children.length === 0) {
                    stepElement.innerHTML = `<div class="math">\\[${content}\\]</div>`;
                    expressionHistory.appendChild(stepElement);
                    
                    // 创建新步骤显示结果
                    const resultStep = document.createElement('div');
                    resultStep.className = 'expression-step';
                    resultStep.innerHTML = `
                        <span class="operation-label">${btn.title}</span>
                        <div class="math">\\[${result.latex}\\]</div>
                    `;
                    expressionHistory.appendChild(resultStep);
                } else {
                    stepElement.innerHTML = `
                        <span class="operation-label">${btn.title}</span>
                        <div class="math">\\[${result.latex}\\]</div>
                    `;
                    expressionHistory.appendChild(stepElement);
                }
                
                // 重新渲染数学公式
                await typesetMath();
                
                // 更新表达式属性和同类项信息
                await updateExpressionStatus(result.latex);
                
                // 更新操作按钮状态
                await updateOperationButtons(result.latex);

            } catch (error) {
                console.error('Operation Error:', error);
                alert('操作失敗：' + error.message);
            }
        });
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

// 更新按钮状态
function updateOperationButtons(latex) {
    document.querySelectorAll('.op-btn').forEach(btn => {
        const operation = btn.dataset.op;
        const isAvailable = checkOperationAvailability(operation, latex);
        btn.disabled = !isAvailable;
        btn.title = isAvailable ? btn.title : '當前表達式不支持此操作';
    });
}

// 检查操作是否可用
async function checkOperationAvailability(operation, latex) {
    try {
        const response = await fetch('/api/solver/check-operation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operation, latex })
        });
        
        if (!response.ok) {
            return false;
        }
        
        const { available } = await response.json();
        return available;
    } catch (error) {
        console.error('Error checking operation availability:', error);
        return false;
    }
}

// 在生成新题目或更新表达式时调用
function updateExpressionAndButtons(latex) {
    document.querySelector('.generated-content').innerHTML = `\\[${latex}\\]`;
    MathJax.typesetPromise().then(() => {
        updateExpressionStatus(latex);
        updateOperationButtons(latex);
    });
}

// 更新表达式状态显示
async function updateExpressionStatus(latex) {
    try {
        const response = await fetch('/api/solver/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latex })
        });

        if (!response.ok) {
            throw new Error('分析失敗');
        }

        const info = await response.json();
        
        // 更新类型和项数
        document.getElementById('expr-type').textContent = getTypeText(info.type);
        document.getElementById('term-count').textContent = info.termCount;
        
        // 更新分数相关信息
        document.getElementById('fraction-status').textContent = 
            info.fractionInfo.hasFraction ? '有' : '無';
        document.getElementById('fraction-count').textContent = 
            info.fractionInfo.fractionCount;
        document.getElementById('nested-fraction').textContent = 
            info.fractionInfo.hasNestedFraction ? '有' : '無';
        document.getElementById('nested-level').textContent = 
            info.fractionInfo.nestedLevel;
        
        // 更新无理数相关信息
        document.getElementById('irrational-status').textContent = 
            info.irrationalInfo.hasIrrational ? '有' : '無';
        document.getElementById('sqrt-status').textContent = 
            info.irrationalInfo.types.hasSquareRoot ? '有' : '無';
        document.getElementById('pi-status').textContent = 
            info.irrationalInfo.types.hasPi ? '有' : '無';
        document.getElementById('e-status').textContent = 
            info.irrationalInfo.types.hasE ? '有' : '無';
        
        // 更新变量相关信息
        document.getElementById('variable-status').textContent = 
            info.variables.hasVariables ? `有 (${info.variables.count}個)` : '無';
        document.getElementById('variable-list').textContent = 
            info.variables.list.length > 0 ? info.variables.list.join(', ') : '-';

        // 更新同类项信息
        document.getElementById('like-terms-status').textContent = 
            info.likeTerms.hasLikeTerms ? '有' : '無';
        
        // 显示同类项组信息
        const groupsText = info.likeTerms.groups.map(group => 
            `${group.variable}: ${group.count}項`
        ).join(', ');
        
        document.getElementById('like-terms-groups').textContent = 
            groupsText || '-';

    } catch (error) {
        console.error('Error:', error);
        // 清空所有状态显示
        document.querySelectorAll('.status-value').forEach(el => {
            el.textContent = '-';
        });
    }
}

// 类型文字转换
function getTypeText(type) {
    const typeMap = {
        'constant': '常數',
        'numerical': '數值多項式',
        'monomial': '單項式',
        'polynomial': '多項式'
    };
    return typeMap[type] || type;
} 