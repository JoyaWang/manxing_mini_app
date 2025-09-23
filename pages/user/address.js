// pages/user/address.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    addresses: [],
    loading: true,
    selectMode: false // 是否是从订单页面选择地址
  },

  onLoad(options) {
    if (options.selectMode === 'true') {
      this.setData({ selectMode: true });
    }
    this.loadAddresses();
  },

  async loadAddresses() {
    this.setData({ loading: true });
    
    try {
      const addresses = await api.getAddresses();
      this.setData({
        addresses,
        loading: false
      });
    } catch (error) {
      console.error('加载地址失败:', error);
      util.showError('加载地址失败');
      this.setData({ loading: false });
    }
  },

  // 添加新地址
  onAddAddress() {
    wx.navigateTo({
      url: '/pages/user/address-edit'
    });
  },

  // 编辑地址
  onEditAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/address-edit?id=${addressId}`
    });
  },

  // 删除地址
  async onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(a => a.id === addressId);
    
    const confirm = await util.showModal('确认删除', `确定要删除地址"${address.name}"吗？`);
    if (!confirm) return;
    
    util.showLoading('删除中...');
    
    try {
      await api.deleteAddress(addressId);
      util.showSuccess('删除成功');
      this.loadAddresses(); // 重新加载地址列表
    } catch (error) {
      console.error('删除地址失败:', error);
      util.showError('删除失败');
    } finally {
      util.hideLoading();
    }
  },

  // 设置默认地址
  async onSetDefaultAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    
    util.showLoading('设置中...');
    
    try {
      await api.updateAddress(addressId, { isDefault: true });
      util.showSuccess('设置成功');
      this.loadAddresses(); // 重新加载地址列表
    } catch (error) {
      console.error('设置默认地址失败:', error);
      util.showError('设置失败');
    } finally {
      util.hideLoading();
    }
  },

  // 选择地址（从订单页面）
  onSelectAddress(e) {
    if (!this.data.selectMode) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(a => a.id === addressId);
    
    // 获取上级页面并传递地址数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage && prevPage.onAddressSelected) {
      prevPage.onAddressSelected(address);
      wx.navigateBack();
    }
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});