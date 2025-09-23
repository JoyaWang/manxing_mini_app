// pages/order/confirm.js
const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    orderItems: [],
    selectedAddress: null,
    addresses: [],
    paymentMethods: [
      { id: 'wechat', name: '微信支付', icon: '💳' },
      { id: 'alipay', name: '支付宝', icon: '💳' }
    ],
    selectedPayment: 'wechat',
    remark: '',
    totalPrice: 0,
    loading: true
  },

  onLoad() {
    this.loadOrderData();
  },

  async loadOrderData() {
    this.setData({ loading: true });
    
    try {
      const [cart, addresses] = await Promise.all([
        api.getCart(),
        api.getAddresses()
      ]);
      
      const orderItems = cart.items.filter(item => item.selected);
      const totalPrice = util.calculateCartTotal(orderItems);
      
      this.setData({
        orderItems,
        addresses,
        selectedAddress: addresses.find(addr => addr.isDefault) || (addresses.length > 0 ? addresses[0] : null),
        totalPrice,
        loading: false
      });
    } catch (error) {
      console.error('加载订单数据失败:', error);
      util.showError('加载订单数据失败');
      this.setData({ loading: false });
    }
  },

  // 选择地址
  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/user/address?selectMode=true'
    });
  },

  // 选择支付方式
  onSelectPayment(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedPayment: method });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 提交订单
  async onSubmitOrder() {
    if (!this.data.selectedAddress) {
      util.showError('请选择收货地址');
      return;
    }

    if (this.data.orderItems.length === 0) {
      util.showError('没有选择商品');
      return;
    }

    util.showLoading('创建订单中...');

    try {
      const orderData = {
        items: this.data.orderItems.map(item => ({
          productId: item.productId,
          skuId: item.skuId,
          quantity: item.quantity,
          price: item.price
        })),
        addressId: this.data.selectedAddress.id,
        paymentMethod: this.data.selectedPayment,
        remark: this.data.remark,
        totalAmount: this.data.totalPrice
      };

      const order = await api.createOrder(orderData);
      
      util.showSuccess('订单创建成功');
      
      // 跳转到订单详情
      wx.redirectTo({
        url: `/pages/order/detail?id=${order.id}`
      });
    } catch (error) {
      console.error('创建订单失败:', error);
      util.showError('创建订单失败');
    } finally {
      util.hideLoading();
    }
  },

  // 从地址选择页面返回
  onAddressSelected(address) {
    this.setData({ selectedAddress: address });
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});