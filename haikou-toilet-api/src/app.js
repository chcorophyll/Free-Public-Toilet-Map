// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // 加载 .env 文件中的环境变量

// 1. 初始化 Express 应用
const app = express();

// 2. 中间件设置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON格式的请求体

// 3. 连接到 MongoDB 数据库
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Successfully connected to MongoDB Atlas!"))
.catch(err => {
  console.error("Database connection error:", err);
  process.exit(1);
});

// 4. 定义API路由
const toiletRoutes = require('./routes/toilet.routes');
app.use('/api/v1/toilets', toiletRoutes);

// 5. 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});