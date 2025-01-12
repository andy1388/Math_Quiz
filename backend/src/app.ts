import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import solverRoutes from './routes/solverRoutes';

const app = express();

// 中間件
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false  // 為了開發方便，生產環境應該適當配置
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api', solverRoutes);

// 處理所有其他路由，返回 index.html
app.get('*', (req, res) => {
    // 檢查是否請求的是 solver.html
    if (req.path === '/solver' || req.path === '/solver.html') {
        res.sendFile(path.join(__dirname, '../public/solver.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app; 