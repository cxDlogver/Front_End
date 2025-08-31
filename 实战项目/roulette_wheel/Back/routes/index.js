const express = require('express')
const router = express.Router();
const fs = require('fs').promises;
const path = require('path')
const jwt = require('jsonwebtoken')

const SECRET_KEY = '123456'



// views 路由
// 请求历史记录数据
router.get('/histories',(req,res)=>{
  const token = req.headers.authorization;
  if(!token){
    return res.status(401).send({code:401,msg:'未授权'})
  }
  try{
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('解码后的 payload:', decoded);

      // 读取config.json文件
    const config = require('../histories/conf.json')
    let data = [];
    for(const item in config){

      if(decoded.username === item){
        data = config[item];
        break;
      }
    }
    console.log("成功发送历史记录条数：",data.length)
    res.send({
      code: 200,
      data: data
    })  
  }catch(err){
    return res.status(401).send({code:401,msg:'未授权'})
  }

})

// 请求写入数据
router.post('/write', async (req,res) => {
  try{
    const data = req.body.data;
    const id = Number(req.body.id);
    const username = req.body.username;
    let config = [];
    try {
      config = JSON.parse(await fs.readFile(path.join(__dirname,'../histories/conf.json'),'utf8'));
    } catch(e){}
    if(!config[username]){
      config[username] = [];
    }
    if(id >= config[username].length){
      config[username].unshift(data);
    }else config[username][id] = data;
    await fs.writeFile(path.join(__dirname,'../histories/conf.json'), JSON.stringify(config,null,2),'utf8')
    console.log("写入成功");
    res.send({code:200});
  }catch(err){
    console.error('写入失败:', err);
    res.status(500).send({code:500});
  }
});

// 请求删除数据
router.delete('/delete', async (req,res) => {
  console.log("删除请求：",req.query)
  try{
    const id = Number(req.query.id);
    const username = req.query.username;

    let config = {};
    try {
      config = JSON.parse(await fs.readFile(path.join(__dirname,'../histories/conf.json'),'utf8'));
    } catch(e){}
    if(!config[username]){
      res.send({code:500});
    }
    if(id >= config[username].length){
      res.send({code:500});
    }else config[username].splice(id,1);
    if(config[username].length === 0){
      delete config[username];
    }

    await fs.writeFile(path.join(__dirname,'../histories/conf.json'), JSON.stringify(config,null,2),'utf8')
    console.log("删除成功");
    res.send({code:200});
  }catch(err){
    console.error('删除失败:', err);
    res.status(500).send({code:500});
  }
})

// 请求登录
router.post('/login', async (req,res)=>{
  console.log("登录请求：",req.body)
  const {username,password} = req.body; // 对象解耦
  const userInfo = JSON.parse(await fs.readFile(path.join(__dirname, '../user/conf.json'), 'utf8'))

  const user = userInfo.find(u => u.username === username)

  if (user && user.password === password) {
    console.log("登录成功")
    const token = jwt.sign({username}, SECRET_KEY, {expiresIn: '1h'})
    return res.send({ code: 200, token })
  }

  if (user) {
    console.log("登录失败")
    return res.status(401).send({ code: 401, msg: '密码错误' })
  }

  userInfo.push({"username": username, "password": password})
  try {
    await fs.writeFile(path.join(__dirname,'../user/conf.json'), JSON.stringify(userInfo,null,2),'utf8')
    console.log("注册成功")
    const token = jwt.sign({username: username}, SECRET_KEY, {expiresIn: '1h'})
    res.send({
      code: 200,
      token: token
    })
  }catch(err){
    console.error('注册失败:', err);
    res.status(500).send({code:500});
  }
})


module.exports = router;
