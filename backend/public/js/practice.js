let AVAILABLE_GENERATORS = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 獲取目錄結構
        const response = await fetch('/api/questions/available-generators');
        if (!response.ok) {
            console.error('获取生成器列表失败:', response.status);
            throw new Error('無法獲取生成器列表');
        }
        const structure = await response.json();
        
        console.log('API返回的目录结构:', structure);
        
        // 渲染側邊欄
        const sidebarContent = document.querySelector('.topic-nav');
        if (!sidebarContent) {
            console.error('找不到側邊欄容器 .topic-nav');
            return;
        }
        
        const html = renderDirectoryStructure(structure);
        console.log('生成的HTML结构:', html);
        
        sidebarContent.innerHTML = html;
        
        // 检查DOM是否正确更新
        console.log('更新后的侧边栏DOM:', sidebarContent.innerHTML);
        
        addEventListeners();
        
        // 初始化时默认显示难度1
        renderDifficultyButtons(1);
        
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
    // 检查结构是否为空
    if (!structure || Object.keys(structure).length === 0) {
        console.error('目录结构为空:', structure);
        return '<div class="directory-structure"><p>暫無可用的練習題目</p></div>';
    }

    let html = '<div class="directory-structure">';
    
    // 遍历每个章节
    Object.entries(structure).forEach(([chapterId, chapter]) => {
        console.log('处理章节:', chapterId, chapter);
        
        html += `
            <div class="folder chapter">
                <div class="folder-title">
                    <span class="icon folder-icon">📁</span>
                    <span class="folder-name">${chapter.title}</span>
                </div>
                <div class="folder-content">
        `;
        
        // 遍历章节下的小节
        Object.entries(chapter.sections).forEach(([sectionId, section]) => {
            console.log('处理小节:', sectionId, section);
            
            html += `
                <div class="folder section">
                    <div class="folder-title">
                        <span class="icon folder-icon">📁</span>
                        <span class="folder-name">${section.title}</span>
                    </div>
                    <div class="folder-content">
            `;
            
            // 遍历小节下的生成器
            section.generators.forEach(generator => {
                console.log('处理生成器:', generator);
                
                html += `
                    <div class="generator-item" 
                        data-id="${generator.id}"
                        data-max-difficulty="${generator.maxDifficulty || 5}">
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
    
    html += '</div>';
    return html;
}

function addEventListeners() {
    // 添加文件夹点击事件（展开/折叠）
    document.querySelectorAll('.folder-title').forEach(title => {
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            const folder = title.parentElement;
            folder.classList.toggle('expanded');
        });
    });

    // 添加生成器点击事件
    document.querySelectorAll('.generator-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 移除其他生成器的活动状态
            document.querySelectorAll('.generator-item').forEach(i => 
                i.classList.remove('active'));
            
            // 设置当前生成器为活动状态
            item.classList.add('active');
            
            // 获取最大难度并更新按钮
            const maxDifficulty = parseInt(item.dataset.maxDifficulty) || 5;
            console.log('Generator clicked:', {
                id: item.dataset.id,
                maxDifficulty: maxDifficulty
            });
            
            // 先更新难度按钮，再开始练习
            renderDifficultyButtons(maxDifficulty);
            setTimeout(() => startPractice(item.dataset.id), 0);
        });
    });
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
`;
document.head.appendChild(style);

async function startPractice(generatorId) {
    try {
        // 获取当前选中的难度
        const activeDiffBtn = document.querySelector('.diff-btn.active');
        const difficulty = activeDiffBtn ? activeDiffBtn.dataset.difficulty : '1';

        const response = await fetch(`/api/questions/generate/${generatorId}?difficulty=${difficulty}`);
        if (!response.ok) {
            throw new Error('此題目類型暫時不可用');
        }

        const question = await response.json();
        displayQuestion(question);
    } catch (error) {
        console.error('獲取題目失敗:', error);
        const questionArea = document.querySelector('.question-area');
        questionArea.innerHTML = `
            <div class="error-message">
                <p>此題目類型暫時不可用</p>
                <button onclick="location.reload()" class="retry-btn">重試</button>
            </div>
        `;
    }
}

function displayQuestion(question) {
    const questionArea = document.querySelector('.question-area');
    if (!questionArea) return;

    // 将内容转换为 LaTeX 格式
    const latexContent = convertToLatex(question.content);
    const latexOptions = question.options.map(opt => convertToLatex(opt));

    // 处理解题步骤中的 LaTeX
    const explanation = question.explanation.split('\n').map(line => {
        if (line.includes('\\(') || line.includes('\\[')) {
            // 如果行已经包含 LaTeX 标记，保持原样
            return line;
        }
        // 对其他行中的数学表达式进行 LaTeX 转换
        return convertToLatex(line);
    }).join('<br>');

    let html = `
        <div class="question">
            <div class="question-content">
                <div class="math">\\[${latexContent}\\]</div>
            </div>
            <div class="options">
    `;

    // 添加选项
    latexOptions.forEach((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D...
        html += `
            <div class="option">
                <input type="radio" name="answer" id="option${letter}" value="${index}">
                <label for="option${letter}" class="math">
                    <span class="option-letter">${letter}.</span>
                    <span class="option-content">\\[${option}\\]</span>
                </label>
            </div>
        `;
    });

    html += `
            </div>
            <div class="explanation" style="display: none;">
                <h4>解題步驟：</h4>
                ${explanation}
            </div>
        </div>
    `;

    questionArea.innerHTML = html;

    // 添加选项点击事件
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.addEventListener('change', () => {
            checkAnswer(question.correctIndex, parseInt(input.value));
        });
    });

    // 重新渲染数学公式
    MathJax.typesetPromise();
}

// 改进 convertToLatex 函数
function convertToLatex(text) {
    if (!text) return '';
    
    let result = text;
    
    // 处理指数
    result = result.replace(/([a-zA-Z])(\d+)/g, '$1^{$2}');
    
    // 处理乘号
    result = result.replace(/×/g, '\\times');
    result = result.replace(/\*/g, '\\cdot');
    
    // 处理分数
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 处理根号
    result = result.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    
    // 处理特殊符号
    result = result.replace(/pi/g, '\\pi');
    result = result.replace(/theta/g, '\\theta');
    result = result.replace(/alpha/g, '\\alpha');
    result = result.replace(/beta/g, '\\beta');
    result = result.replace(/delta/g, '\\delta');
    
    // 处理对数
    result = result.replace(/log/g, '\\log');
    result = result.replace(/ln/g, '\\ln');
    
    return result;
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

function renderDifficultyButtons(maxDifficulty = 5) {
    console.log('Rendering difficulty buttons with max:', maxDifficulty);
    const difficultyFilter = document.querySelector('.difficulty-filter');
    if (!difficultyFilter) return;

    // 清除现有按钮
    difficultyFilter.innerHTML = '<span>難度：</span>';
    
    // 创建按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';

    // 确保 maxDifficulty 是有效数字
    maxDifficulty = Math.max(1, parseInt(maxDifficulty) || 5);

    // 生成难度按钮
    for (let i = 1; i <= maxDifficulty; i++) {
        const button = document.createElement('button');
        button.className = 'diff-btn' + (i === 1 ? ' active' : '');
        button.dataset.difficulty = i.toString();
        button.textContent = i.toString();
        button.onclick = () => {
            document.querySelectorAll('.diff-btn').forEach(btn => 
                btn.classList.remove('active'));
            button.classList.add('active');
            const activeGenerator = document.querySelector('.generator-item.active');
            if (activeGenerator) {
                startPractice(activeGenerator.dataset.id);
            }
        };
        buttonsContainer.appendChild(button);
    }

    difficultyFilter.appendChild(buttonsContainer);
}

// 修改生成器点击处理函数
function handleGeneratorClick(item) {
    // 移除其他生成器的活动状态
    document.querySelectorAll('.generator-item').forEach(i => 
        i.classList.remove('active'));
    
    // 设置当前生成器为活动状态
    item.classList.add('active');
    
    // 获取最大难度并更新按钮
    const maxDifficulty = parseInt(item.dataset.maxDifficulty) || 5;
    console.log('Generator clicked:', {
        id: item.dataset.id,
        maxDifficulty: maxDifficulty
    });
    
    // 先更新难度按钮
    renderDifficultyButtons(maxDifficulty);
    
    // 然后开始练习，确保使用新的难度设置
    startPractice(item.dataset.id);
}

function createGeneratorItem(generator) {
    console.log('Creating generator item:', generator); // 添加调试日志
    
    const item = document.createElement('div');
    item.className = 'generator-item';
    item.dataset.id = generator.id;
    item.dataset.maxDifficulty = generator.maxDifficulty;
    
    console.log('Generator max difficulty:', generator.maxDifficulty); // 添加调试日志
    
    // 添加标题和其他内容
    const title = document.createElement('span');
    title.className = 'generator-title';
    title.textContent = generator.title;
    
    item.appendChild(title);
    
    // 添加点击事件
    item.addEventListener('click', () => handleGeneratorClick(item));
    
    return item;
} 