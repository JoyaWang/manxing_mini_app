// pages/admin/section-manage.js
const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    // 首页板块配置
    homeSections: {
      banners: true,
      categories: true,
      featuredProducts: true,
      hotProducts: true,
      newProducts: true,
      ads: true
    },
    // 是否有可见板块
    hasVisibleSections: true
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadHomeSectionsConfig();
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
    return true;
  },

  // 加载首页板块配置
  loadHomeSectionsConfig() {
    const config = wx.getStorageSync('homeSectionsConfig') || this.data.homeSections;
    this.setData({ 
      homeSections: config,
      hasVisibleSections: this.checkHasVisibleSections(config)
    });
  },

  // 检查是否有可见板块
  checkHasVisibleSections(config) {
    return Object.values(config).some(value => value === true);
  },

  // 切换板块显示状态
  onToggleSection(e) {
    const section = e.currentTarget.dataset.section;
    const value = e.detail.value;
    
    const newConfig = { ...this.data.homeSections, [section]: value };
    const hasVisibleSections = this.checkHasVisibleSections(newConfig);
    
    this.setData({ 
      homeSections: newConfig,
      hasVisibleSections
    });
  },

  // 保存配置
  onSaveConfig() {
    wx.setStorageSync('homeSectionsConfig', this.data.homeSections);
    util.showSuccess('配置已保存');
    
    // 通知首页刷新
    this.notifyHomePageRefresh();
  },

  // 恢复默认配置
  onResetToDefault() {
    const defaultConfig = {
      banners: true,
      categories: true,
      featuredProducts: true,
      hotProducts: true,
      newProducts: true,
      ads: true
    };
    
    this.setData({ 
      homeSections: defaultConfig,
      hasVisibleSections: true
    });
    
    util.showToast('已恢复默认配置', 'success');
  },

  // 通知首页刷新
  notifyHomePageRefresh() {
    const pages = getCurrentPages();
    const homePage = pages.find(page => page.route === 'pages/index/index');
    
    if (homePage) {
      homePage.onLoad && homePage.onLoad();
      util.showToast('首页已刷新', 'success');
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});
