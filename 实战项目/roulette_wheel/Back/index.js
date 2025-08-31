const express = require('express')
const app = express(); // 创建一个 express 示例
const router = require('./routes')

app.use(express.urlencoded({ extended: false })) // 解析表单数据
app.use(express.json()) // 解析 json 数据
app.use(express.static('histories'))


// 跨域处理
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  next()
})

app.use(router)

app.get('/',(req,res)=>{
  res.render('index.ejs')
}) // 静态界面展示


app.listen('3000',()=>{
  console.log('3000 端口启动成功')
})