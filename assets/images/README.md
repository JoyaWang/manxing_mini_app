# 图片资源目录

此目录存放小程序使用的图片资源文件。

## 推荐图片尺寸

- **轮播图**: 750x400px
- **商品主图**: 400x400px  
- **分类图标**: 100x100px
- **用户头像**: 120x120px
- **品牌Logo**: 200x200px

## 图片命名规范

- 使用小写字母和连字符
- 描述性命名，如 `product-iphone15.jpg`
- 保持一致性

## 示例图片结构

```
images/
├── category/          # 分类图片
│   ├── phone.jpg     # 手机数码
│   ├── computer.jpg  # 电脑办公
│   └── clothing.jpg  # 服装鞋包
├── products/          # 商品图片
│   ├── iphone15.jpg  # iPhone商品图
│   ├── macbook.jpg   # MacBook商品图
│   └── airpods.jpg   # AirPods商品图
├── banners/           # 轮播图
│   ├── banner1.jpg   # 轮播图1
│   ├── banner2.jpg   # 轮播图2
│   └── banner3.jpg   # 轮播图3
├── icons/             # 图标
│   ├── cart.png      # 购物车图标
│   ├── user.png      # 用户图标
│   └── home.png      # 首页图标
└── avatars/           # 头像
    ├── default.png   # 默认头像
    └── user1.png     # 用户头像示例
```

## 图片优化建议

1. **压缩图片**: 使用工具压缩图片大小
2. **合适格式**: 
   - JPEG: 适合照片类图片
   - PNG: 适合需要透明度的图片
   - WebP: 更好的压缩效果（微信支持）
3. **响应式图片**: 提供不同尺寸的图片版本
4. **懒加载**: 对非首屏图片使用懒加载

## 注意事项

- 确保图片版权合法
- 图片文件大小控制在合理范围内
- 定期清理未使用的图片资源