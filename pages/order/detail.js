// pages/order/detail.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    order: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.loadOrderDetail();
    }
  },

  async loadOrderDetail() {
    this.setData({ loading: true });
    
    try {
      const order = await api.getOrderDetail(this.orderId);
      this.setData({
        order,
        loading: false
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      util.showError('加载订单详情失败');
      this.setData({ loading: false });
    }
  },

  // 复制订单号
  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => {
        util.showSuccess('订单号已复制');
      }
    });
  },

  // 取消订单
  async onCancelOrder() {
    const confirm = await util.showModal('确认取消', '确定要取消这个订单吗？');
    if (!confirm) return;
    
    util.showLoading('取消中...');
    
    try {
      // 这里需要实现取消订单的API
      // await api.cancelOrder(this.orderId);
      
      util.showSuccess('取消成功');
      this.loadOrderDetail(); // 重新加载订单详情
    } catch (error) {
      console.error('取消订单失败:', error);
      util.showError('取消失败');
    } finally {
      util.hideLoading();
    }
  },

  // 确认收货
  async onConfirmReceipt() {
    const confirm = await util.showModal('确认收货', '请确认您已收到商品');
    if (!confirm) return;
    
    util.showLoading('确认中...');
    
    try {
      // 这里需要实现确认收货的API
      // await api.confirmReceipt(this.orderId);
      
      util.showSuccess('确认成功');
      this.loadOrderDetail(); // 重新加载订单详情
    } catch (error) {
      console.error('确认收货失败:', error);
      util.showError('确认失败');
    } finally {
      util.hideLoading();
    }
  },

  // 去支付
  onPayOrder() {
    // 这里实现支付逻辑
    util.showModal('支付功能', '支付功能需要接入微信支付API');
  },

  // 联系客服
  onContactCustomerService() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  },

  // 查看物流
  onViewLogistics() {
    if (this.data.order.status === 'shipped') {
      util.showModal('物流信息', '物流功能需要接入物流查询API');
    } else {
      util.showError('订单尚未发货');
    }
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});