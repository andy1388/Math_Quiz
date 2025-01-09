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
        
        // 初始展開所有目錄
        document.querySelectorAll('.directory-content').forEach(content => {
            content.style.display = 'block';
        });
        document.querySelectorAll('.directory-name').forEach(name => {
            name.classList.add('expanded');
        });
        
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
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
                dirName.classList.toggle('expanded');
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

// 更新 CSS
const style = document.createElement('style');
style.textContent = `
    .topic-nav {
        padding: 1rem;
        background: #2c3e50;
        height: 100%;
        overflow-y: auto;
    }

    .directory {
        padding-left: 1rem;
    }
    
    .directory-item {
        margin: 0.5rem 0;
    }
    
    .directory-name {
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        color: white;
        background: rgba(255,255,255,0.1);
        margin-bottom: 0.5rem;
    }
    
    .directory-name:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .directory-content {
        margin-left: 1rem;
        border-left: 1px solid rgba(255,255,255,0.1);
        padding-left: 1rem;
    }
    
    .generator-item {
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        color: rgba(255,255,255,0.8);
        margin-bottom: 0.25rem;
        transition: all 0.2s ease;
    }
    
    .generator-item:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    
    .generator-item.active {
        background: #3498db;
        color: white;
    }
`;
document.head.appendChild(style);

async function startPractice(topic, difficulty) {
    try {
        const response = await fetch(`/api/questions/generate/${topic}?difficulty=${difficulty}`);
        const question = await response.json();
        
        if (!response.ok) throw new Error(question.error);
        
        displayQuestion(question);
    } catch (error) {
        console.error('獲取題目失敗:', error);
        alert('獲取題目失敗，請稍後再試');
    }
}

function displayQuestion(question) {
    const questionArea = document.querySelector('.question-area');
    
    questionArea.innerHTML = `
        <div class="question-content">
            <h3>題目：</h3>
            <p>${question.content}</p>
            
            <div class="options">
                ${question.options.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="answer" value="${index}" 
                            onchange="checkAnswer(${question.correctIndex}, this)">
                        <span>${String.fromCharCode(65 + index)}. ${option}</span>
                    </label>
                `).join('')}
            </div>
            
            <div class="explanation" style="display: none;">
                ${question.explanation.replace(/\n/g, '<br>')}
                <div class="next-question-container">
                    <button onclick="nextQuestion()" class="next-btn">
                        下一題 <span class="arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function checkAnswer(correctIndex, selectedInput) {
    const explanation = document.querySelector('.explanation');
    const options = document.querySelectorAll('.option');
    const selectedIndex = parseInt(selectedInput.value);
    
    // 移除之前的正確/錯誤樣式
    options.forEach(option => {
        option.classList.remove('correct', 'wrong');
    });
    
    // 添加新的正確/錯誤樣式
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
}

function nextQuestion() {
    const activeTopic = document.querySelector('.topic-link.active');
    const difficulty = document.querySelector('.diff-btn.active')?.dataset.difficulty || '1';
    if (activeTopic) {
        startPractice(activeTopic.dataset.topic, difficulty);
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