import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false  // 為了開發方便暫時禁用 CSP
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 創建基本路由
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API 運行正常' });
});

// 所有其他路由都返回主頁
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 啟動服務器
app.listen(port, () => {
    console.log(`服務器運行在 http://localhost:${port}`);
});

export default app; 