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

  // 加载首页板块配置 - 只调用一次
  async loadHomeSectionsConfig() {
    try {
      const response = await api.getHomeSectionsConfig();
      if (!response || !response.success) {
        throw new Error('Invalid config response');
      }

      const sections = response.config?.sections || [];
      const configObj = {};
      const sectionLimits = {};

      sections.forEach(section => {
        let key;
        switch (section.type) {
          case 'banner':
            key = 'banners';
            break;
          case 'categories':
            key = 'categories';
            break;
          case 'products':
            key = 'featured';
            sectionLimits.featured = section.limit || 6;
            break;
          case 'new':
            key = 'new';
            break;
          case 'hot':
            key = 'hot';
            break;
          default:
            key = section.type;
        }
        configObj[key] = true;
      });

      this.setData({
        homeSections: configObj,
        sectionLimits: sectionLimits
      });
      console.log('Home sections config loaded:', configObj, sectionLimits);
    } catch (error) {
      console.error('加载首页配置失败:', error);
      // 默认配置
      this.setData({
        homeSections: { banners: true, categories: true, featured: true, new: true, hot: true },
        sectionLimits: { featured: 6 }
      });
    }
  },

  async loadHomeData() {
    this.setData({ loading: true });

    try {
      // 使用已加载的配置，不重新调用API
      const loadTasks = [];

      if (this.data.homeSections.banners) {
        loadTasks.push(this.getBanners());
      }

      if (this.data.homeSections.categories) {
        loadTasks.push(this.getCategories());
      }

      if (this.data.homeSections.featured) {
        const limit = this.data.sectionLimits?.featured || 6;
        loadTasks.push(this.getFeaturedProducts(limit));
      }

      if (this.data.homeSections.new) {
        loadTasks.push(this.getNewProducts());
      }

      if (this.data.homeSections.hot) {
        loadTasks.push(this.getHotProducts());
      }

      if (loadTasks.length === 0) {
        this.setData({ loading: false });
        return;
      }

      const results = await Promise.all(loadTasks);

      // 根据配置设置数据
      const data = {};
      let resultIndex = 0;

      if (this.data.homeSections.banners) {
        data.banners = results[resultIndex++] || [];
      }

      if (this.data.homeSections.categories) {
        data.categories = results[resultIndex++] || [];
      }

      if (this.data.homeSections.featured) {
        data.featuredProducts = results[resultIndex++] || [];
      }

      if (this.data.homeSections.new) {
        data.newProducts = results[resultIndex++] || [];
      }

      if (this.data.homeSections.hot) {
        data.hotProducts = results[resultIndex++] || [];
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
      const response = await api.getCategories();
      console.log('Categories loaded:', response.length || 0);
      return (response || []).slice(0, 8);
    } catch (error) {
      console.error('获取分类失败:', error);
      // Fallback mock categories
      return [
        { id: 1, name: '手机数码', icon: '📱' },
        { id: 2, name: '服装鞋帽', icon: '👕' },
        { id: 3, name: '家用电器', icon: '🧴' },
        { id: 4, name: '电脑办公', icon: '💻' },
        { id: 5, name: '家居生活', icon: '🏠' },
        { id: 6, name: '母婴用品', icon: '👶' },
        { id: 7, name: '图书音像', icon: '📚' },
        { id: 8, name: '美食饮品', icon: '🍔' }
      ];
    }
  },

  async getFeaturedProducts(limit = 6) {
    try {
      const response = await api.getProducts({
        is_featured: true,
        limit: limit
      });
      console.log('Featured products loaded:', response.products?.length || 0);
      return response.products || [];
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      return [];
    }
  },

  async getNewProducts(limit = 6) {
    try {
      const response = await api.getProducts({
        is_new: true,
        limit: limit,
        sort: 'created_at',
        order: 'desc'
      });
      return response.products || [];
    } catch (error) {
      console.error('获取新品失败:', error);
      return [];
    }
  },

  async getHotProducts(limit = 6) {
    try {
      const response = await api.getProducts({
        sort: 'sales_count',
        order: 'desc',
        limit: limit
      });
      return response.products || [];
    } catch (error) {
      console.error('获取热卖商品失败:', error);
      return [];
    }
  },

  async getBanners() {
    try {
      const response = await api.getBanners();
      console.log('Banners loaded:', response.length || 0);
      return response || [];
    } catch (error) {
      console.error('获取轮播图失败:', error);
      // Fallback to mock data
      return [
        {
          id: 1,
          image: 'https://via.placeholder.com/750x300/ff6b35/ffffff?text=轮播图1',
          link: '/pages/product/list?type=hot'
        },
        {
          id: 2,
          image: 'https://via.placeholder.com/750x300/4ecdc4/ffffff?text=轮播图2',
          link: '/pages/product/list?type=new'
        },
        {
          id: 3,
          image: 'https://via.placeholder.com/750x300/45b7d1/ffffff?text=轮播图3',
          link: '/pages/product/list?type=discount'
        }
      ];
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
