// pages/cart/cart.js
const app = getApp();
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    cartItems: [],
    selectedItems: [],
    totalPrice: 0,
    loading: true,
    editing: false,
    allSelected: false
  },

  onLoad() {
    this.loadCart();
  },

  onShow() {
    this.loadCart();
  },

  async loadCart() {
    this.setData({ loading: true });
    
    try {
      const cart = await api.getCart();
      const cartItems = cart.items || [];
      
      this.setData({
        cartItems,
        selectedItems: cartItems.filter(item => item.selected).map(item => item.id),
        loading: false
      });
      
      this.calculateTotal();
    } catch (error) {
      console.error('加载购物车失败:', error);
      util.showError('加载购物车失败');
      this.setData({ loading: false });
    }
  },

  // 计算总价
  calculateTotal() {
    const { cartItems, selectedItems } = this.data;
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const totalPrice = util.calculateCartTotal(selectedCartItems);
    
    this.setData({
      totalPrice,
      allSelected: selectedItems.length === cartItems.length && cartItems.length > 0
    });
  },

  // 选择/取消选择商品
  onSelectItem(e) {
    const itemId = e.currentTarget.dataset.id;
    let { selectedItems } = this.data;
    
    if (selectedItems.includes(itemId)) {
      selectedItems = selectedItems.filter(id => id !== itemId);
    } else {
      selectedItems.push(itemId);
    }
    
    this.setData({ selectedItems });
    this.calculateTotal();
    this.updateItemSelection(selectedItems);
  },

  // 全选/取消全选
  onSelectAll() {
    const { cartItems, allSelected } = this.data;
    const selectedItems = allSelected ? [] : cartItems.map(item => item.id);
    
    this.setData({
      selectedItems,
      allSelected: !allSelected
    });
    
    this.calculateTotal();
    this.updateItemSelection(selectedItems);
  },

  // 更新商品选择状态到服务器
  async updateItemSelection(selectedItems) {
    try {
      // 这里需要实现批量更新选择状态的API
      // 暂时只在前端处理
    } catch (error) {
      console.error('更新选择状态失败:', error);
    }
  },

  // 修改商品数量
  async onQuantityChange(e) {
    const { id } = e.currentTarget.dataset;
    const quantity = parseInt(e.detail.value) || 1;
    const validQuantity = Math.max(1, quantity);
    
    try {
      await api.updateCartItem(id, validQuantity);
      
      // 更新本地数据
      const cartItems = this.data.cartItems.map(item => 
        item.id === id ? { ...item, quantity: validQuantity } : item
      );
      
      this.setData({ cartItems });
      this.calculateTotal();
    } catch (error) {
      console.error('修改数量失败:', error);
      util.showError('修改数量失败');
      this.loadCart(); // 重新加载数据
    }
  },

  // 增加数量
  async onIncrease(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.cartItems.find(item => item.id === id);
    const newQuantity = (item.quantity || 1) + 1;
    
    await this.updateItemQuantity(id, newQuantity);
  },

  // 减少数量
  async onDecrease(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.cartItems.find(item => item.id === id);
    const newQuantity = Math.max(1, (item.quantity || 1) - 1);
    
    await this.updateItemQuantity(id, newQuantity);
  },

  async updateItemQuantity(itemId, quantity) {
    try {
      await api.updateCartItem(itemId, quantity);
      
      // 更新本地数据
      const cartItems = this.data.cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      this.setData({ cartItems });
      this.calculateTotal();
    } catch (error) {
      console.error('更新数量失败:', error);
      util.showError('更新数量失败');
      this.loadCart(); // 重新加载数据
    }
  },

  // 删除商品
  async onDeleteItem(e) {
    const { id } = e.currentTarget.dataset;
    
    const confirm = await util.showModal('确认删除', '确定要删除这个商品吗？');
    if (!confirm) return;
    
    util.showLoading('删除中...');
    
    try {
      await api.removeCartItem(id);
      util.showSuccess('删除成功');
      this.loadCart();
    } catch (error) {
      console.error('删除商品失败:', error);
      util.showError('删除失败');
    } finally {
      util.hideLoading();
    }
  },

  // 清空购物车
  async onClearCart() {
    const confirm = await util.showModal('确认清空', '确定要清空购物车吗？');
    if (!confirm) return;
    
    util.showLoading('清空中...');
    
    try {
      // 这里需要实现清空购物车的API
      // 暂时逐个删除
      for (const item of this.data.cartItems) {
        await api.removeCartItem(item.id);
      }
      
      util.showSuccess('清空成功');
      this.loadCart();
    } catch (error) {
      console.error('清空购物车失败:', error);
      util.showError('清空失败');
    } finally {
      util.hideLoading();
    }
  },

  // 去结算
  onCheckout() {
    const { selectedItems, cartItems } = this.data;
    
    if (selectedItems.length === 0) {
      util.showError('请选择要结算的商品');
      return;
    }
    
    // 检查库存
    const outOfStockItems = cartItems
      .filter(item => selectedItems.includes(item.id) && item.stock < item.quantity);
    
    if (outOfStockItems.length > 0) {
      util.showError('部分商品库存不足');
      return;
    }
    
    wx.navigateTo({
      url: '/pages/order/confirm'
    });
  },

  // 继续购物
  onContinueShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 切换编辑模式
  onToggleEdit() {
    this.setData({ editing: !this.data.editing });
  }
});