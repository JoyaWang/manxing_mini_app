// 图片占位符工具
// 提供图片占位符解决方案，避免图片文件缺失问题

class ImagePlaceholder {
  // 获取商品占位符图片
  static getProductPlaceholder(index = 0) {
    const colors = ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const color = colors[index % colors.length];
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${color}"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">商品图片</text></svg>`;
  }

  // 获取分类占位符图标
  static getCategoryPlaceholder() {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f0f0f0"/><text x="50" y="55" font-family="Arial" font-size="12" fill="#666" text-anchor="middle" dominant-baseline="middle">分类</text></svg>`;
  }

  // 获取轮播图占位符
  static getBannerPlaceholder(index = 0) {
    const texts = ['热门商品', '新品上市', '特价优惠'];
    const colors = ['#FF6B35', '#4ECDC4', '#45B7D1'];
    const text = texts[index % texts.length];
    const color = colors[index % colors.length];
    
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="750" height="300" viewBox="0 0 750 300"><rect width="750" height="300" fill="${color}"/><text x="375" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  }

  // 检查图片是否存在，如果不存在返回占位符
  static async getImageWithFallback(imagePath, fallbackType = 'product', index = 0) {
    if (!imagePath) {
      return this.getPlaceholderByType(fallbackType, index);
    }
    
    // 如果是数据URL或网络图片，直接返回
    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // 检查本地文件是否存在
    try {
      const fs = wx.getFileSystemManager();
      await new Promise((resolve, reject) => {
        fs.access({
          path: imagePath,
          success: resolve,
          fail: reject
        });
      });
      return imagePath;
    } catch (error) {
      return this.getPlaceholderByType(fallbackType, index);
    }
  }

  // 根据类型获取占位符
  static getPlaceholderByType(type, index = 0) {
    switch (type) {
      case 'product':
        return this.getProductPlaceholder(index);
      case 'category':
        return this.getCategoryPlaceholder();
      case 'banner':
        return this.getBannerPlaceholder(index);
      default:
        return this.getProductPlaceholder(index);
    }
  }
}

module.exports = ImagePlaceholder;

// 使用示例：
// 1. 直接使用占位符：
//    <image src="{{ImagePlaceholder.getProductPlaceholder()}}" />

// 2. 带fallback的图片：
//    <image src="{{ImagePlaceholder.getImageWithFallback(item.image, 'product', index)}}" />

// 3. 在JS中预处理：
//    const imageUrl = await ImagePlaceholder.getImageWithFallback(product.image, 'product');