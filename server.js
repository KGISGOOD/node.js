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
    console.log('今天天氣真好'); // console.log(...) 是給開發者看的除錯訊息，只會印在伺服器的終端機上
    res.send('首頁：歡迎使用我的應用！'); // 這裡的 res.send(...) 是給使用者看的訊息，會顯示在瀏覽器上
});

app.get('/about', (req, res) => {
    res.send('關於頁面：這是一個簡單的 Node.js 應用。');
});

app.get('/product', (req, res) => {
    res.send('產品頁面：展示我們的產品清單。');
});

// 聯絡我們頁面路由
app.get('/contact', (req, res) => {
    // 使用 res.sendFile() 方法來發送檔案給客戶端
    // path.join(__dirname, 'views', 'contact.html') 用來構建檔案的完整路徑
    // __dirname 代表當前檔案所在的目錄
    // 'views' 是存放靜態 HTML 檔案的資料夾名稱
    // 'contact.html' 是要發送的 HTML 檔案名稱
    res.sendFile(path.join(__dirname, 'views', 'contact.html')); 
});



// 第二階段：串後端：


// Todo List 頁面
app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'todo.html'));
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

// 連接到 SQLite 資料庫
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) console.error('資料庫連接失敗:', err.message);
    else console.log('成功連接到 SQLite 資料庫');
});


// Todo List API 路由
// /api/todos 不是用來顯示網頁的路由，而是一個前端專門用來「與後端交換資料」的 API 端點，也稱為 資料對接的介面
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

// POST /api/todos：處理新增任務的請求
app.post('/api/todos', (req, res) => {
    const { task } = req.body; // 從前端送來的 JSON 中解析出 task
    if (!task) return res.status(400).json({ error: '任務內容不能為空' }); // 若沒輸入內容，回傳錯誤

    // 將 task 寫入 SQLite 資料庫（todos 表）
    db.run('INSERT INTO todos (task) VALUES (?)', [task], function(err) {
        if (err) {
            console.error('新增失敗:', err.message); // 寫入失敗，回傳錯誤訊息
            res.status(500).json({ error: '新增失敗' });
        } else {
            // 寫入成功，回傳剛新增的任務資料（含 ID 和完成狀態）
            res.json({ id: this.lastID, task, completed: 0 });
        }
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器運行於 http://localhost:${port}`);
});