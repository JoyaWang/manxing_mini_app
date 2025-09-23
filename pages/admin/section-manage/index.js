// pages/admin/section-manage/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    loading: false,
    sections: {
      banners: { name: '轮播图', enabled: true, type: 'banner' },
      categories: { name: '分类导航', enabled: true, type: 'category' },
      featuredProducts: { name: '推荐商品', enabled: true, type: 'product', limit: 8 },
      hotProducts: { name: '热销商品', enabled: true, type: 'product', limit: 8 },
      newProducts: { name: '新品上市', enabled: true, type: 'product', limit: 8 },
      recommendedProducts: { name: '推荐专区', enabled: true, type: 'product', limit: 6 },
      flashSale: { name: '限时秒杀', enabled: false, type: 'special' },
      brandZone: { name: '品牌专区', enabled: false, type: 'special' }
    },
    productDisplayConfig: {},
    selectedSection: null,
    sectionProducts: {}
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadSectionConfig();
    this.loadProductDisplayConfig();
  },

  // 检查管理员权限
  checkAdminAccess() {
    const userInfo = app.globalData.userInfo;
    const isAdmin = userInfo && userInfo.isAdmin === true;

    if (!isAdmin) {
      util.showError('无权限访问');
      wx.navigateBack();
      return false;
    }
    return true;
  },

  // 加载板块配置
  async loadSectionConfig() {
    this.setData({ loading: true });

    try {
      const config = await api.getHomeSectionsConfig();

      // 将布尔值转换为对象格式
      const formattedConfig = {};
      const defaultConfig = {
        banners: { name: '轮播图', enabled: true, type: 'banner' },
        categories: { name: '分类导航', enabled: true, type: 'category' },
        featuredProducts: { name: '推荐商品', enabled: true, type: 'product', limit: 8 },
        hotProducts: { name: '热销商品', enabled: true, type: 'product', limit: 8 },
        newProducts: { name: '新品上市', enabled: true, type: 'product', limit: 8 },
        recommendedProducts: { name: '推荐专区', enabled: true, type: 'product', limit: 6 },
        flashSale: { name: '限时秒杀', enabled: false, type: 'special' },
        brandZone: { name: '品牌专区', enabled: false, type: 'special' }
      };

      for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'boolean') {
          formattedConfig[key] = { ...defaultConfig[key], enabled: value };
        } else {
          formattedConfig[key] = value;
        }
      }

      this.setData({ sections: formattedConfig });
    } catch (error) {
      console.error('加载首页配置失败:', error);
      util.showError('加载配置失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载商品展示配置
  async loadProductDisplayConfig() {
    try {
      const config = await api.getProductDisplayConfig();
      this.setData({ productDisplayConfig: config });
    } catch (error) {
      console.error('加载商品展示配置失败:', error);
    }
  },

  // 切换板块状态
  async onToggleSection(e) {
    const section = e.currentTarget.dataset.section;
    const newSections = { ...this.data.sections };
    newSections[section].enabled = !newSections[section].enabled;

    this.setData({ sections: newSections });
    await this.saveSectionConfig();
  },

  // 保存配置
  async saveSectionConfig() {
    try {
      await api.updateHomeSectionsConfig(this.data.sections);
      util.showSuccess('配置已保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      util.showError('保存配置失败');
    }
  },

  // 选择板块进行详细配置
  onSelectSection(e) {
    const section = e.currentTarget.dataset.section;
    this.setData({ selectedSection: section });

    // 如果是商品板块，加载相关商品
    if (this.data.sections[section].type === 'product') {
      this.loadSectionProducts(section);
    }
  },

  // 加载板块商品
  async loadSectionProducts(section) {
    try {
      const products = await api.getProducts({
        limit: 50,
        status: 'published'
      });

      this.setData({
        [`sectionProducts.${section}`]: products
      });
    } catch (error) {
      console.error('加载商品失败:', error);
    }
  },

  // 更新板块配置
  async updateSectionConfig(section, updates) {
    const newSections = { ...this.data.sections };
    newSections[section] = { ...newSections[section], ...updates };

    this.setData({ sections: newSections });
    await this.saveSectionConfig();
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 关闭详情面板
  onCloseDetail() {
    this.setData({ selectedSection: null });
  }
});
