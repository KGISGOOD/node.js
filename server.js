const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// 第一階段：設定各種路由
// 執行指令：node server.js

// 設定中間件
app.use(express.json()); // 解析 JSON 請求
app.use(cors()); // 啟用 CORS
app.use(express.static('public')); // 提供靜態檔案


// 頁面路由
app.get('/', (req, res) => {
    res.send('首頁：歡迎使用我的應用！');
});

app.get('/about', (req, res) => {
    res.send('關於頁面：這是一個簡單的 Node.js 應用。');
});

app.get('/product', (req, res) => {
    res.send('產品頁面：展示我們的產品清單。');
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});


// 第二階段：串後端：


// 連接到 SQLite 資料庫
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) console.error('資料庫連接失敗:', err.message);
    else console.log('成功連接到 SQLite 資料庫');
});

// 建立 todos 表
db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) console.error('建立表失敗:', err.message);
    else console.log('成功建立 todos 表');
});
// Todo List 頁面
app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'todo.html'));
});

// Todo List API 路由
app.get('/api/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            console.error('查詢失敗:', err.message);
            res.status(500).json({ error: '查詢失敗' });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: '任務內容不能為空' });
    db.run('INSERT INTO todos (task) VALUES (?)', [task], function(err) {
        if (err) {
            console.error('新增失敗:', err.message);
            res.status(500).json({ error: '新增失敗' });
        } else {
            res.json({ id: this.lastID, task, completed: 0 });
        }
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器運行於 http://localhost:${port}`);
});