// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    banners: [],
    categories: [],
    featuredProducts: [],
    newProducts: [],
    hotProducts: [],
    loading: true,
    scrollTop: 0,
    // 首页板块配置
    homeSections: {
      banners: true,
      categories: true,
      featured: true,
      hot: true,
      new: true,
      ads: true
    }
  },

  onLoad() {
    this.loadHomeSectionsConfig();
    this.loadHomeData();
  },

  onShow() {
    // 页面显示时检查后端类型变化
    this.checkBackendType();
  },

  onPullDownRefresh() {
    this.loadHomeData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onPageScroll(e) {
    this.setData({ scrollTop: e.scrollTop });
  },

  // 加载首页板块配置
  async loadHomeSectionsConfig() {
    try {
      const config = await api.getHomeSectionsConfig();
      let configObj = {};

      // 处理不同格式的配置数据
      if (Array.isArray(config)) {
        // 数组格式：[{id: '0', enabled: true}, ...]
        // 映射ID到板块名称
        const sectionMap = {
          "0": "banners",
          "1": "categories",
          "2": "featured",
          "3": "new",
          "4": "hot",
          "5": "ads"
        };
        config.forEach(section => {
          const sectionKey = sectionMap[section.id] || section.id;
          configObj[sectionKey] = section.enabled;
        });
      } else if (typeof config === 'object') {
        // 对象格式：{featured: true, hot: true, ...}
        configObj = config;
      }

      this.setData({ homeSections: configObj });
    } catch (error) {
      console.error('加载首页配置失败:', error);
      // 失败时使用默认配置
      this.setData({ homeSections: this.data.homeSections });
    }
  },

  async loadHomeData() {
    this.setData({ loading: true });

    try {
      // 先加载首页配置
      await this.loadHomeSectionsConfig();
      // 根据配置决定加载哪些数据
      const loadTasks = [];
      
      if (this.data.homeSections.banners) {
        loadTasks.push(this.getBanners());
      }
      
      if (this.data.homeSections.categories) {
        loadTasks.push(this.getCategories());
      }
      
      if (this.data.homeSections.featured) {
        loadTasks.push(this.getFeaturedProducts());
      }

      if (this.data.homeSections.new) {
        loadTasks.push(this.getNewProducts());
      }

      if (this.data.homeSections.hot) {
        loadTasks.push(this.getHotProducts());
      }

      const results = await Promise.all(loadTasks);
      
      // 根据配置设置数据
      const data = {};
      let resultIndex = 0;
      
      if (this.data.homeSections.banners) {
        data.banners = results[resultIndex++];
      }
      
      if (this.data.homeSections.categories) {
        data.categories = results[resultIndex++];
      }
      
      if (this.data.homeSections.featured) {
        data.featuredProducts = results[resultIndex++];
      }

      if (this.data.homeSections.new) {
        data.newProducts = results[resultIndex++];
      }

      if (this.data.homeSections.hot) {
        data.hotProducts = results[resultIndex++];
      }

      this.setData({
        ...data,
        loading: false
      });
    } catch (error) {
      console.error('加载首页数据失败:', error);
      util.showError('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  async getBanners() {
    // 模拟数据，实际应从API获取
    return [
      {
        id: 1,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY2QjM1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5re56YGN5Lu75YqhPC90ZXh0Pjwvc3ZnPg==',
        link: '/pages/product/list?type=hot'
      },
      {
        id: 2,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEVDREM0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5paw5p2x5LiK6ZSA5ZCOPC90ZXh0Pjwvc3ZnPg==',
        link: '/pages/product/list?type=new'
      },
      {
        id: 3,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDVCN0QxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+56e75Yqo5L2Q5LqkPC90ZXh0Pjwvc3ZnPg==',
        link: '/pages/product/list?type=discount'
      }
    ];
  },

  async getCategories() {
    try {
      const categories = await api.getCategories();
      return categories.slice(0, 8); // 只显示前8个分类
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  },

  async getFeaturedProducts() {
    try {
          const response = await api.getProducts({
            is_featured: true,
            limit: 6
          });
          return response.products || [];
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      return [];
    }
  },

  async getNewProducts() {
    try {
      const response = await api.getProducts({
        isNew: true,
        limit: 6
      });
      return response.products || [];
    } catch (error) {
      console.error('获取新品失败:', error);
      return [];
    }
  },

  async getHotProducts() {
    try {
      const response = await api.getProducts({
        sort: 'sales',
        order: 'desc',
        limit: 6
      });
      return response.products || [];
    } catch (error) {
      console.error('获取热卖商品失败:', error);
      return [];
    }
  },

  // 事件处理
  onBannerTap(e) {
    const { link } = e.currentTarget.dataset;
    if (link) {
      wx.navigateTo({ url: link });
    }
  },

  onCategoryTap(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/list?categoryId=${id}&categoryName=${name}`
    });
  },

  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail?id=${id}`
    });
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/product/list' });
  },

  onViewAll(type) {
    let url = '/pages/product/list';
    if (type) {
      url += `?type=${type}`;
    }
    wx.navigateTo({ url });
  },

  // 检查后端类型变化
  checkBackendType() {
    const currentType = api.getBackendType();
    if (currentType !== this.data.backendType) {
      this.setData({ backendType: currentType });
      this.loadHomeData(); // 重新加载数据
    }
  },

  // 切换到顶部
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  }
});
