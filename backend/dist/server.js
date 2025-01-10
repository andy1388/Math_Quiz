"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const app = (0, express_1.default)();
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
// 頁面路由
app.get('/practice', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/practice.html'));
});
app.get('/practice/:topic', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/practice.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// 啟動服務器
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
    console.log(`服務器運行在 http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用，嘗試使用其他端口...`);
        server.close();
        // 嘗試下一個端口
        const nextPort = port + 1;
        app.listen(nextPort, () => {
            console.log(`服務器運行在 http://localhost:${nextPort}`);
        });
    }
    else {
        console.error('服務器啟動失敗:', err);
    }
});
exports.default = app;
