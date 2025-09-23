// pages/user/address-edit.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    address: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    isEdit: false,
    loading: false,
    region: ['', '', ''],
    customItem: '全部'
  },

  onLoad(options) {
    if (options.id) {
      this.addressId = options.id;
      this.setData({ isEdit: true });
      this.loadAddressDetail();
    }
  },

  async loadAddressDetail() {
    this.setData({ loading: true });
    
    try {
      const addresses = await api.getAddresses();
      const address = addresses.find(a => a.id === this.addressId);
      
      if (address) {
        this.setData({
          address,
          region: [address.province, address.city, address.district]
        });
      }
    } catch (error) {
      console.error('加载地址详情失败:', error);
      util.showError('加载地址详情失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`address.${field}`]: value
    });
  },

  // 地区选择
  onRegionChange(e) {
    const region = e.detail.value;
    this.setData({
      region,
      'address.province': region[0],
      'address.city': region[1],
      'address.district': region[2]
    });
  },

  // 切换默认地址
  onToggleDefault() {
    this.setData({
      'address.isDefault': !this.data.address.isDefault
    });
  },

  // 验证表单
  validateForm() {
    const { name, phone, province, city, district, detail } = this.data.address;
    
    if (!name.trim()) {
      util.showError('请输入收货人姓名');
      return false;
    }
    
    if (!phone.trim()) {
      util.showError('请输入手机号码');
      return false;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      util.showError('请输入正确的手机号码');
      return false;
    }
    
    if (!province || !city || !district) {
      util.showError('请选择所在地区');
      return false;
    }
    
    if (!detail.trim()) {
      util.showError('请输入详细地址');
      return false;
    }
    
    return true;
  },

  // 保存地址
  async onSaveAddress() {
    if (!this.validateForm()) return;
    
    this.setData({ loading: true });
    
    try {
      if (this.data.isEdit) {
        await api.updateAddress(this.addressId, this.data.address);
        util.showSuccess('更新成功');
      } else {
        await api.addAddress(this.data.address);
        util.showSuccess('添加成功');
      }
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存地址失败:', error);
      util.showError('保存失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 删除地址
  async onDeleteAddress() {
    if (!this.data.isEdit) return;
    
    const confirm = await util.showModal('确认删除', '确定要删除这个地址吗？');
    if (!confirm) return;
    
    util.showLoading('删除中...');
    
    try {
      await api.deleteAddress(this.addressId);
      util.showSuccess('删除成功');
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('删除地址失败:', error);
      util.showError('删除失败');
    } finally {
      util.hideLoading();
    }
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack();
  }
});