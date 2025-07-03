// import-data.js
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// 导入我们定义的 Toilet 模型
const Toilet = require('./src/models/toilet.model');

console.log('启动数据导入脚本...');

// 1. 连接到 MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ 数据库连接成功！");
  importData();
})
.catch(err => {
  console.error("❌ 数据库连接失败:", err);
  process.exit(1);
});

const importData = async () => {
  try {
    // 2. 读取 JSON 文件
    const toiletsJSON = JSON.parse(
      fs.readFileSync(`${__dirname}/haikou_toilets.json`, 'utf-8')
    );
    console.log(`✅ 成功读取 ${toiletsJSON.length} 条数据从 haikou_toilets.json 文件。`);
    
    // 3. 数据映射和清洗
    const toiletsToImport = toiletsJSON.map(toilet => ({
        sourceId: toilet.id, // 将高德的 id 映射到 sourceId
        name: toilet.name,
        address: toilet.address,
        location: toilet.location,
        // 其他字段将使用模型中定义的默认值
    }));
    console.log('⏳ 正在准备导入数据...');

    // 4. 清空数据库中的旧数据
    await Toilet.deleteMany();
    console.log('✅ 已清空旧数据。');

    // 5. 将新数据批量导入数据库
    await Toilet.insertMany(toiletsToImport);
    console.log('✅ 新数据已成功导入到数据库！');

  } catch (err) {
    console.error('❌ 导入过程中发生错误:', err);
  } finally {
    // 6. 断开数据库连接并退出脚本
    console.log('脚本执行完毕，断开数据库连接...');
    mongoose.disconnect();
    process.exit();
  }
};