// pages/order/list.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    orders: [],
    loading: true,
    hasMore: true,
    page: 1,
    limit: 10,
    currentTab: 'all', // all, pending, paid, completed, cancelled
    tabItems: [
      { key: 'all', name: '全部' },
      { key: 'pending', name: '待付款' },
      { key: 'paid', name: '待发货' },
      { key: 'shipped', name: '待收货' },
      { key: 'completed', name: '已完成' },
      { key: 'cancelled', name: '已取消' }
    ]
  },

  onLoad(options) {
    if (options.tab) {
      this.setData({ currentTab: options.tab });
    }
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.loadOrders().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrders();
    }
  },

  async loadOrders(page = 1) {
    this.setData({ loading: true });
    
    try {
      const params = {
        page,
        limit: this.data.limit
      };
      
      // 根据当前标签添加筛选条件
      if (this.data.currentTab !== 'all') {
        params.status = this.data.currentTab;
      }
      
      const orders = await api.getOrders(params);
      
      this.setData({
        orders: page === 1 ? orders : [...this.data.orders, ...orders],
        hasMore: orders.length === this.data.limit,
        page,
        loading: false
      });
    } catch (error) {
      console.error('加载订单失败:', error);
      util.showError('加载订单失败');
      this.setData({ loading: false });
    }
  },

  async loadMoreOrders() {
    const nextPage = this.data.page + 1;
    await this.loadOrders(nextPage);
  },

  // 切换标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.currentTab) {
      this.setData({
        currentTab: tab,
        orders: [],
        page: 1,
        hasMore: true
      });
      this.loadOrders(1);
    }
  },

  // 查看订单详情
  onViewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    });
  },

  // 取消订单
  async onCancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    
    const confirm = await util.showModal('确认取消', '确定要取消这个订单吗？');
    if (!confirm) return;
    
    util.showLoading('取消中...');
    
    try {
      // 这里需要实现取消订单的API
      // await api.cancelOrder(orderId);
      
      util.showSuccess('取消成功');
      this.loadOrders(1); // 重新加载第一页
    } catch (error) {
      console.error('取消订单失败:', error);
      util.showError('取消失败');
    } finally {
      util.hideLoading();
    }
  },

  // 确认收货
  async onConfirmReceipt(e) {
    const orderId = e.currentTarget.dataset.id;
    
    const confirm = await util.showModal('确认收货', '请确认您已收到商品');
    if (!confirm) return;
    
    util.showLoading('确认中...');
    
    try {
      // 这里需要实现确认收货的API
      // await api.confirmReceipt(orderId);
      
      util.showSuccess('确认成功');
      this.loadOrders(1); // 重新加载第一页
    } catch (error) {
      console.error('确认收货失败:', error);
      util.showError('确认失败');
    } finally {
      util.hideLoading();
    }
  },

  // 去支付
  onPayOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    // 这里实现支付逻辑
    util.showModal('支付功能', '支付功能需要接入微信支付API');
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});