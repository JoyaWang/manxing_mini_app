// pages/product/list.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    products: [],
    loading: true,
    hasMore: true,
    page: 1,
    limit: 20,
    filters: {
      keyword: '',
      categoryId: '',
      sort: 'createdAt',
      order: 'desc',
      minPrice: '',
      maxPrice: ''
    },
    showFilter: false,
    sortOptions: [
      { label: '最新', value: 'createdAt', order: 'desc' },
      { label: '价格从低到高', value: 'price', order: 'asc' },
      { label: '价格从高到低', value: 'price', order: 'desc' },
      { label: '销量从高到低', value: 'sales', order: 'desc' }
    ],
    selectedSort: { label: '最新', value: 'createdAt', order: 'desc' }
  },

  onLoad(options) {
    // 从参数中获取筛选条件
    if (options.categoryId) {
      this.setData({
        'filters.categoryId': options.categoryId
      });
    }
    if (options.type) {
      this.applyTypeFilter(options.type);
    }
    
    this.loadProducts();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts();
    }
  },

  async loadProducts(page = 1) {
    this.setData({ loading: true });
    
    try {
      const params = {
        ...this.data.filters,
        page,
        limit: this.data.limit
      };
      
      // 清理空参数
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const products = await api.getProducts(params);
      
      this.setData({
        products: page === 1 ? products : [...this.data.products, ...products],
        hasMore: products.length === this.data.limit,
        page,
        loading: false
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      util.showError('加载商品失败');
      this.setData({ loading: false });
    }
  },

  async loadMoreProducts() {
    const nextPage = this.data.page + 1;
    await this.loadProducts(nextPage);
  },

  // 应用类型筛选
  applyTypeFilter(type) {
    const filters = { ...this.data.filters };
    
    switch (type) {
      case 'new':
        filters.sort = 'createdAt';
        filters.order = 'desc';
        this.setData({
          selectedSort: { label: '最新', value: 'createdAt', order: 'desc' }
        });
        break;
      case 'hot':
        filters.sort = 'sales';
        filters.order = 'desc';
        this.setData({
          selectedSort: { label: '销量从高到低', value: 'sales', order: 'desc' }
        });
        break;
      case 'discount':
        filters.onSale = true;
        break;
      default:
        break;
    }
    
    this.setData({ filters });
  },

  // 搜索商品
  onSearchInput(e) {
    this.setData({
      'filters.keyword': e.detail.value
    });
  },

  onSearchConfirm() {
    this.setData({ page: 1 });
    this.loadProducts(1);
  },

  // 选择排序
  onSelectSort(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      selectedSort: sort,
      'filters.sort': sort.value,
      'filters.order': sort.order,
      page: 1
    });
    this.loadProducts(1);
  },

  // 切换筛选面板
  onToggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 价格筛选
  onPriceInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`filters.${field}`]: e.detail.value
    });
  },

  // 应用筛选
  onApplyFilter() {
    this.setData({
      showFilter: false,
      page: 1
    });
    this.loadProducts(1);
  },

  // 重置筛选
  onResetFilter() {
    this.setData({
      filters: {
        keyword: this.data.filters.keyword, // 保留关键词
        categoryId: '',
        sort: 'createdAt',
        order: 'desc',
        minPrice: '',
        maxPrice: ''
      },
      selectedSort: { label: '最新', value: 'createdAt', order: 'desc' },
      page: 1
    });
    this.loadProducts(1);
  },

  // 选择商品
  onSelectProduct(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});