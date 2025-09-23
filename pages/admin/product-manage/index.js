// pages/admin/product-manage/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    products: [],
    loading: false,
    searchKeyword: '',
    currentPage: 1,
    totalPages: 1,
    selectedCategory: '',
    statusFilter: 'all',
    // 新增模板所需属性
    hasUserInfo: false,
    avatarUrl: '',
    nickName: '',
    userInfo: null
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadUserData();
    this.loadProducts();
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    this.setData({
      hasUserInfo: !!userInfo,
      avatarUrl: userInfo?.avatarUrl || '/assets/images/default-avatar.png',
      nickName: userInfo?.nickName || '管理员',
      userInfo
    });
  },

  onShow() {
    this.loadProducts();
  },

  // 检查管理员权限
  checkAdminAccess() {
    const auth = require('../../../utils/auth');
    // 强制重新检查权限
    auth.loadFromStorage();
    const isAdmin = auth.checkAdminStatus(auth.user);
    
    if (!isAdmin) {
      util.showError('无权限访问');
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' });
      }, 1500);
      return false;
    }
    
    // 确保全局状态同步
    getApp().globalData.isAdmin = true;
    return true;
  },

  // 加载商品列表
  async loadProducts() {
    this.setData({ loading: true });
    
    try {
      const params = {
        page: this.data.currentPage,
        limit: 20,
        keyword: this.data.searchKeyword,
        category: this.data.selectedCategory,
        status: this.data.statusFilter === 'all' ? '' : this.data.statusFilter
      };

      const response = await api.getProducts(params);
      this.setData({
        products: response?.products || [],
        totalPages: response?.totalPages || 1,
        loading: false
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      util.showError('加载商品失败');
      this.setData({ loading: false });
    }
  },

  // 搜索商品
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearchConfirm() {
    this.setData({ currentPage: 1 });
    this.loadProducts();
  },

  // 切换分类筛选
  onCategoryChange(e) {
    this.setData({ 
      selectedCategory: e.detail.value,
      currentPage: 1 
    });
    this.loadProducts();
  },

  // 切换状态筛选
  onStatusChange(e) {
    this.setData({ 
      statusFilter: e.detail.value,
      currentPage: 1 
    });
    this.loadProducts();
  },

  // 编辑商品
  onEditProduct(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/product-edit/index?id=${productId}`
    });
  },

  // 上下架商品
  async onToggleProductStatus(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === productId);
    const newStatus = product.status === 'published' ? 'draft' : 'published';

    try {
      await api.updateProductStatus(productId, newStatus);
      util.showSuccess(`商品已${newStatus === 'published' ? '上架' : '下架'}`);
      this.loadProducts();
    } catch (error) {
      console.error('更新商品状态失败:', error);
      util.showError('操作失败');
    }
  },

  // 删除商品
  async onDeleteProduct(e) {
    const productId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteProduct(productId);
            util.showSuccess('商品删除成功');
            this.loadProducts();
          } catch (error) {
            console.error('删除商品失败:', error);
            util.showError('删除失败');
          }
        }
      }
    });
  },

  // 添加新商品
  onAddNewProduct() {
    wx.navigateTo({
      url: '/pages/admin/product-edit/index'
    });
  },

  // 翻页
  onPageChange(e) {
    const page = e.currentTarget.dataset.page;
    if (page >= 1 && page <= this.data.totalPages && page !== this.data.currentPage) {
      this.setData({ currentPage: page });
      this.loadProducts();
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});