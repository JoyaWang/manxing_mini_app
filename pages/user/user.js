// pages/user/user.js - 最终版
const app = getApp();

Page({
  data: {
    userInfo: null,
    menuItems: [],
    orderStats: {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0
    },
    hasUserInfo: false,
    avatarUrl: '/images/default-avatar.png',
    nickName: '用户',
    isAdmin: false
  },

  onLoad() {
    this.loadUserData();
    this.loadOrderStats();
  },

  onShow() {
    // 页面显示时重新加载用户数据，确保状态最新
    this.loadUserData();
  },

  loadUserData() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    const menuItems = [
      {icon: 'order', name: '我的订单', path: '/pages/order/list'},
      {icon: 'address', name: '收货地址', path: '/pages/user/address'}
    ];

    // 管理员添加后台入口
    if (userInfo?.isAdmin) {
      menuItems.push({
        icon: 'crown',
        name: '切换到管理界面',
        action: 'switchToAdmin'
      });
    }

    this.setData({
      userInfo: userInfo,
      menuItems: menuItems,
      hasUserInfo: !!userInfo,
      avatarUrl: userInfo?.avatarUrl || '/images/default-avatar.png',
      nickName: userInfo?.nickName || '用户',
      isAdmin: userInfo?.isAdmin || false
    });
  },

  loadOrderStats() {
    // 模拟订单统计数据
    this.setData({
      orderStats: {
        pending: 2,
        paid: 1,
        shipped: 3,
        completed: 5
      }
    });
  },

  // 导航到登录页面
  onNavigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  // 导航到订单页面
  onNavigateToOrders(e) {
    const tab = e.currentTarget.dataset.tab || 'all';
    wx.navigateTo({
      url: `/pages/order/list?tab=${tab}`
    });
  },

  // 获取订单状态文本
  getOrderStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'paid': '待发货',
      'shipped': '已发货',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  },

  // 处理菜单项点击
  handleMenuItemTap(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.menuItems[index];

    if (item.path) {
      wx.navigateTo({ url: item.path });
    } else if (item.action === 'switchToAdmin') {
      this.switchToAdmin();
    }
  },

  // 切换到管理界面
  switchToAdmin() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '无管理员权限',
        icon: 'none'
      });
      return;
    }

    wx.reLaunch({
      url: '/pages/admin/index'
    });
  },

  // 联系客服
  onContactCustomerService() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  },

  // 关于我们
  onAboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '欢迎使用我们的商城小程序！',
      showCancel: false
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          const app = getApp();
          app.globalData.userInfo = null;

          // 设置退出登录标记
          wx.setStorageSync('isFromLogout', true);

          // 重新加载页面数据
          this.loadUserData();

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});
