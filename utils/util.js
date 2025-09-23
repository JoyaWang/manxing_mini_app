// 工具函数
const constants = require('./constants');

const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'));
};

// 格式化价格
const formatPrice = (price, options = {}) => {
  if (price === null || price === undefined) return '0.00';
  
  const { prefix = '¥', decimal = 2 } = options;
  const num = parseFloat(price);
  
  if (isNaN(num)) return '0.00';
  
  return `${prefix}${num.toFixed(decimal)}`;
};

// 防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 深拷贝
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// 生成随机ID
const generateId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 验证手机号
const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

// 验证邮箱
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 计算购物车总价
const calculateCartTotal = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  
  return cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  return constants.ORDER_STATUS_TEXT[status] || '未知状态';
};

// 获取订单状态描述
const getOrderStatusDesc = (status) => {
  return constants.ORDER_STATUS_DESC[status] || '';
};

// 获取图片URL（处理不同后端）
const getImageUrl = (imagePath, options = {}) => {
  const { width, height, quality } = options;
  let url = imagePath;
  
  // 如果是相对路径，添加基础URL
  if (url && !url.startsWith('http') && !url.startsWith('//')) {
    // 这里可以根据后端类型添加不同的基础URL
    const app = getApp();
    if (app.globalData.backendType === 'tencent') {
      url = `cloud://${app.globalData.config.tencent.env}/${url}`;
    } else if (app.globalData.backendType === 'supabase') {
      url = `${app.globalData.config.supabase.url}/storage/v1/object/public/images/${url}`;
    }
  }
  
  // 添加图片处理参数
  const params = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  if (quality) params.push(`quality=${quality}`);
  
  if (params.length > 0) {
    url += (url.includes('?') ? '&' : '?') + params.join('&');
  }
  
  return url;
};

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading();
};

// 显示成功提示
const showSuccess = (title, duration = 1500) => {
  wx.showToast({
    title,
    icon: 'success',
    duration
  });
};

// 显示错误提示
const showError = (title, duration = 1500) => {
  wx.showToast({
    title,
    icon: 'error',
    duration
  });
};

// 显示模态框
const showModal = (title, content, options = {}) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

module.exports = {
  formatTime,
  formatPrice,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  calculateCartTotal,
  getOrderStatusText,
  getOrderStatusDesc,
  getImageUrl,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showModal
};