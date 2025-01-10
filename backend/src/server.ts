import express, { Express } from 'express';
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

// 明確的頁面路由
app.get('/practice', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 處理其他所有路由 - 確保 SPA 可以正常工作
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 嘗試啟動服務器的函數
async function startServer(initialPort: number) {
    let port = initialPort;
    const maxAttempts = 10; // 最多嘗試10個端口
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await new Promise<void>((resolve, reject) => {
                const server = app.listen(port)
                    .once('listening', () => {
                        console.log(`服務器運行在 http://localhost:${port}`);
                        resolve();
                    })
                    .once('error', (err: NodeJS.ErrnoException) => {
                        if (err.code === 'EADDRINUSE') {
                            console.log(`端口 ${port} 已被占用，嘗試下一個端口...`);
                            port++;
                            server.close();
                            reject(err);
                        } else {
                            console.error('服務器啟動失敗:', err);
                            reject(err);
                        }
                    });
            });
            // 如果成功啟動，跳出循環
            break;
        } catch (err) {
            if (attempt === maxAttempts - 1) {
                console.error(`無法找到可用的端口（嘗試了 ${maxAttempts} 次）`);
                process.exit(1);
            }
            // 如果是 EADDRINUSE 錯誤，繼續循環嘗試下一個端口
            if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
                throw err;
            }
        }
    }
}

// 啟動服務器
startServer(3000).catch(err => {
    console.error('啟動服務器時發生錯誤:', err);
    process.exit(1);
});

export default app; 