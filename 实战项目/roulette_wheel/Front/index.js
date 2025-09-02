import { RequestHistoryName, RequestWriteData, RequestDeleteData, RequestLogin} from './request.js'

// index界面
const indexTemplate = document.getElementById('index');
// 按钮界面
const loginTemplate = document.getElementById('login');
// 展示界面
const bodyElement = document.querySelector('body');

console.log(indexTemplate.content.querySelector("div"))

const ShowIndex = () => {
  if (bodyElement.getElementsByTagName('div').length > 0) {
    bodyElement.removeChild(bodyElement.lastChild);
  }
  bodyElement.appendChild(indexTemplate.content.querySelector("div").cloneNode(true));
  const token = localStorage.getItem('token') || ''

  //登出
  const loginLayoutElement = document.getElementById('login_layout')
  loginLayoutElement.addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    ShowLogin();
  })
  // 菜单栏按钮组
  const menuButtonElements = document.getElementsByClassName('menu-item') // 返回的是类数组对象
  // 轮盘区域元素
  const wheelContainerElement = document.getElementById('wheel-container')
  // 菜单栏添加按钮
  const addBtnElement = document.getElementById('add-btn')
  // 轮盘表单区域
  const formElement = document.getElementById('wheel-form');
  // 菜单栏按钮组
  const menuItemsDiv = document.getElementById('menu-items')
  // 历史记录数据
  let menuItems = null;
  let currentId = void 0;
  let data = void 0; // 当前轮盘数据
  InitMenu()
  /** 初始化菜单栏 获取历史记录并渲染按钮到菜单栏界面。 */
  async function InitMenu() {
    // 登出按钮显示用户名
    loginLayoutElement.innerHTML = localStorage.getItem('username')
    const menuItemsArr = Array.from(menuButtonElements);
    // 清空菜单栏按钮
    menuItemsArr.forEach(item => {
      item.remove();
    })
    menuItems = await RequestHistoryName(token)
    if(menuItems === null){
      alert('获取历史记录失败')
      return
    }
    if(!menuItems){
      console.log("未登录")
      ShowLogin()
    }
    console.log("历史记录:", menuItems);
    // 挂载到菜单栏中
    menuItems.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.classList.add('menu-item');
      btn.style.position = 'relative';
      btn.innerHTML = `<span> ${item.name} </span>`;
      const delMenuItemBtn = document.createElement('button');
      delMenuItemBtn.innerText = '×';
      delMenuItemBtn.classList.add('del-item');
      btn.appendChild(delMenuItemBtn);
      delMenuItemBtn.style.position = 'absolute';
      delMenuItemBtn.style.right = '10px';
      delMenuItemBtn.style.top = '5px';
      delMenuItemBtn.style.display = 'none';
      // 菜单项删除事件
      delMenuItemBtn.addEventListener('click', async ()=>{
        if(!confirm("确认删除菜单项？")){
          return
        }
        // 调用删除接口
        await RequestDeleteData(index)
        // 刷新菜单
        setTimeout(() => {
          InitMenu()
          // 清空数据
        }, 1000);
      })
      menuItemsDiv.appendChild(btn);
    })
    // 菜单栏按钮绑定点击事件， 将当前标签设置active， 轮盘展示区由不可见显示为可见
    let menuButtons = Array.from(menuButtonElements) // 转换为数组
    menuButtons.push(addBtnElement)
    menuButtons.forEach((btn, index) => {
      btn.removeAttribute('active');
      if(index === currentId) {
        btn.setAttribute('active', 'true');
        InitWheel();
      }
      // 点击事件
      btn.addEventListener('click', () => {
        // 移除所有按钮的active类
        menuButtons.forEach(btn => {
          btn.removeAttribute('active');
        })
        // 添加当前按钮的active类
        btn.setAttribute('active', 'true');
        // 当前的id
        currentId = index; // menuItems.length 表示新建轮盘数据
        InitWheel()
      })
      // 触发事件
      btn.addEventListener('mouseenter', ()=>{
        const delMenuItemBtn = btn.getElementsByTagName('Button').item(0)
        if(delMenuItemBtn)
          delMenuItemBtn.style.display = 'block';
      })
      btn.addEventListener('mouseleave', ()=>{
        const delMenuItemBtn = btn.getElementsByTagName('Button').item(0)
        if(delMenuItemBtn)
          delMenuItemBtn.style.display = 'none';
      })
    })
    
  }
  // 轮盘初始化
  const InitWheel = ()=>{
    // 展示轮盘区域
    wheelContainerElement.style.display = 'flex';
    // From表单区域清空
    formElement.style.display = 'none';
    // 加载数据
    console.log(currentId, menuItems.length)
    data = (currentId === undefined || currentId >= menuItems.length) ? 
    {
      "name": "新建轮盘",
      "content": [
        {
          "name": '',
          "content": '',
        },
        {
          "name": '',
          "content": '',
        }
      ],
      "time": new Date(Date.now()).toLocaleString()
    } 
    : structuredClone(menuItems[currentId])
    console.log("当前轮盘数据：", data);
    // 绘图
    DrawWheel(data.content)
    // 标题显示
    const headerName = document.getElementById('header-name')
    headerName.innerHTML = `欢迎使用轮盘转项目 -- <span>${data.name} </span>`
  }
  // 轮盘编辑按钮
  const updateButton = document.getElementById("update-btn");
  // 轮盘开始按钮
  const startButton = document.getElementById('start-btn')
  // 表单项按钮
  const formButtonDIV = document.getElementById('button-group')
  // 表单项添加按钮
  const formAddButton = formButtonDIV.children[0]
  // 表单提交按钮
  const formSubmitButton = formButtonDIV.children[1]
  // 表单取消按钮
  const formCancelButton = formButtonDIV.children[2]
  // 表单项元素
  const formItemsDIV = document.getElementsByClassName('form-item')
  // 表单标题
  const formHeaderElement = document.getElementById('form-header');
  /** 编辑按钮——编辑轮盘数据 */ 
  updateButton.addEventListener('click', ()=>{
    formElement.style.display = 'block';
    // 清空表单项
    const formItems = Array.from(formItemsDIV)
    formItems.forEach(item => {
      item.remove()
    })
    console.log(currentId)
    console.log(menuItems)
    console.log(data)
    formHeaderElement.value = data.name
    // 表单项
    data.content.forEach((item, index) => {
      AddFormItem(item, index)
    })
    // 添加删除按钮
    const lastFormItem = formItemsDIV[formItemsDIV.length-1]
    const delBtn = document.createElement('button')
    delBtn.innerText = '×'
    delBtn.classList.add('del-item')
    lastFormItem.appendChild(delBtn)
    delBtn.addEventListener('click', DelFormItem)
  })
  // 创建表单项
  formAddButton.addEventListener('click', ()=>{
    const item = {
      "name": '',
      "content": '',
    }
    data.content.push(item)
    AddFormItem(item, data.content.length-1)
    // 重置删除按钮
    // 移除最后一个删除按钮
    const lastDelBtn = formItemsDIV[formItemsDIV.length-2].children[2]
    lastDelBtn.remove()
    const lastFormItem = formItemsDIV[formItemsDIV.length-1]
    const delBtn = document.createElement('button')
    delBtn.innerText = '×'
    delBtn.classList.add('del-item')
    lastFormItem.appendChild(delBtn)
    delBtn.addEventListener('click', DelFormItem)
  })
  // 添加表单项
  const AddFormItem = (item, index) => {
    const formItemElement = document.createElement('div') // 创建表单项
    formItemElement.classList.add('form-item')
    formItemElement.innerHTML = `<span>选项${index+1}</span><input type="text" value='${item.name}'>`
    formElement.insertBefore(formItemElement, formButtonDIV)
  }
  // 删除表单项
  const DelFormItem = (e)=>{
    if(formItemsDIV.length === 2) {
      alert('至少保留两个选项')
      return
    }
    e.target.parentElement.remove()
    // 删除数据
    data.content.pop()
    console.log(data.content)
    // 重置删除按钮
    const lastFormItem = formItemsDIV[formItemsDIV.length-1]
    const delBtn = document.createElement('button')
    delBtn.classList.add('del-item')
    delBtn.innerText = '×'
    lastFormItem.appendChild(delBtn)
    delBtn.addEventListener('click', DelFormItem)
  }
  // 取消按钮
  formCancelButton.addEventListener('click', ()=>{
    formElement.style.display = 'none';
    // 清空数据
    data = void 0;
    InitMenu()
  })
  // 提交按钮
  formSubmitButton.addEventListener('click', async (e)=>{
    let flag = false
    const formItems = Array.from(formItemsDIV)
    formItems.forEach((item, index) => {
      const name = item.children[1].value
      if(!name) {
        flag = true
        return
      }
      data.content[index].name = name
    })
    if(!formHeaderElement.value) {
      flag = true
    }
    if(flag) {
      alert('请完成所有选项')
      return
    }
    data.name = formHeaderElement.value
    console.log(currentId)
    await RequestWriteData(data, currentId)
    // 关闭表单
    wheelContainerElement.style.display = 'none';
    if(currentId === menuItems.length){
      currentId = 0
    }
    // 刷新菜单
    setTimeout(() => {
      InitMenu()
      // 清空数据
      data = void 0;
    }, 1000);
  })
  // canvas 使用模板
  const canvas = document.getElementById('wheel') // 获取canvas元素
  const ctx = canvas.getContext('2d') // 获取上下文
  canvas.width = canvas.clientWidth // 画布宽度
  canvas.height = canvas.clientHeight // 画布高度
  ctx.clearRect(0, 0, canvas.width, canvas.height) // 清除画布
  ctx.save() // 保存当前状态
  // 相关操作
  ctx.translate(canvas.width / 2, canvas.height / 2) // 坐标点移动到中心
  ctx.rotate(Math.PI / 2) // 旋转90度
  ctx.beginPath() // 开始路径
  ctx.fillStyle = 'white' // 样式设置
  ctx.arc(0, 0, canvas.width / 2, 0, 2 * Math.PI) // 绘制圆
  ctx.fill() // 填充 
  ctx.closePath() // 关闭路径
  ctx.restore() // 恢复状态
  // 绘图
  const DrawWheel = (data, rotation = 0) => {
    const colors = [
      '#FF6B6B', // 鲜红
      '#FFD93D', // 明黄
      '#6BCB77', // 草绿
      '#4D96FF', // 亮蓝
      '#FF922B', // 橙色
      '#845EC2', // 紫色
      '#FF5E78', // 粉色
      '#00C9A7', // 青绿
      '#FFC75F', // 金黄
      '#F9F871'  // 柠檬黄
    ]
    const canvas = document.getElementById('wheel')
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    // console.log("canvas:", canvas)
    // console.log("ctx:", ctx)
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const radius = canvas.width / 2
    const angle = 2 * Math.PI / data.length
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(rotation);   // 整个转盘旋转
    data.forEach((item, index) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = colors[index % colors.length]
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = 3
      ctx.arc(0, 0, radius, (index * angle + 0.5 * Math.PI) % (2 * Math.PI), ((index + 1) * angle + 0.5 * Math.PI) % (2 * Math.PI)) 
      ctx.fill()
      ctx.stroke()
      ctx.closePath();
      // 文字
    })
    data.forEach((item, index) => {
      ctx.save(); // 保存状态
      const textAngle = (index * angle + 0.5 * angle + 0.5 * Math.PI) % (2 * Math.PI);
      ctx.rotate(textAngle);           // 旋转到扇形中点角度
      ctx.font = '20px serif';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      // 在旋转后的坐标系中，直接放在 (文字半径, 0)
      ctx.fillText(item.name, radius * 0.9, 0, radius*0.8);
      ctx.restore(); // 恢复状态
    })
    ctx.restore();
    // 箭头
    ctx.beginPath();
    ctx.moveTo(radius-30, radius * 2);
    ctx.lineTo(radius + 30, radius * 2);
    ctx.lineTo(radius, radius * 2 - 150);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.stroke()
    ctx.fill();
  }
  let rotation = 0;       // 当前角度
  let spinning = false;   // 是否正在旋转
  let speed = 0;          // 当前速度

  // 动画循环
  const animate = ()=>{
    if (spinning) {
      rotation += speed;
      speed *= 0.98 + Math.random() * 0.02;   // 摩擦力减速
      if (speed < 0.002) { // 停止条件
        spinning = false;
        speed = 0;
        return
      }
    }
    DrawWheel(data.content, rotation);
    requestAnimationFrame(animate);
  }
  // 开始按钮
  startButton.addEventListener('click', ()=>{
    if(spinning) {
      return
    }
    spinning = true;
    speed = Math.random() + Math.random();
    animate()
  })
}

const ShowLogin = () => {
  if (bodyElement.getElementsByTagName('div').length > 0) {
    bodyElement.removeChild(bodyElement.lastChild);
  }
  bodyElement.appendChild(loginTemplate.content.querySelector("div").cloneNode(true)) 
  
  const loginBtn = document.querySelector('.login-btn');
  loginBtn.addEventListener('click', () => {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    if (username === '' || password === '') {
      alert('请输入用户名和密码');
      return;
    }
    // 登录请求
    RequestLogin(username, password).then(res => {
      if(res){
        window.location.href = 'index.html'
      }
      else{
        alert('登录失败')
      }
    })
  })
}

ShowIndex()




