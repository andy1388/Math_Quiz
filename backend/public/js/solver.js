document.addEventListener('DOMContentLoaded', () => {
    const solveBtn = document.getElementById('solveBtn');
    const questionInput = document.getElementById('questionInput');
    const problemType = document.getElementById('problemType');
    const solutionSteps = document.getElementById('solutionSteps');

    solveBtn.addEventListener('click', async () => {
        const question = questionInput.value;
        const type = problemType.value;

        if (!question.trim()) {
            alert('請輸入題目');
            return;
        }

        try {
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, type })
            });

            const data = await response.json();

            if (data.success) {
                solutionSteps.innerHTML = data.solution
                    .map(step => `<p>${step}</p>`)
                    .join('');
            } else {
                alert('解題失敗：' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('發生錯誤，請稍後再試');
        }
    });
}); 