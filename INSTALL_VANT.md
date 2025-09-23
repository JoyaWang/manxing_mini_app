# Vant Weapp 组件库安装指南

## 安装步骤

### 1. 使用 npm 安装
```bash
npm init -y
npm i @vant/weapp -S --production
```

### 2. 修改 app.json
将使用组件路径改为：
```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index"
  }
}
```

### 3. 构建 npm 包
在微信开发者工具中：
1. 点击菜单栏：工具 -> 构建 npm
2. 勾选"使用 npm 模块"选项
3. 点击"确定"完成构建

### 4. 引入组件
在需要使用Vant组件的页面的json文件中添加：
```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index"
  }
}
```

## 注意事项

1. **微信开发者工具设置**：
   - 需要开启"使用npm模块"功能
   - 需要执行"构建npm"操作

2. **版本兼容性**：
   - 确保微信基础库版本支持Vant组件
   - 推荐使用最新版本的Vant Weapp

3. **样式引入**：
   - Vant组件会自动引入所需样式
   - 如需自定义样式，可覆盖默认样式类名

## 常见问题

### Q: 组件找不到？
A: 确保已执行"构建npm"操作，并且组件路径正确

### Q: 样式不生效？
A: 检查是否在app.json中正确配置了组件路径

### Q: 构建失败？
A: 检查package.json中是否正确安装了@vant/weapp