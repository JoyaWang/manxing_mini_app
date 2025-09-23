# 微信商城小程序

## 项目概述
一个完整的微信商城小程序，包含消费者购物和管理后台功能，支持腾讯云和Supabase双后端切换。

## 功能特性

### 消费者功能
- ✅ 首页商品展示
- ✅ 商品分类浏览
- ✅ 商品搜索和筛选
- ✅ 商品详情查看
- ✅ 购物车管理
- ✅ 订单创建和支付
- ✅ 个人中心（订单管理、地址管理）
- ✅ 微信一键登录

### 管理后台功能
- ✅ 商品管理（添加、编辑、上下架、删除）
- ✅ 订单管理（查看、状态更新）
- ✅ 用户管理（用户列表、权限设置）
- ✅ 首页板块管理（显示/隐藏控制）
- ✅ 数据统计（商品数、订单数、销售额）
- ✅ 双后端一键切换（腾讯云/Supabase）

### 技术特性
- 🎨 现代UI设计，响应式布局
- 🔄 双后端架构，支持无缝切换
- 🔐 JWT身份认证
- 📱 微信小程序原生开发
- 🚀 Node.js Express后端API
- 💾 支持MySQL和PostgreSQL

## 快速开始

### 1. 安装依赖
```bash
# 后端依赖
cd backend && npm install

# 前端依赖（微信开发者工具中）
# 需要安装Vant Weapp组件库
```

### 2. 配置后端
复制并修改配置文件：
```bash
cp backend/config/config.example.js backend/config/config.js
```

编辑 `backend/config/config.js` 配置数据库连接信息。

### 3. 启动后端服务器
```bash
cd backend && npm start
```
服务器将在 http://localhost:3001 启动

### 4. 配置小程序
在微信开发者工具中：
1. 导入项目目录
2. 配置AppID（需要注册微信小程序）
3. 确保网络请求域名为本地服务器地址

### 5. 测试登录
- 消费者：使用普通用户账号登录
- 管理员：使用admin账号登录（ID为1或用户名为admin）

## 数据库配置

### 腾讯云MySQL配置
```javascript
{
  host: 'your-mysql-host',
  user: 'your-username',
  password: 'your-password',
  database: 'wechat_mall'
}
```

### Supabase配置
```javascript
{
  connectionString: 'your-supabase-connection-string'
}
```

## API接口

### 基础URL
`http://localhost:3001/api`

### 主要接口
- `GET /health` - 健康检查
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/auth/login` - 用户登录
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `GET /api/users` - 获取用户列表

## 管理后台使用

### 访问方式
1. 在登录页面选择"管理员登录"
2. 使用管理员账号登录
3. 进入管理后台界面

### 功能说明
- **商品管理**: 管理所有商品信息
- **订单管理**: 查看和处理用户订单
- **用户管理**: 管理用户账号和权限
- **首页配置**: 控制首页各个板块的显示状态
- **后端切换**: 在腾讯云和Supabase之间切换

## 常见问题

### Q: Vant组件库找不到？
A: 需要在微信开发者工具中安装Vant Weapp组件库

### Q: 后端连接失败？
A: 检查数据库配置和服务器端口是否被占用

### Q: 管理员权限不足？
A: 确保用户ID为1或用户名为admin

## 开发说明

### 项目结构
```
商城小程序/
├── pages/                 # 小程序页面
│   ├── index/             # 首页
│   ├── product/           # 商品相关
│   ├── order/             # 订单相关
│   ├── user/              # 用户相关
│   └── admin/             # 管理后台
├── backend/               # 后端服务器
│   ├── config/           # 配置文件
│   ├── models/           # 数据模型
│   ├── routes/           # API路由
│   └── utils/            # 工具函数
├── utils/                # 前端工具函数
└── app.json             # 小程序配置
```

### 代码规范
- 使用ES6+语法
- 遵循微信小程序开发规范
- 使用async/await处理异步
- 统一的错误处理机制

## 技术支持
如有问题，请检查：
1. 后端服务器是否正常运行
2. 数据库连接配置是否正确
3. 微信开发者工具控制台错误信息
4. 网络请求是否被拦截

## 版本信息
- 微信基础库: 3.10.1
- Node.js: v18+
- MySQL: 8.0+
- PostgreSQL: 14+