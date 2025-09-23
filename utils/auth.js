// utils/auth.js - 最终版
// 简化用户数据结构，统一数据来源

class AuthManager {
  constructor() {
    this.user = null;
    this.isAdmin = false;
    this.init();
  }

  init() {
    // 从存储加载用户信息
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const user = wx.getStorageSync('userInfo');
      if (user) {
        console.log('[Auth] 从存储加载用户:', user);

        // 清理重复的权限字段，只保留isAdmin
        const cleanedUser = this.cleanUserData(user);

        // 验证权限状态 - 只检查isAdmin字段
        this.isAdmin = this.checkAdminStatus(cleanedUser);

        // 更新用户信息，确保只包含一个权限字段
        this.user = {
          ...cleanedUser,
          isAdmin: this.isAdmin
        };

        // 同步到全局
        const app = getApp();
        if (app) {
          app.globalData.userInfo = this.user;
          app.globalData.isAdmin = this.isAdmin;
        }

        // 更新存储，确保数据一致性
        wx.setStorageSync('userInfo', this.user);

        return this.user;
      }
      console.log('[Auth] 存储中无用户信息');
      return null;
    } catch (e) {
      console.error('[Auth] 加载用户信息失败:', e);
      return null;
    }
  }

  setUser(user) {
    console.log('[Auth] 设置用户:', user);

    // 清理用户数据，移除重复权限字段
    const cleanedUser = this.cleanUserData(user);

    // 验证权限状态 - 只检查isAdmin字段
    this.isAdmin = this.checkAdminStatus(cleanedUser);

    // 创建统一的用户对象
    this.user = {
      ...cleanedUser,
      isAdmin: this.isAdmin
    };

    console.log('[Auth] 用户权限状态:', {
      isAdmin: this.isAdmin,
      userId: this.user.id,
      username: this.user.username
    });

    // 存储用户信息
    wx.setStorageSync('userInfo', this.user);

    // 同步到全局
    const app = getApp();
    if (app) {
      app.globalData.userInfo = this.user;
      app.globalData.isAdmin = this.isAdmin;
    }

    // 如果是管理员，显示提示
    if (this.isAdmin) {
      wx.showToast({
        title: '管理员账户登录成功',
        icon: 'success',
        duration: 2000
      });
    }
  }

  clearUser() {
    console.log('[Auth] 清除用户信息');
    this.user = null;
    this.isAdmin = false;
    wx.removeStorageSync('userInfo');

    const app = getApp();
    if (app) {
      app.globalData.userInfo = null;
      app.globalData.isAdmin = false;
    }
  }

  checkAdminStatus(user) {
    // 只检查isAdmin字段，不检查用户名
    return user && user.isAdmin === true;
  }

  cleanUserData(user) {
    // 移除重复的权限字段，只保留isAdmin
    const { is_admin, admin, ...cleanedUser } = user;
    return cleanedUser;
  }

  getCurrentUser() {
    return this.user;
  }

  isLoggedIn() {
    return !!this.user;
  }

  hasAdminPermission() {
    return this.isAdmin;
  }
}

// 单例模式
const authManager = new AuthManager();
module.exports = authManager;
