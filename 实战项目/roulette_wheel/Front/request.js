
const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

// 请求历史记录数据
const RequestHistoryName = async(token) => {
  try{
    const res = await request.get('/histories', {
      "headers":{
        "Authorization":token
      }
    })
  
    if(res.data.code === 200){
      // console.log(res)
      return res.data.data
    }
  }catch(err){
    if(err.response.status === 401){
      console.log("未登录")
      return false
    }
    console.log(err)
    return null
  }
}

// 请求写入数据
const RequestWriteData = async(data, currentID) =>{
  try{
    const res = await request.post('/write', {
      "data":data,
      "id":currentID,
      "username":localStorage.getItem('username')
    })
    if(res.data.code === 200){
      console.log("写入成功") 
    }
  }catch(err){
    console.log(err)
  }
}

// 请求删除数据
const RequestDeleteData = async(ID) =>{
  try{
    const res = await request.delete('/delete', 
    {
      "params":{
        id:ID,
        username:localStorage.getItem('username')
      }
    }
    )
    if(res.data.code === 200){
      console.log("删除成功") 
    }
  }catch(err){
    console.log(err)
  }
}

// 登录请求
const RequestLogin = async(username, password) => {
  try{
    const res = await request.post('/login', {
      "username":username,
      "password":password
    })
    
    if(res.data.code === 200){
      console.log("登录成功") 
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', username)
      return true
    }
  }catch(err){
    console.log(err)
    return false
  }
}



export { RequestHistoryName, RequestWriteData, RequestDeleteData, RequestLogin }

