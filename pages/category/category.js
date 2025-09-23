// pages/category/category.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    categories: [],
    selectedCategory: null,
    subCategories: [],
    products: [],
    loading: true,
    hasMore: true,
    page: 1,
    limit: 20
  },

  onLoad(options) {
    this.loadCategories();
    
    // 如果有初始分类ID
    if (options.categoryId) {
      this.setData({
        selectedCategory: {
          id: options.categoryId,
          name: options.categoryName
        }
      });
      this.loadProducts(options.categoryId);
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts();
    }
  },

  async loadCategories() {
    try {
      const categories = await api.getCategories();
      this.setData({ categories });
    } catch (error) {
      console.error('加载分类失败:', error);
      util.showError('加载分类失败');
    }
  },

  async loadProducts(categoryId, page = 1) {
    this.setData({ loading: true });
    
    try {
      const params = {
        categoryId,
        page,
        limit: this.data.limit
      };
      
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
    if (!this.data.selectedCategory) return;
    
    const nextPage = this.data.page + 1;
    await this.loadProducts(this.data.selectedCategory.id, nextPage);
  },

  // 选择分类
  onSelectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category,
      products: [],
      page: 1,
      hasMore: true
    });
    
    this.loadProducts(category.id);
  },

  // 选择商品
  onSelectProduct(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  },

  // 搜索商品
  onSearch() {
    wx.navigateTo({
      url: '/pages/product/list'
    });
  }
});