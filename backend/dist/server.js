"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const http_1 = require("http");
const app = (0, express_1.default)();
let server = null;
// 中間件配置
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use(express_1.default.json());
// 靜態文件配置
app.use(express_1.default.static(path_1.default.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.txt')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
    }
}));
// API 路由
app.use('/api/questions', questionRoutes_1.default);
// 明確的頁面路由
app.get('/practice', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/practice.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// 處理其他所有路由 - 確保 SPA 可以正常工作
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
async function startServer(initialPort) {
    let port = initialPort;
    const maxAttempts = 10;
    // 如果有之前的服務器實例，先關閉它
    if (server) {
        await new Promise((resolve) => {
            server?.close(() => resolve());
        });
        server = null;
    }
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                server = (0, http_1.createServer)(app);
                server
                    .listen(port)
                    .once('listening', async () => {
                    console.log(`服務器運行在 http://localhost:${port}`);
                    console.log('正在初始化生成器...');
                    try {
                        await Promise.resolve().then(() => __importStar(require('./routes/questionRoutes')));
                        console.log('生成器初始化完成');
                    }
                    catch (error) {
                        console.error('生成器初始化失败:', error);
                    }
                    resolve();
                })
                    .once('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`端口 ${port} 已被占用，嘗試下一個端口...`);
                        port++;
                        server?.close();
                        reject(err);
                    }
                    else {
                        console.error('服務器啟動失敗:', err);
                        reject(err);
                    }
                });
            });
            break;
        }
        catch (err) {
            if (attempt === maxAttempts - 1) {
                console.error(`無法找到可用的端口（嘗試了 ${maxAttempts} 次）`);
                process.exit(1);
            }
            if (err.code !== 'EADDRINUSE') {
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
        process.emit('SIGINT');
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
    }
    else {
        process.exit(0);
    }
}
// 啟動服務器
startServer(3000).catch(err => {
    console.error('啟動服務器時發生錯誤:', err);
    process.exit(1);
});
exports.default = app;
