// pages/admin/login/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    errorMessage: ''
  },

  onLoad() {
    // Check if already logged in as admin
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.isAdmin) {
      wx.switchTab({ url: '/pages/admin/index' });
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async onLogin() {
    const { username, password } = this.data;

    if (!username.trim() || !password.trim()) {
      util.showError('用户名和密码不能为空');
      return;
    }

    this.setData({ loading: true, errorMessage: '' });

    try {
      console.log('Attempting login with:', { username, password: '***' });
      const result = await api.adminLogin(username, password);
      console.log('Full login result object:', JSON.stringify(result, null, 2));
      console.log('result.success type:', typeof result.success, 'value:', result.success);

      if (result && result.success) {  // Loose check for true/1/'true' etc.
        console.log('Entering success branch');
        // Store admin info
        const adminInfo = {
          ...result.admin,
          isAdmin: true,
          token: result.token
        };

        app.globalData.userInfo = adminInfo;
        wx.setStorageSync('adminInfo', adminInfo);
        wx.setStorageSync('authToken', result.token);

        console.log('Stored adminInfo:', adminInfo);
        util.showSuccess('登录成功');

        // Navigate to admin dashboard
        setTimeout(() => {
          console.log('Navigating to admin index');
          wx.navigateTo({ url: '/pages/admin/index' });
        }, 1500);
      } else {
        console.log('Entering failure branch, result:', result);
        const errorMsg = result?.error || '登录失败 - 未知错误';
        this.setData({ errorMessage: errorMsg });
        util.showError(errorMsg);
      }
    } catch (error) {
      console.error('Login catch error:', error);
      const errorMsg = '网络错误，请重试';
      this.setData({ errorMessage: errorMsg });
      util.showError(errorMsg);
    } finally {
      this.setData({ loading: false });
    }
  },

  onBack() {
    wx.navigateBack();
  }
});

