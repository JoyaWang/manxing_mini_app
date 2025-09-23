// pages/admin/order-manage/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false,
    searchKeyword: '',
    currentPage: 1,
    totalPages: 1,
    statusFilter: 'all'
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
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

  // 加载订单列表
  async loadOrders() {
    this.setData({ loading: true });
    
    try {
      const params = {
        page: this.data.currentPage,
        limit: 20,
        keyword: this.data.searchKeyword,
        status: this.data.statusFilter === 'all' ? '' : this.data.statusFilter
      };

      const response = await api.getOrders(params);
      this.setData({
        orders: response.orders,
        totalPages: response.totalPages,
        loading: false
      });
    } catch (error) {
      console.error('加载订单失败:', error);
      util.showError('加载订单失败');
      this.setData({ loading: false });
    }
  },

  // 搜索订单
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearchConfirm() {
    this.setData({ currentPage: 1 });
    this.loadOrders();
  },

  // 切换状态筛选
  onStatusChange(e) {
    this.setData({ 
      statusFilter: e.detail.value,
      currentPage: 1 
    });
    this.loadOrders();
  },

  // 更新订单状态
  async onUpdateOrderStatus(e) {
    const orderId = e.currentTarget.dataset.id;
    const currentStatus = e.currentTarget.dataset.status;
    let newStatus = '';

    // 状态流转逻辑
    if (currentStatus === 'pending') {
      newStatus = 'processing';
    } else if (currentStatus === 'processing') {
      newStatus = 'shipped';
    } else if (currentStatus === 'shipped') {
      newStatus = 'completed';
    }

    if (newStatus) {
      try {
        await api.updateOrderStatus(orderId, newStatus);
        util.showSuccess('订单状态已更新');
        this.loadOrders();
      } catch (error) {
        console.error('更新订单状态失败:', error);
        util.showError('操作失败');
      }
    }
  },

  // 查看订单详情
  onViewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 翻页
  onPageChange(e) {
    const page = e.currentTarget.dataset.page;
    if (page >= 1 && page <= this.data.totalPages && page !== this.data.currentPage) {
      this.setData({ currentPage: page });
      this.loadOrders();
    }
  }
});
