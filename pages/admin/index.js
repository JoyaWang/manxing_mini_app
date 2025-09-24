// pages/admin/index.js
const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    backendType: 'tencent', // 当前后端类型
    stats: {
      products: 0,
      orders: 0,
      users: 1,
      revenue: 0
    },
    // 首页板块配置
    homeSections: {
      banners: true,
      categories: true,
      featuredProducts: true,
      hotProducts: true,
      newProducts: true,
      ads: true
    }
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadStats();
    this.loadHomeSectionsConfig();
    this.checkBackendType();
  },

  onShow() {
    this.checkAdminAccess();
    this.loadStats();
    this.checkBackendType();
  },

  // 检查管理员访问权限
  checkAdminAccess() {
    const userInfo = app.globalData.userInfo;
    const isAdmin = userInfo && userInfo.isAdmin === true;

    if (!isAdmin) {
      util.showError('无权限访问管理后台');
      wx.navigateBack();
      return false;
    }

    this.setData({ userInfo });
    return true;
  },

  // 检查后端类型
  checkBackendType() {
    const currentType = api.getBackendType();
    if (currentType !== this.data.backendType) {
      this.setData({ backendType: currentType });
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const productsResponse = await api.getProducts({ limit: 100 });
      let ordersResponse;
      try {
        ordersResponse = await api.getOrders({ limit: 100 });
      } catch (ordersError) {
        console.warn('获取订单数据失败，使用空数组:', ordersError);
        ordersResponse = { success: true, orders: [] };  // Fallback with success true
      }

      // 处理新的API响应格式（包含分页元数据）
      const products = productsResponse.products || productsResponse || [];
      let ordersData = ordersResponse.orders || ordersResponse.data || ordersResponse || [];  // Use let, enhanced fallback

      // Ensure ordersData is always an array
      if (!Array.isArray(ordersData)) {
        console.warn('Orders data is not an array, setting to empty array:', typeof ordersData, ordersData);
        ordersData = [];
      }

      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || order.total_amount || 0), 0);

      this.setData({
        'stats.products': products.length,
        'stats.orders': ordersData.length,
        'stats.revenue': totalRevenue.toFixed(2)
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // Set default stats on error
      this.setData({
        'stats.products': 0,
        'stats.orders': 0,
        'stats.revenue': '0.00'
      });
      util.showError('加载数据失败');
    }
  },

  // 加载首页板块配置
  async loadHomeSectionsConfig() {
    try {
      const config = await api.getHomeSectionsConfig();
      this.setData({ homeSections: config });
    } catch (error) {
      console.error('加载首页配置失败:', error);
      // 使用默认配置
      this.setData({ homeSections: this.data.homeSections });
    }
  },

  // 保存首页板块配置
  async saveHomeSectionsConfig() {
    try {
      await api.updateHomeSectionsConfig(this.data.homeSections);
      util.showSuccess('配置已保存');
    } catch (error) {
      console.error('保存首页配置失败:', error);
      util.showError('保存配置失败');
    }
  },

  // 切换首页板块显示状态
  async toggleHomeSection(section) {
    const newConfig = { ...this.data.homeSections, [section]: !this.data.homeSections[section] };
    this.setData({ homeSections: newConfig });
    await this.saveHomeSectionsConfig();
  },

  // 导航到首页板块管理
  onNavigateToSectionManage() {
    wx.navigateTo({
      url: '/pages/admin/section-manage/index'
    });
  },

  // 导航到商品管理
  onNavigateToProductManage() {
    wx.navigateTo({
      url: '/pages/admin/product-manage/index'
    });
  },

  // 导航到订单管理
  onNavigateToOrderManage() {
    wx.navigateTo({
      url: '/pages/admin/order-manage/index'
    });
  },

  // 导航到用户管理
  onNavigateToUserManage() {
    wx.navigateTo({
      url: '/pages/admin/user-manage/index'
    });
  },

  // 导航到数据统计
  onNavigateToStatistics() {
    util.showModal('提示', '数据统计功能正在开发中');
  },

  // 导航到系统设置
  onNavigateToSettings() {
    util.showModal('提示', '系统设置功能正在开发中');
  },

  // 添加新商品
  onAddNewProduct() {
    wx.navigateTo({
      url: '/pages/admin/product-edit/index'
    });
  },

  // 查看今日订单
  onViewTodayOrders() {
    wx.navigateTo({
      url: '/pages/order/list'
    });
  },

  // 库存检查
  onCheckInventory() {
    // 跳转到商品管理页面，显示库存信息
    wx.navigateTo({
      url: '/pages/admin/product-manage'
    });
  },

  // 返回用户中心
  onBackToUserCenter() {
    wx.navigateBack();
  },

  // 切换后端
  onSwitchBackend() {
    const newType = this.data.backendType === 'tencent' ? 'supabase' : 'tencent';
    app.switchBackendType(newType);
    this.setData({ backendType: newType });
    util.showSuccess(`已切换到${newType === 'tencent' ? '腾讯云' : 'Supabase'}`);
  },

  // 快速切换到消费者页面
  onSwitchToConsumer() {
    wx.switchTab({
      url: '/pages/index/index'
    });
    util.showSuccess('已切换到消费者页面');
  },

  // 刷新数据
  async onRefresh() {
    wx.showLoading({ title: '刷新中...' });
    await this.loadStats();
    wx.hideLoading();
    util.showSuccess('数据已刷新');
  }
});
