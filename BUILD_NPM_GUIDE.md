# WeUI组件库构建指南

## 问题描述
微信开发者工具提示找不到WeUI组件路径，这是因为虽然WeUI已经安装，但还没有构建npm包来生成`miniprogram_npm`目录。

## 解决方案

### 方法一：在微信开发者工具中构建npm
1. 打开微信开发者工具
2. 点击顶部菜单栏的"工具"
3. 选择"构建npm"
4. 等待构建完成
5. 重新编译项目

### 方法二：修改项目配置（推荐）
在`project.config.json`中添加npm包构建配置：

```json
{
  "setting": {
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./"
      }
    ]
  }
}
```

### 方法三：使用命令行构建（如果支持）
```bash
# 在项目根目录执行
npm run build
```

## 验证构建成功
构建成功后，项目根目录会出现`miniprogram_npm`文件夹，包含：
- `weui-miniprogram/` - WeUI组件库
- 其他已安装的npm包

## 注意事项
- 构建npm后需要重新编译项目
- 如果仍然报错，尝试重启微信开发者工具
- 确保package.json中的dependencies包含`weui-miniprogram`

## 快速检查
```bash
# 检查WeUI是否已安装
ls node_modules/ | grep weui

# 检查miniprogram_npm目录是否存在
ls -la | grep miniprogram_npm
```

构建完成后，WeUI组件找不到的错误应该会消失。