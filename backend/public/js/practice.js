const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

let AVAILABLE_GENERATORS = [];
let isResizing = false;
let lastWidth = localStorage.getItem('sidebarWidth') || '300px';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        log('Initializing practice page...');
        const response = await fetch('/api/questions/available-generators');
        if (!response.ok) {
            throw new Error('無法獲取生成器列表');
        }
        const structure = await response.json();
        
        log('Received structure:', structure);
        
        const sidebarContent = document.querySelector('.topic-nav');
        if (!sidebarContent) {
            throw new Error('找不到側邊欄容器');
        }
        
        const html = renderDirectoryStructure(structure);
        sidebarContent.innerHTML = html;
        
        log('Directory structure rendered');
        
        addEventListeners();
        log('Event listeners added');
        
        setupSidebarResize();
        log('Sidebar resize setup complete');
        
        setupDifficultyButtons();
        log('Difficulty buttons setup complete');
        
    } catch (error) {
        console.error('初始化失败:', error);
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
                if (!section) {
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

                // 渲染子小节（第4层）
                if (section.subSections) {
                    Object.entries(section.subSections).forEach(([subSectionId, subSection]) => {
                        html += `
                            <div class="folder subsection">
                                <div class="folder-title" data-path="${formId}/${chapterId}/${sectionId}/${subSectionId}">
                                    <span class="icon folder-icon">📁</span>
                                    <span class="folder-name">${subSection.title}</span>
                                </div>
                                <div class="folder-content">
                        `;

                        // 渲染生成器
                        (subSection.generators || []).forEach(generator => {
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
                }
                
                // 渲染当前小节的生成器
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
    console.log('Adding event listeners...');

    // 添加文件夹点击事件（展开/折叠）
    document.querySelectorAll('.folder-title').forEach(title => {
        if (title.hasEventListener) return;
        
        const clickHandler = async (e) => {
            e.stopPropagation();
            const folder = title.parentElement;
            const folderPath = title.dataset.path;
            
            console.log('Clicked folder path:', folderPath);
            
            // 检查是否是第三层或第四层文件夹，并且还未加载内容
            const pathParts = folderPath.split(/[\/\\]/); // 同时处理 / 和 \ 分隔符
            if ((pathParts.length === 3 || pathParts.length === 4) && !folder.dataset.loaded) {
                try {
                    console.log('Loading content for path:', folderPath);
                    
                    // 加载该文件夹下的所有内容
                    const response = await fetch(`/api/questions/folder-content/${folderPath}`);
                    if (!response.ok) {
                        throw new Error(`Failed to load folder content: ${response.statusText}`);
                    }
                    const content = await response.json();
                    
                    console.log('Loaded content:', content);
                    
                    const folderContent = folder.querySelector('.folder-content');
                    if (folderContent) {
                        let contentHtml = '';
                        
                        // 先添加子文件夹
                        if (content.subFolders && content.subFolders.length > 0) {
                            content.subFolders.forEach(subFolder => {
                                contentHtml += `
                                    <div class="folder subsection">
                                        <div class="folder-title" data-path="${subFolder.path.replace(/\\/g, '/')}">
                                            <span class="icon folder-icon">📁</span>
                                            <span class="folder-name">${subFolder.title}</span>
                                        </div>
                                        <div class="folder-content"></div>
                                    </div>
                                `;
                            });
                        }
                        
                        // 然后添加生成器文件
                        if (content.generators && content.generators.length > 0) {
                            content.generators.forEach(gen => {
                                contentHtml += `
                                    <div class="generator-item" data-topic="${gen.id}">
                                        <span class="icon file-icon">📄</span>
                                        <span class="generator-title">${gen.title}</span>
                                        <span class="difficulty-badge">${gen.difficulty}</span>
                                    </div>
                                `;
                            });
                        }
                        
                        // 更新文件夹内容
                        folderContent.innerHTML = contentHtml;
                        folder.dataset.loaded = 'true';
                        
                        // 为新添加的元素添加事件监听器
                        addEventListeners();
                    }
                } catch (error) {
                    console.error('Error loading folder content:', error);
                    const folderContent = folder.querySelector('.folder-content');
                    if (folderContent) {
                        folderContent.innerHTML = `<div class="error-message">加載失敗: ${error.message}</div>`;
                    }
                }
            }
            
            // 切换展开状态
            folder.classList.toggle('expanded');
            
            // 确保父文件夹也是展开状态
            let parent = folder.parentElement;
            while (parent) {
                if (parent.classList.contains('folder')) {
                    parent.classList.add('expanded');
                }
                parent = parent.parentElement;
            }
        };

        title.addEventListener('click', clickHandler);
        title.hasEventListener = true;
    });

    // 为所有生成器项添加点击事件
    document.querySelectorAll('.generator-item').forEach(item => {
        if (item.hasEventListener) return;
        
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Generator clicked:', item.dataset.topic);
            
            // 移除其他生成器的活动状态
            document.querySelectorAll('.generator-item').forEach(i => 
                i.classList.remove('active')
            );
            item.classList.add('active');
            
            const generatorId = item.dataset.topic;
            
            try {
                // 获取生成器信息（包含难度级别数量）
                const infoResponse = await fetch(`/api/questions/generator-info/${generatorId}`);
                if (!infoResponse.ok) {
                    throw new Error('Failed to get generator info');
                }
                
                const { levelNumber } = await infoResponse.json();
                console.log('Generator levels:', levelNumber);
                
                // 生成题目
                const questionResponse = await fetch(`/api/questions/generate/${generatorId}?difficulty=1`);
                if (!questionResponse.ok) {
                    throw new Error('Failed to generate question');
                }

                const question = await questionResponse.json();
                
                // 添加难度信息
                question.maxDifficulty = parseInt(levelNumber);
                question.currentDifficulty = 1;
                
                console.log('Question with difficulty info:', question);
                displayQuestion(question);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to load question: ' + error.message);
            }
        });
        
        item.hasEventListener = true;
    });
}

// 修改生成器点击事件处理
function addGeneratorEventListeners(container) {
    container.querySelectorAll('.generator-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Generator clicked:', item.dataset.topic);
            
            // 移除其他生成器的活动状态
            document.querySelectorAll('.generator-item').forEach(i => 
                i.classList.remove('active')
            );
            item.classList.add('active');
            
            const generatorId = item.dataset.topic;
            
            try {
                // 获取生成器信息（包含难度级别数量）
                const infoResponse = await fetch(`/api/questions/generator-info/${generatorId}`);
                if (!infoResponse.ok) {
                    throw new Error('Failed to get generator info');
                }
                
                const { levelNumber } = await infoResponse.json();
                console.log('Generator levels:', levelNumber);
                
                // 生成题目
                const questionResponse = await fetch(`/api/questions/generate/${generatorId}?difficulty=1`);
                if (!questionResponse.ok) {
                    throw new Error('Failed to generate question');
                }

                const question = await questionResponse.json();
                
                // 添加难度信息
                question.maxDifficulty = parseInt(levelNumber);
                question.currentDifficulty = 1;
                
                console.log('Question with difficulty info:', question);
                displayQuestion(question);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to load question: ' + error.message);
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
        
        // 获取生成器信息（包含难度级别数量）
        const infoResponse = await fetch(`/api/questions/generator-info/${generatorId}`);
        if (!infoResponse.ok) {
            throw new Error('Failed to get generator info');
        }
        
        const { levelNumber } = await infoResponse.json();
        
        // 显示加载提示，但保持难度按钮
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.innerHTML = '<div class="loading">載入題目中...</div>';
        }
        
        const response = await fetch(`/api/questions/generate/${generatorId}?difficulty=${difficulty}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const question = await response.json();
        question.maxDifficulty = parseInt(levelNumber);
        question.currentDifficulty = difficulty;
        
        displayQuestion(question, false); // 传入 false 表示不重新生成难度按钮
    } catch (error) {
        console.error('獲取題目失敗:', error);
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.innerHTML = `
                <div class="error-message">
                    <p>此題目類型暫時不可用</p>
                    <p>錯誤信息：${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">重試</button>
                </div>
            `;
        }
    }
}

function displayQuestion(question, isNewGenerator = true) {
    const questionArea = document.querySelector('.question-area');
    if (!questionArea) return;

    console.log('Displaying question with difficulty:', question.maxDifficulty);

    if (isNewGenerator) {
        // 如果是新的生成器，重新生成整个区域
        let html = `
            <div class="practice-section">
                <div class="difficulty-selector">
                    <span class="difficulty-label">難度：</span>
                    <div class="difficulty-buttons">
                        ${generateDifficultyButtons(question.maxDifficulty, question.currentDifficulty)}
                    </div>
                </div>

                <div class="question-box">
                    ${generateQuestionContent(question)}
                </div>
            </div>
        `;
        questionArea.innerHTML = html;
        attachDifficultyButtonEvents();
    } else {
        // 如果只是切换难度，只更新题目内容
        const questionBox = document.querySelector('.question-box');
        if (questionBox) {
            questionBox.innerHTML = generateQuestionContent(question);
        }
        
        // 更新难度按钮状态
        document.querySelectorAll('.diff-btn').forEach(btn => {
            const btnDifficulty = parseInt(btn.dataset.difficulty);
            btn.classList.toggle('active', btnDifficulty === question.currentDifficulty);
        });
    }

    // 添加选项点击事件
    attachOptionEvents(question);

    // 确保 MathJax 重新渲染
    if (window.MathJax) {
        MathJax.typesetPromise([questionArea]).catch((err) => {
            console.error('MathJax rendering failed:', err);
        });
    }
}

// 生成题目内容的辅助函数
function generateQuestionContent(question) {
    return `
        <div class="question-content">${question.content}</div>
        
        <div class="options">
            ${['A', 'B', 'C', 'D'].map((letter, index) => `
                <div class="option" data-index="${index}">
                    <div class="option-label">${letter}.</div>
                    <div class="option-content">\\(${question.options[index]}\\)</div>
                </div>
            `).join('')}
        </div>
    `;
}

// 添加选项点击事件
function attachOptionEvents(question) {
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('disabled')) return;
            
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            option.classList.add('selected');
            
            const selectedIndex = parseInt(option.dataset.index);
            
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.add('disabled');
            });
            
            checkAnswer(question.correctIndex, selectedIndex, question);
        });
    });
}

// 检查答案函数
function checkAnswer(correctIndex, selectedIndex, question) {
    const options = document.querySelectorAll('.option');
    
    // 添加正确/错误样式
    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            option.classList.add('wrong');
        }
    });
    
    // 获取当前题目的解释
    const questionBox = document.querySelector('.question-box');
    if (!questionBox) return;
    
    // 移除已存在的解释区域（如果有）
    const existingExplanation = questionBox.querySelector('.explanation');
    if (existingExplanation) {
        existingExplanation.remove();
    }
    
    // 添加解释区域
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation active';
    explanationDiv.innerHTML = `
        <h4>解題步驟：</h4>
        <div class="explanation-content">${question.explanation}</div>
        <div class="next-question">
            <button class="next-btn" onclick="nextQuestion()">
                下一題 <span class="arrow">→</span>
            </button>
        </div>
    `;
    
    // 将解释添加到题目框下方
    questionBox.appendChild(explanationDiv);
    
    // 重新渲染 LaTeX
    if (window.MathJax) {
        MathJax.typesetPromise([explanationDiv]).catch((err) => {
            console.error('MathJax rendering failed:', err);
        });
    }
}

// 生成难度按钮的 HTML
function generateDifficultyButtons(maxDifficulty, currentDifficulty) {
    console.log('Generating buttons for max difficulty:', maxDifficulty);
    return Array.from({ length: maxDifficulty }, (_, i) => i + 1)
        .map(level => `
            <button class="diff-btn ${level === currentDifficulty ? 'active' : ''}" 
                    data-difficulty="${level}">${level}</button>
        `).join('');
}

// 添加难度按钮点击事件
function attachDifficultyButtonEvents() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = parseInt(btn.dataset.difficulty);
            const activeGenerator = document.querySelector('.generator-item.active');
            if (activeGenerator) {
                startPractice(activeGenerator.dataset.topic, difficulty);
            }
            
            // 更新按钮状态
            document.querySelectorAll('.diff-btn').forEach(b => 
                b.classList.remove('active')
            );
            btn.classList.add('active');
        });
    });
}

// 輔助函數：打亂數組順序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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