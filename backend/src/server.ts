import express from 'express';
import path from 'path';
import questionRoutes from './routes/questionRoutes';

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api/questions', questionRoutes);

// 页面路由
app.get('/practice', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 处理其他所有路由 - 确保 SPA 可以正常工作
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 