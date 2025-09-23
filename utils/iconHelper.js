// 图标辅助工具
// 提供图标解决方案，避免图标文件缺失问题

class IconHelper {
  // 获取内置图标名称
  static getBuiltinIcon(tabName, isActive = false) {
    const icons = {
      home: isActive ? 'home-filled' : 'home',
      category: isActive ? 'app' : 'app',
      cart: isActive ? 'cart-filled' : 'cart',
      user: isActive ? 'user-filled' : 'user'
    };
    
    return icons[tabName] || 'circle';
  }

  // 检查图标文件是否存在
  static async checkIconExists(iconPath) {
    return new Promise((resolve) => {
      wx.getFileSystemManager().access({
        path: iconPath,
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  }

  // 获取可用的图标方案
  static async getAvailableIcon(tabName, isActive = false) {
    const iconPath = `assets/icons/${tabName}${isActive ? '-active' : ''}.png`;
    const exists = await this.checkIconExists(iconPath);
    
    if (exists) {
      return iconPath;
    }
    
    // 如果图标文件不存在，返回内置图标名称
    return this.getBuiltinIcon(tabName, isActive);
  }

  // 创建默认图标（开发时使用）
  static createDefaultIcons() {
    const tabs = ['home', 'category', 'cart', 'user'];
    
    tabs.forEach(tab => {
      ['', '-active'].forEach(suffix => {
        const path = `assets/icons/${tab}${suffix}.png`;
        this.createPlaceholderIcon(path);
      });
    });
  }

  // 创建占位符图标（仅用于开发）
  static createPlaceholderIcon(path) {
    // 这里可以创建一个简单的占位符图标
    // 实际项目中应该使用设计好的图标
    console.log(`创建占位符图标: ${path}`);
    // 实际实现需要创建图片文件
  }

  // 使用微信内置图标组件
  static renderBuiltinIcon(tabName, isActive = false, size = 20, color = '') {
    const iconName = this.getBuiltinIcon(tabName, isActive);
    return {
      type: 'icon',
      name: iconName,
      size: size,
      color: color || (isActive ? '#FF6B35' : '#999999')
    };
  }
}

module.exports = IconHelper;

// 使用示例：
// 1. 在页面中使用内置图标：
//    <icon type="{{iconHelper.getBuiltinIcon('home')}}" size="20" color="#FF6B35" />

// 2. 动态获取图标：
//    const iconPath = await IconHelper.getAvailableIcon('home', true);

// 3. 开发时创建占位符图标：
//    IconHelper.createDefaultIcons();