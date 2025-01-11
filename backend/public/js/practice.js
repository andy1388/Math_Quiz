let AVAILABLE_GENERATORS = [];
let isResizing = false;
let lastWidth = localStorage.getItem('sidebarWidth') || '300px';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/questions/available-generators');
        if (!response.ok) {
            throw new Error('無法獲取生成器列表');
        }
        const structure = await response.json();
        
        console.log('Raw API response:', structure);
        console.log('Structure keys:', Object.keys(structure));
        console.log('First level structure:', structure[Object.keys(structure)[0]]);

        const sidebarContent = document.querySelector('.topic-nav');
        if (!sidebarContent) {
            throw new Error('找不到側邊欄容器');
        }
        
        const html = renderDirectoryStructure(structure);
        sidebarContent.innerHTML = html;
        
        addEventListeners();
        
        // 添加側邊欄調整功能
        setupSidebarResize();
        
        // 添加難度按鈕事件監聽
        setupDifficultyButtons();
        
    } catch (error) {
        console.error('初始化失败:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
});

function renderSidebar(structure) {
    const sidebarContent = document.querySelector('.topic-nav');
    if (!sidebarContent) {
        console.error('Sidebar container not found');
        return;
    }
    
    try {
        const html = renderDirectoryStructure(structure);
        sidebarContent.innerHTML = html;
        addEventListeners();
    } catch (error) {
        console.error('渲染侧边栏失败:', error);
        sidebarContent.innerHTML = '<div class="error">加載失敗，請重試</div>';
    }
}

function renderDirectoryStructure(structure) {
    console.log('Rendering directory structure:', structure);

    if (!structure || Object.keys(structure).length === 0) {
        return '<div class="directory-structure"><p>暫無可用的練習題目</p></div>';
    }

    // 检查数据结构
    for (const formId in structure) {
        if (!structure[formId].chapters) {
            console.error(`Form ${formId} missing chapters property:`, structure[formId]);
            continue;
        }
    }

    let html = '<div class="directory-structure">';
    
    // 遍历 Form (F1, F2)
    Object.entries(structure).forEach(([formId, form]) => {
        if (!form || !form.chapters) {
            console.error(`Invalid form structure for ${formId}:`, form);
            return;
        }

        html += `
            <div class="folder form">
                <div class="folder-title" data-path="${formId}">
                    <span class="icon folder-icon">📁</span>
                    <span class="folder-name">${form.title}</span>
                </div>
                <div class="folder-content">
        `;
        
        // 遍历章节
        Object.entries(form.chapters || {}).forEach(([chapterId, chapter]) => {
            if (!chapter || !chapter.sections) {
                console.error(`Invalid chapter structure for ${chapterId}:`, chapter);
                return;
            }

            html += `
                <div class="folder chapter">
                    <div class="folder-title" data-path="${formId}/${chapterId}">
                        <span class="icon folder-icon">📁</span>
                        <span class="folder-name">${chapter.title}</span>
                    </div>
                    <div class="folder-content">
            `;
            
            // 遍历小节
            Object.entries(chapter.sections || {}).forEach(([sectionId, section]) => {
                if (!section || !section.generators) {
                    console.error(`Invalid section structure for ${sectionId}:`, section);
                    return;
                }

                html += `
                    <div class="folder section">
                        <div class="folder-title" data-path="${formId}/${chapterId}/${sectionId}">
                            <span class="icon folder-icon">📁</span>
                            <span class="folder-name">${section.title}</span>
                        </div>
                        <div class="folder-content">
                `;
                
                // 遍历生成器
                (section.generators || []).forEach(generator => {
                    html += `
                        <div class="generator-item" data-topic="${generator.id}">
                            <span class="icon file-icon">📄</span>
                            <span class="generator-title">${generator.title}</span>
                            <span class="difficulty-badge">${generator.difficulty}</span>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function addEventListeners() {
    console.log('Adding event listeners...'); // 调试信息

    // 添加文件夹点击事件（展开/折叠）
    document.querySelectorAll('.folder-title').forEach(title => {
        title.addEventListener('click', async (e) => {
            e.stopPropagation();
            const folder = title.parentElement;
            const folderPath = title.dataset.path;
            
            // 检查是否是第三层文件夹
            const pathParts = folderPath.split('/');
            if (pathParts.length === 3 && !folder.dataset.loaded) {
                try {
                    // 加载该文件夹下的生成器
                    const response = await fetch(`/api/questions/folder-content/${folderPath}`);
                    if (!response.ok) {
                        throw new Error('Failed to load folder content');
                    }
                    const content = await response.json();
                    
                    // 渲染生成器列表
                    const generatorList = content.generators.map(gen => `
                        <div class="generator-item" data-topic="${gen.id}">
                            <span class="icon file-icon">📄</span>
                            <span class="generator-title">${gen.title}</span>
                            <span class="difficulty-badge">${gen.difficulty}</span>
                        </div>
                    `).join('');
                    
                    // 更新文件夹内容
                    folder.querySelector('.folder-content').innerHTML = generatorList;
                    folder.dataset.loaded = 'true';
                    
                    // 为新添加的生成器添加点击事件
                    addGeneratorEventListeners(folder);
                } catch (error) {
                    console.error('Error loading folder content:', error);
                }
            }
            
            folder.classList.toggle('expanded');
        });
    });
}

function addGeneratorEventListeners(container) {
    container.querySelectorAll('.generator-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            document.querySelectorAll('.generator-item').forEach(i => 
                i.classList.remove('active')
            );
            item.classList.add('active');
            
            const generatorId = item.dataset.topic;
            
            try {
                // 獲取生成器的難度等級數量
                const response = await fetch(`/api/questions/generator-info/${generatorId}`);
                if (!response.ok) {
                    throw new Error('Failed to get generator info');
                }
                
                const { levelNumber } = await response.json();
                
                // 更新難度按鈕
                updateDifficultyButtons(levelNumber);
                
                // 使用難度1開始練習
                startPractice(generatorId, 1);
            } catch (error) {
                console.error('Error:', error);
                // 使用默認5個難度
                updateDifficultyButtons(5);
                startPractice(generatorId, 1);
            }
        });
    });
}

// 更新難度按鈕
function updateDifficultyButtons(levelNumber) {
    const difficultyFilter = document.querySelector('.difficulty-filter');
    if (!difficultyFilter) return;
    
    // 清空現有按鈕
    difficultyFilter.innerHTML = '<span>難度：</span>';
    
    // 生成新的難度按鈕
    for (let i = 1; i <= levelNumber; i++) {
        const button = document.createElement('button');
        button.className = 'diff-btn' + (i === 1 ? ' active' : '');
        button.dataset.difficulty = i;
        button.textContent = i;
        button.addEventListener('click', () => {
            // 移除其他按鈕的 active 類
            difficultyFilter.querySelectorAll('.diff-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            // 添加當前按鈕的 active 類
            button.classList.add('active');
            
            // 重新生成題目
            const activeGenerator = document.querySelector('.generator-item.active');
            if (activeGenerator) {
                startPractice(activeGenerator.dataset.topic, i);
            }
        });
        difficultyFilter.appendChild(button);
    }
    
    // 顯示難度選擇器
    difficultyFilter.style.display = 'flex';
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

    .error-message {
        text-align: center;
        padding: 20px;
        background: #fff3f3;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 20px 0;
    }

    .retry-btn {
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        margin-top: 10px;
        cursor: pointer;
    }

    .retry-btn:hover {
        background: #d32f2f;
    }

    /* 難度按鈕樣式 */
    .diff-btn {
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .diff-btn:hover {
        transform: scale(1.1);
    }

    .diff-btn.active {
        background: #33ccff;
        color: white;
        border-color: #33ccff;
    }

    /* 載入提示樣式 */
    .loading {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    /* 錯誤提示樣式 */
    .error-message {
        text-align: center;
        padding: 20px;
        background: #fff3f3;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 20px 0;
    }
`;
document.head.appendChild(style);

async function startPractice(generatorId, difficulty) {
    try {
        console.log('Starting practice with generator:', generatorId, 'difficulty:', difficulty);
        
        // 顯示載入中的提示
        const questionArea = document.querySelector('.question-area');
        questionArea.innerHTML = '<div class="loading">載入題目中...</div>';
        
        const response = await fetch(`/api/questions/generate/${generatorId}?difficulty=${difficulty}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const question = await response.json();
        console.log('Generated question:', question);
        
        displayQuestion(question);
    } catch (error) {
        console.error('獲取題目失敗:', error);
        const questionArea = document.querySelector('.question-area');
        questionArea.innerHTML = `
            <div class="error-message">
                <p>此題目類型暫時不可用</p>
                <p>錯誤信息：${error.message}</p>
                <button onclick="location.reload()" class="retry-btn">重試</button>
            </div>
        `;
    }
}

function displayQuestion(question) {
    const questionArea = document.querySelector('.question-area');
    if (!question || !question.content) {
        console.error('Invalid question format:', question);
        questionArea.innerHTML = `
            <div class="error-message">
                <p>題目格式錯誤</p>
                <button onclick="location.reload()" class="retry-btn">重試</button>
            </div>
        `;
        return;
    }
    
    // 將內容轉換為 LaTeX 格式
    const latexContent = question.content;
    
    // 檢查是否有選項
    const options = question.wrongAnswers 
        ? [question.correctAnswer, ...question.wrongAnswers]
        : [];
        
    // 隨機打亂選項順序
    const shuffledOptions = options.length > 0 
        ? shuffleArray([...options])
        : [];
        
    // 找出正確答案的新位置
    const correctIndex = shuffledOptions.indexOf(question.correctAnswer);
    
    let html = `
        <div class="question-content">
            <h3>題目：</h3>
            <p>${latexContent}</p>
            
            ${options.length > 0 ? `
                <div class="options">
                    ${shuffledOptions.map((option, index) => `
                        <label class="option">
                            <input type="radio" name="answer" value="${index}">
                            <div class="option-content">
                                <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                                <span class="option-value">\\[${option}\\]</span>
                            </div>
                        </label>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="explanation" style="display: none;">
                <h4>解題步驟：</h4>
                ${question.explanation.split('\n').map(step => `<p>${step}</p>`).join('')}
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
    if (options.length > 0) {
        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.addEventListener('change', () => {
                checkAnswer(correctIndex, parseInt(input.value));
            });
        });
    }
    
    // 重新渲染數學公式
    if (window.MathJax) {
        MathJax.typesetPromise && MathJax.typesetPromise();
    }
}

// 輔助函數：打亂數組順序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    const activeGenerator = document.querySelector('.generator-item.active');
    const difficulty = document.querySelector('.diff-btn.active')?.dataset.difficulty || '1';
    
    if (activeGenerator) {
        const generatorId = activeGenerator.dataset.topic;
        startPractice(generatorId, difficulty);
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

function setupSidebarResize() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // 恢復保存的寬度
    if (lastWidth) {
        sidebar.style.width = lastWidth;
        mainContent.style.marginLeft = lastWidth;
    }
    
    // 創建調整手柄
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    sidebar.appendChild(handle);
    
    // 監聽鼠標事件
    handle.addEventListener('mousedown', initResize);
    
    function initResize(e) {
        isResizing = true;
        handle.classList.add('active');
        document.body.classList.add('resizing');
        
        // 添加鼠標移動和鬆開事件監聽器
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
    }
    
    function resize(e) {
        if (!isResizing) return;
        
        // 計算新寬度
        let newWidth = e.clientX;
        
        // 限制最小和最大寬度
        newWidth = Math.max(200, Math.min(600, newWidth));
        
        // 更新側邊欄和主內容區域
        sidebar.style.width = `${newWidth}px`;
        mainContent.style.marginLeft = `${newWidth}px`;
        
        // 保存寬度到本地存儲
        lastWidth = `${newWidth}px`;
        localStorage.setItem('sidebarWidth', lastWidth);
    }
    
    function stopResize() {
        isResizing = false;
        handle.classList.remove('active');
        document.body.classList.remove('resizing');
        
        // 移除事件監聽器
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// 添加新函數：設置難度按鈕
function setupDifficultyButtons() {
    const difficultyButtons = document.querySelectorAll('.diff-btn');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除其他按鈕的 active 類
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            // 添加當前按鈕的 active 類
            button.classList.add('active');
            
            // 獲取當前選中的生成器
            const activeGenerator = document.querySelector('.generator-item.active');
            if (activeGenerator) {
                // 重新生成題目
                const generatorId = activeGenerator.dataset.topic;
                const difficulty = button.dataset.difficulty;
                startPractice(generatorId, difficulty);
            }
        });
    });
} 