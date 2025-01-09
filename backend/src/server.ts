import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import questionRoutes from './routes/questionRoutes';

const app: Express = express();

// 中間件配置
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());

// 靜態文件配置
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.txt')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
    }
}));

// API 路由
app.use('/api/questions', questionRoutes);

// 頁面路由
app.get('/practice', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/practice/:topic', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 啟動服務器
const port: number = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
    console.log(`服務器運行在 http://localhost:${port}`);
}).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用，嘗試使用其他端口...`);
        server.close();
        // 嘗試下一個端口
        const nextPort = port + 1;
        app.listen(nextPort, () => {
            console.log(`服務器運行在 http://localhost:${nextPort}`);
        });
    } else {
        console.error('服務器啟動失敗:', err);
    }
});

export default app; 