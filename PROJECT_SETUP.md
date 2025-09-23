# 微信商城小程序项目设置指南

## 已知问题
微信开发者工具构建npm时可能会报告long包语法错误，这是mysql2的依赖，不影响小程序功能。

## 解决方案

### 方案1：忽略错误（推荐）
1. 在微信开发者工具中构建npm
2. 忽略long包的语法错误警告
3. 构建完成后Vant组件即可正常使用

### 方案2：配置忽略
在微信开发者工具设置中：
1. 打开设置 -> 项目设置
2. 在"ES6转ES5"选项中勾选"忽略npm模块的ES6转ES5"
3. 重新构建npm

### 方案3：使用自定义构建
如果仍然有问题，可以：
1. 删除node_modules/@vant/weapp
2. 直接从官网下载Vant组件：https://vant-contrib.gitee.io/vant-weapp/#/quickstart
3. 将组件放在`miniprogram_npm/@vant/weapp/`目录

## 后端API
- 服务器: http://localhost:3001
- 健康检查: http://localhost:3001/health
- 商品API: http://localhost:3001/api/products

## 快速开始
1. 启动后端: `cd backend && npm start`
2. 打开微信开发者工具，导入项目
3. 构建npm（忽略long包错误）
4. 编译运行小程序

long包的语法错误不影响Vant组件的使用，可以安全忽略。