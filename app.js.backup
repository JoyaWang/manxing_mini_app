// app.js
const AuthManager = require('./utils/auth');

App({
  onLaunch() {
    // 异步初始化云开发环境（避免阻塞启动）
    setTimeout(() => {
      this.initCloudEnvironment();
    }, 100);
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 根据登录状态决定是否跳转到登录页面
    this.redirectBasedOnLoginStatus();
  },

  globalData: {
    userInfo: null,
    backendType: 'tencent', // 'tencent' 或 'supabase'
    config: {
      tencent: {
        //env: 'cloud1-3g4i92y9839a6fe3'//free
        env: 'manxing-mall-8gvmc6103b5c51eb'//云开发环境个人版
      },
      supabase: {
        url: 'https://lcyfjbaqihrnlvwmlzmm.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeWZqYmFxaWhybmx2d21sem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDcwMzMsImV4cCI6MjA3Mzk4MzAzM30.veoMaIBQJjOnw4s8RlRz2CS_83kQWrsE-sF7idS5j50'
      },
      localBackend: {
        baseURL: 'http://localhost:3002'
      }
    }
  },

  // 初始化云环境
  initCloudEnvironment() {
    const { backendType, config } = this.globalData;
    
    if (backendType === 'tencent') {
      wx.cloud.init({
        env: config.tencent.env,
        traceUser: true
      });
    }
    // Supabase 初始化在具体API中处理
  },

  // 切换后端类型
  switchBackendType(type) {
    if (['tencent', 'supabase'].includes(type)) {
      this.globalData.backendType = type;
      this.initCloudEnvironment();
      wx.showToast({
        title: `已切换到${type === 'tencent' ? '腾讯云' : 'Supabase'}`,
        icon: 'success'
      });
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    // 由AuthManager统一管理
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
      } else {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (res) => {
            const userInfo = res.userInfo;
            this.globalData.userInfo = userInfo;
            wx.setStorageSync('userInfo', userInfo);
            resolve(userInfo);
          },
          fail: (err) => {
            reject(err);
          }
        });
      }
    });
  },

  // 根据登录状态进行跳转
  redirectBasedOnLoginStatus() {
    const userInfo = this.globalData.userInfo;
    const currentPage = getCurrentPages();
    
    // 只在特定情况下自动跳转（避免与用户主动操作冲突）
    // 例如：首次启动且不在登录页面时
    if (!userInfo && (!currentPage.length || currentPage[0].route !== 'pages/login/index')) {
      // 检查是否是从退出登录流程过来的
      const isFromLogout = wx.getStorageSync('isFromLogout');
      if (!isFromLogout) {
        wx.reLaunch({
          url: '/pages/login/index'
        });
      } else {
        // 清除标记，允许用户手动操作
        wx.removeStorageSync('isFromLogout');
      }
    }
  }
});
