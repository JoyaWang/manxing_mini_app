// pages/product/detail.js
const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    product: null,
    selectedSku: null,
    quantity: 1,
    showSkuPicker: false,
    showActionSheet: false,
    loading: true,
    isFavorite: false,
    cartCount: 0
  },

  onLoad(options) {
    if (options.id) {
      this.productId = options.id;
      this.loadProductDetail();
      this.checkFavoriteStatus();
    }
    this.getCartCount();
  },

  onShow() {
    this.getCartCount();
  },

  async loadProductDetail() {
    this.setData({ loading: true });
    
    try {
      const product = await api.getProductDetail(this.productId);
      this.setData({
        product,
        selectedSku: product.skus && product.skus.length > 0 ? product.skus[0] : null,
        loading: false
      });
    } catch (error) {
      console.error('加载商品详情失败:', error);
      util.showError('加载商品详情失败');
      this.setData({ loading: false });
    }
  },

  async checkFavoriteStatus() {
    try {
      // 这里需要实现收藏状态的检查
      // 暂时模拟数据
      this.setData({ isFavorite: false });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  async getCartCount() {
    try {
      const cart = await api.getCart();
      const count = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
      this.setData({ cartCount: count });
    } catch (error) {
      console.error('获取购物车数量失败:', error);
    }
  },

  // 选择SKU
  onSelectSku(e) {
    const sku = e.currentTarget.dataset.sku;
    this.setData({ selectedSku: sku });
  },

  // 数量变化
  onQuantityChange(e) {
    const quantity = parseInt(e.detail.value) || 1;
    this.setData({ quantity: Math.max(1, quantity) });
  },

  // 增加数量
  onIncrease() {
    this.setData({ quantity: this.data.quantity + 1 });
  },

  // 减少数量
  onDecrease() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },

  // 打开SKU选择器
  onOpenSkuPicker() {
    this.setData({ showSkuPicker: true });
  },

  // 关闭SKU选择器
  onCloseSkuPicker() {
    this.setData({ showSkuPicker: false });
  },

  // 添加到购物车
  async onAddToCart() {
    if (!this.data.selectedSku) {
      util.showError('请选择商品规格');
      return;
    }

    util.showLoading('添加中...');
    
    try {
      await api.addToCart(this.data.selectedSku.id, this.data.quantity);
      util.showSuccess('添加成功');
      this.getCartCount();
      this.onCloseSkuPicker();
    } catch (error) {
      console.error('添加到购物车失败:', error);
      util.showError('添加失败');
    } finally {
      util.hideLoading();
    }
  },

  // 立即购买
  async onBuyNow() {
    if (!this.data.selectedSku) {
      util.showError('请选择商品规格');
      return;
    }

    util.showLoading('处理中...');
    
    try {
      // 先添加到购物车
      await api.addToCart(this.data.selectedSku.id, this.data.quantity);
      
      // 跳转到订单确认页面
      wx.navigateTo({
        url: '/pages/order/confirm'
      });
    } catch (error) {
      console.error('立即购买失败:', error);
      util.showError('购买失败');
    } finally {
      util.hideLoading();
    }
  },

  // 切换收藏状态
  async onToggleFavorite() {
    try {
      this.setData({ isFavorite: !this.data.isFavorite });
      
      if (this.data.isFavorite) {
        util.showSuccess('已收藏');
      } else {
        util.showSuccess('已取消收藏');
      }
    } catch (error) {
      console.error('操作收藏失败:', error);
      this.setData({ isFavorite: !this.data.isFavorite }); // 恢复状态
      util.showError('操作失败');
    }
  },

  // 分享商品
  onShareAppMessage() {
    return {
      title: this.data.product.name,
      path: `/pages/product/detail?id=${this.productId}`,
      imageUrl: this.data.product.image
    };
  },

  // 打开操作菜单
  onOpenActionSheet() {
    this.setData({ showActionSheet: true });
  },

  // 关闭操作菜单
  onCloseActionSheet() {
    this.setData({ showActionSheet: false });
  },

  // 跳转到购物车
  onGoToCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});