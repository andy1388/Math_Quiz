document.addEventListener('DOMContentLoaded', () => {
    // 初始化加載中一的內容
    loadGradeContent('F1');

    // 難度選擇
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 如果已經選擇了題目，則重新生成
            const activeTopic = document.querySelector('.topic-link.active');
            if (activeTopic) {
                startPractice(activeTopic.dataset.topic, difficulty);
            }
        });
    });
});

async function loadGradeContent(grade) {
    try {
        // 使用 text/plain 格式讀取
        const response = await fetch('/contents/F1_Content.txt', {
            headers: {
                'Accept': 'text/plain'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        const chapters = parseContent(content);
        renderSidebar(chapters);
    } catch (error) {
        console.error('加載章節失敗:', error);
        document.querySelector('.topic-nav').innerHTML = `
            <div class="error-message">
                加載章節失敗，請刷新頁面重試 (${error.message})
            </div>
        `;
    }
}

function parseContent(content) {
    const lines = content.split('\n');
    const chapters = [];
    let currentChapter = null;
    let currentSection = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const chapterMatch = line.match(/^\[(F1L\d+)\]\s*(.+)/);
        const sectionMatch = line.match(/^\[(F1L\d+\.\d+)\]\s*(.+)/);
        const topicMatch = line.match(/^\[(F1L\d+\.\d+\.\d+)\]\s*(.+)/);

        if (chapterMatch && !sectionMatch) {
            // 主章節
            currentChapter = {
                id: chapterMatch[1],
                title: chapterMatch[2],
                sections: []
            };
            chapters.push(currentChapter);
        } else if (sectionMatch && !topicMatch) {
            // 子章節
            currentSection = {
                id: sectionMatch[1],
                title: sectionMatch[2],
                topics: []
            };
            if (currentChapter) {
                currentChapter.sections.push(currentSection);
            }
        } else if (topicMatch) {
            // 具體題目
            if (currentSection) {
                currentSection.topics.push({
                    id: topicMatch[1],
                    title: topicMatch[2]
                });
            }
        }
    });

    return chapters;
}

function renderSidebar(chapters) {
    const topicNav = document.querySelector('.topic-nav');
    topicNav.innerHTML = chapters.map(chapter => `
        <div class="chapter-section">
            <details open>
                <summary class="chapter-title">${chapter.title}</summary>
                <ul>
                    ${chapter.sections.map(section => `
                        <li>
                            <details>
                                <summary class="section-title">${section.title}</summary>
                                <ul class="topic-list">
                                    ${section.topics.map(topic => `
                                        <li>
                                            <a href="#" class="topic-link" data-topic="${topic.id}">
                                                ${topic.title}
                                            </a>
                                        </li>
                                    `).join('')}
                                </ul>
                            </details>
                        </li>
                    `).join('')}
                </ul>
            </details>
        </div>
    `).join('');

    // 默認展開第一個章節
    const firstChapter = topicNav.querySelector('details');
    if (firstChapter) {
        firstChapter.open = true;
    }

    // 添加事件監聽器
    document.querySelectorAll('.topic-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const difficulty = document.querySelector('.diff-btn.active')?.dataset.difficulty || '1';
            startPractice(link.dataset.topic, difficulty);
        });
    });
}

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