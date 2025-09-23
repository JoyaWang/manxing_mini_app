# 微信商城小程序配置指南

## 后端配置说明

本小程序支持两种后端服务：腾讯云和Supabase。您可以根据需要一键切换。

### 腾讯云配置

1. **开通腾讯云开发服务**
   - 访问 [腾讯云控制台](https://console.cloud.tencent.com/tcb)
   - 创建云开发环境，获取环境ID

2. **配置腾讯云环境**
   在 `app.js` 文件中修改腾讯云配置：

```javascript
globalData: {
  backendType: 'tencent', // 默认使用腾讯云
  config: {
    tencent: {
      env: 'your-cloud-env-id' // 替换为您的环境ID
    },
    supabase: {
      url: 'your-supabase-url',
      key: 'your-supabase-key'
    }
  }
}
```

3. **云函数部署**
   - 在云开发控制台中创建以下云函数：
     - `products` - 商品管理
     - `orders` - 订单管理  
     - `users` - 用户管理
     - `cart` - 购物车管理

### Supabase配置

1. **创建Supabase项目**
   - 访问 [Supabase官网](https://supabase.com/)
   - 创建新项目，获取URL和API密钥

2. **配置Supabase连接**
   在 `app.js` 中修改Supabase配置：

```javascript
globalData: {
  backendType: 'supabase', // 切换为Supabase
  config: {
    tencent: {
      env: 'your-cloud-env-id'
    },
    supabase: {
      url: 'https://your-project.supabase.co', // 替换为您的Supabase URL
      key: 'your-supabase-anon-key' // 替换为您的API密钥
    }
  }
}
```

3. **数据库表结构**
   在Supabase中创建以下表：

```sql
-- 商品表
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  openid VARCHAR(255) UNIQUE,
  nickName VARCHAR(255),
  avatarUrl TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 切换后端类型

### 方法一：代码切换

在管理员后台页面，点击"切换后端"按钮：

```javascript
// 在管理后台切换后端
onSwitchBackend() {
  const newType = this.data.backendType === 'tencent' ? 'supabase' : 'tencent';
  app.switchBackendType(newType);
  util.showSuccess(`已切换到${newType === 'tencent' ? '腾讯云' : 'Supabase'}`);
}
```

### 方法二：手动修改配置

直接修改 `app.js` 中的 `backendType`：

```javascript
globalData: {
  backendType: 'supabase', // 改为 'tencent' 或 'supabase'
  // ... 其他配置
}
```

## 环境变量配置（推荐）

对于生产环境，建议使用环境变量：

1. 创建 `.env` 文件：

```bash
TENCENT_ENV=your-production-env-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

2. 在构建时注入环境变量

## 权限配置

### 管理员权限

管理员用户识别规则：
- 用户ID为1
- 或用户名为'admin'

在用户表中确保至少有一个管理员账号。

## 调试技巧

1. **查看当前后端类型**
   ```javascript
   console.log('当前后端类型:', api.getBackendType());
   ```

2. **强制使用模拟数据**
   ```javascript
   // 在开发阶段可以使用模拟数据
   api.useMock = true;
   ```

3. **监控API请求**
   - 打开小程序调试器
   - 查看Network面板中的API请求

## 常见问题

### Q: 切换后端后数据不更新？
A: 确保两种后端的数据结构一致，或者重新登录刷新数据。

### Q: 管理员无法访问后台？
A: 检查用户ID或用户名是否符合管理员规则。

### Q: API请求失败？
A: 检查网络连接和后端服务配置是否正确。

## 支持与反馈

如有问题，请检查：
1. 网络连接是否正常
2. 后端服务配置是否正确
3. 数据库表结构是否完整