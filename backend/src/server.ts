import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import questionRoutes from './routes/questionRoutes';
import { createServer, Server } from 'http';

const app: Express = express();
let server: Server | null = null;

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

async function startServer(initialPort: number) {
    let port = initialPort;
    const maxAttempts = 10;
    
    // 如果有之前的服務器實例，先關閉它
    if (server) {
        await new Promise<void>((resolve) => {
            server?.close(() => resolve());
        });
        server = null;
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await new Promise<void>((resolve, reject) => {
                server = createServer(app);
                server
                    .listen(port)
                    .once('listening', async () => {
                        console.log(`服務器運行在 http://localhost:${port}`);
                        console.log('正在初始化生成器...');
                        try {
                            await import('./routes/questionRoutes');
                            console.log('生成器初始化完成');
                        } catch (error) {
                            console.error('生成器初始化失败:', error);
                        }
                        resolve();
                    })
                    .once('error', (err: NodeJS.ErrnoException) => {
                        if (err.code === 'EADDRINUSE') {
                            console.log(`端口 ${port} 已被占用，嘗試下一個端口...`);
                            port++;
                            server?.close();
                            reject(err);
                        } else {
                            console.error('服務器啟動失敗:', err);
                            reject(err);
                        }
                    });
            });
            break;
        } catch (err) {
            if (attempt === maxAttempts - 1) {
                console.error(`無法找到可用的端口（嘗試了 ${maxAttempts} 次）`);
                process.exit(1);
            }
            if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
                throw err;
            }
        }
    }
}

// Windows 特定的進程處理
if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', () => {
        process.emit('SIGINT' as any);
    });
}

// 進程終止處理
process.on('SIGINT', () => {
    console.log('\n正在關閉服務器...');
    gracefulShutdown();
});

process.on('SIGTERM', () => {
    console.log('\n收到終止信號，正在關閉服務器...');
    gracefulShutdown();
});

// 優雅關閉
function gracefulShutdown() {
    if (server) {
        server.close(() => {
            console.log('服務器已關閉');
            process.exit(0);
        });

        // 設置超時強制關閉
        setTimeout(() => {
            console.error('強制關閉服務器');
            process.exit(1);
        }, 5000);
    } else {
        process.exit(0);
    }
}

// 啟動服務器
startServer(3000).catch(err => {
    console.error('啟動服務器時發生錯誤:', err);
    process.exit(1);
});

export default app; 