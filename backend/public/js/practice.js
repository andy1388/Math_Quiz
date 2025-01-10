let AVAILABLE_GENERATORS = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 獲取目錄結構
        const response = await fetch('/api/questions/available-generators');
        if (!response.ok) throw new Error('無法獲取生成器列表');
        const structure = await response.json();
        
        console.log('目錄結構:', structure); // 添加調試日誌
        
        // 渲染側邊欄
        renderSidebar(structure);
        
        // 難度選擇
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const activeTopic = document.querySelector('.topic-link.active');
                if (activeTopic) {
                    startPractice(activeTopic.dataset.topic, difficulty);
                }
            });
        });
    } catch (error) {
        console.error('初始化失敗:', error);
    }
});

function renderSidebar(structure) {
    const topicNav = document.querySelector('.topic-nav');
    topicNav.innerHTML = renderDirectoryStructure(structure);

    // 添加展開/收起功能
    document.querySelectorAll('.directory-item > .directory-name').forEach(dirName => {
        dirName.addEventListener('click', () => {
            const content = dirName.nextElementSibling;
            if (content) {
                dirName.classList.toggle('expanded');
                content.classList.toggle('expanded');
            }
        });
    });

    // 添加生成器點擊事件
    document.querySelectorAll('.generator-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.generator-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const topic = item.dataset.topic;
            const difficulty = document.querySelector('.diff-btn.active')?.dataset.difficulty || '1';
            startPractice(topic, difficulty);
        });
    });
}

function renderDirectoryStructure(items) {
    return `
        <div class="directory">
            ${items.map(item => {
                if (item.type === 'directory') {
                    return `
                        <div class="directory-item">
                            <div class="directory-name">📁 ${item.name}</div>
                            <div class="directory-content">
                                ${item.children ? renderDirectoryStructure(item.children) : ''}
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="generator-item" data-topic="${item.topic}">
                            📄 ${item.name.replace('_Generator_Q1.ts', '')}
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// 更新 CSS - 合併所有樣式
const style = document.createElement('style');
style.textContent = `
    /* 導航相關樣式 */
    .topic-nav {
        padding: 0;
        background: #2c3e50;
        height: 100%;
        overflow-y: auto;
    }

    .directory {
        padding: 0;
        margin: 0;
    }
    
    .directory-item {
        margin: 0;
        padding: 0;
        background: #2c3e50;
    }
    
    .directory-name {
        cursor: pointer;
        padding: 0.75rem 1rem;
        color: white;
        background: rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        margin: 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .directory-name:before {
        content: '▶';
        display: inline-block;
        margin-right: 0.5rem;
        transition: transform 0.2s;
        font-size: 0.8em;
    }
    
    .directory-name.expanded:before {
        transform: rotate(90deg);
    }
    
    .directory-content {
        display: none;
        background: #2c3e50;
    }
    
    .directory-content.expanded {
        display: block;
    }
    
    .generator-item {
        cursor: pointer;
        padding: 0.75rem 1rem;
        color: rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        background: #2c3e50;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .generator-item:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    
    .generator-item.active {
        background: #3498db;
        color: white;
    }

    /* 答案輸入相關樣式 */
    .answer-input {
        padding: 8px 12px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 4px;
        margin-right: 10px;
        width: 200px;
    }

    .check-btn {
        padding: 8px 16px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .check-btn:hover {
        background-color: #1976D2;
    }

    .check-btn:disabled {
        background-color: #BDBDBD;
        cursor: not-allowed;
    }

    .explanation {
        margin-top: 20px;
        padding: 15px;
        background-color: #F5F5F5;
        border-radius: 4px;
    }

    /* 選項相關樣式 */
    .options {
        margin: 20px 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .option {
        display: flex;
        align-items: center;
        padding: 15px;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
    }

    .option:hover {
        background: #f5f5f5;
        border-color: #bbb;
    }

    .option input[type="radio"] {
        margin-right: 10px;
    }

    .option span {
        font-size: 16px;
    }

    .option.correct {
        background: #E8F5E9;
        border-color: #4CAF50;
    }

    .option.wrong {
        background: #FFEBEE;
        border-color: #F44336;
    }

    /* 下一題按鈕樣式 */
    .next-btn {
        background: #2196F3;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        margin-top: 20px;
    }

    .next-btn:hover {
        background: #1976D2;
    }

    .next-btn .arrow {
        margin-left: 8px;
    }

    /* 解釋區域樣式 */
    .explanation {
        margin-top: 20px;
        padding: 20px;
        background: #F5F5F5;
        border-radius: 8px;
        border-left: 4px solid #2196F3;
    }

    .explanation h4 {
        margin-bottom: 10px;
        color: #333;
    }
`;
document.head.appendChild(style);

async function startPractice(topic, difficulty) {
    try {
        console.log('開始練習:', topic, difficulty); // 添加調試日誌
        const response = await fetch(`/api/questions/generate/${topic}?difficulty=${difficulty}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const question = await response.json();
        displayQuestion(question);
    } catch (error) {
        console.error('獲取題目失敗:', error);
        alert('獲取題目失敗，請稍後再試');
    }
}

function displayQuestion(question) {
    const questionArea = document.querySelector('.question-area');
    
    // 將內容轉換為 LaTeX 格式
    const latexContent = convertToLatex(question.content);
    const latexOptions = question.options.map(opt => convertToLatex(opt));
    
    let html = `
        <div class="question-content">
            <h3>題目：</h3>
            <p>\\[${latexContent}\\]</p>
            
            <div class="options">
                ${latexOptions.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="answer" value="${index}">
                        <span>${String.fromCharCode(65 + index)}. \\(${option}\\)</span>
                    </label>
                `).join('')}
            </div>
            
            <div class="explanation" style="display: none;">
                <h4>正確答案：\\(${latexOptions[question.correctIndex]}\\)</h4>
                ${question.explanation.replace(/\n/g, '<br>')}
                <div class="next-question-container">
                    <button onclick="nextQuestion()" class="next-btn">
                        下一題 <span class="arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    questionArea.innerHTML = html;
    
    // 添加選項點擊事件
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.addEventListener('change', () => {
            checkAnswer(question.correctIndex, parseInt(input.value));
        });
    });
    
    // 重新渲染數學公式
    MathJax.typesetPromise();
}

// 添加轉換為 LaTeX 格式的函數
function convertToLatex(text) {
    // 替換指數
    text = text.replace(/(\w+)(\d+)/g, '$1^{$2}');
    
    // 替換乘號
    text = text.replace(/×/g, '\\times');
    
    // 替換其他數學符號
    text = text.replace(/\*/g, '\\cdot');
    
    return text;
}

// 修改檢查答案函數以支持 LaTeX
function checkAnswer(correctIndex, selectedIndex) {
    const explanation = document.querySelector('.explanation');
    const options = document.querySelectorAll('.option');
    
    // 添加正確/錯誤樣式
    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('wrong');
        }
    });
    
    // 顯示解釋
    explanation.style.display = 'block';
    
    // 禁用所有選項
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.disabled = true;
    });
    
    // 重新渲染數學公式
    MathJax.typesetPromise();
}

// 標準化答案格式
function normalizeAnswer(answer) {
    return answer.replace(/\s+/g, '')  // 移除空格
                 .replace(/\^/g, '')   // 移除 ^ 符號
                 .replace(/\{|\}/g, '') // 移除大括號
                 .toLowerCase();        // 轉為小寫
}

function nextQuestion() {
    // 獲取當前活動的生成器項目
    const activeGenerator = document.querySelector('.generator-item.active');
    const difficulty = document.querySelector('.diff-btn.active')?.dataset.difficulty || '1';
    
    if (activeGenerator) {
        startPractice(activeGenerator.dataset.topic, difficulty);
    } else {
        console.error('找不到活動的生成器');
    }
}

function checkGeneratorExists(topicId) {
    // 檢查完整的主題ID是否存在
    if (AVAILABLE_GENERATORS.includes(topicId)) {
        return true;
    }
    
    // 檢查是否有子主題的生成器
    return AVAILABLE_GENERATORS.some(generator => 
        generator.startsWith(topicId + '.')
    );
} 