// pages/login/index.js - 双角色登录系统
const auth = require('../../utils/auth');

Page({
  data: {
    username: '',
    password: '',
    loginType: 'consumer', // 'consumer' 或 'admin'
    isAdminAccount: false
  },

  onLoad: function (options) {
    // 页面加载时执行
  },

  // 输入框事件处理函数
  inputUsername: function (e) {
    const username = e.detail.value;
    this.setData({
      username: username
    });
  },

  inputPassword: function (e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 切换登录类型
  switchLoginType: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loginType: type
    });
  },

  // 登录处理
  handleLogin: function () {
    const { username, password, loginType } = this.data;

    // 自动检测管理员账户
    const adminAccounts = ['joya', 'admin', 'superadmin'];
    const isAdminAccount = adminAccounts.includes(username);

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 调用真实的后端API进行登录
    const api = require('../../utils/api');

    // 管理员登录使用 /api/auth/admin-login
    if (loginType === 'admin' || isAdminAccount) {
      api.adminLogin(username, password)
        .then(response => {
          wx.hideLoading();

          if (response.success) {
            // 存储认证令牌
            wx.setStorageSync('authToken', response.token);

            // 设置用户信息
            const userInfo = {
              id: response.user.id,
              username: response.user.nickName,
              isAdmin: true
            };

            auth.setUser(userInfo);

            wx.showToast({
              title: '管理员登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '/pages/admin/index'
                  });
                }, 1500);
              }
            });
          } else {
            wx.showToast({
              title: response.error || '登录失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          wx.hideLoading();
          wx.showToast({
            title: error.error || '登录失败',
            icon: 'none'
          });
        });
    } else {
      // 消费者登录 - 目前使用模拟登录，后续可以接入微信登录
      const userInfo = {
        id: Date.now().toString(),
        username: username,
        isAdmin: false
      };

      auth.setUser(userInfo);
      wx.hideLoading();

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      });
    }
  },

  // 微信一键登录（只能消费者登录）
  wxLogin: function () {
    wx.showToast({
      title: '微信登录功能开发中',
      icon: 'none'
    });

    // 模拟微信登录成功
    setTimeout(() => {
      const userInfo = {
        id: 'wx_' + Date.now(),
        username: '微信用户',
        isAdmin: false
      };
      auth.setUser(userInfo);
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  }
});
