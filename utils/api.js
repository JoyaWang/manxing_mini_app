// API工具类 - 支持腾讯云和Supabase切换
const app = getApp();
const constants = require('./constants');

class ApiClient {
  constructor() {
    this.backendType = app.globalData.backendType || 'tencent'; // Default to tencent for cloud deployment
    this.config = app.globalData.config;

    // 监听全局后端类型变化
    this.setupBackendTypeListener();
  }

  // 获取当前后端类型
  getBackendType() {
    return this.backendType;
  }

  // 设置后端类型
  setBackendType(type) {
    if (['tencent', 'supabase'].includes(type)) {
      this.backendType = type;
    }
  }

  // 设置后端类型变化监听
  setupBackendTypeListener() {
    // 保存原始方法
    const originalSwitch = app.switchBackendType;

    // 重写全局方法以包含回调
    app.switchBackendType = (type) => {
      originalSwitch.call(app, type);
      this.setBackendType(type);
      console.log('API客户端后端类型已更新:', type);
    };
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const { method = 'GET', data = {}, headers = {} } = options;

    try {
      // 根据后端类型选择请求方式
      if (this.backendType === 'tencent') {
        return await this.tencentRequest(endpoint, method, data);
      } else if (this.backendType === 'supabase') {
        return await this.supabaseRequest(endpoint, method, data, headers);
      } else {
        // Fallback to local HTTP request (for development)
        return await this.localRequest(endpoint, method, data, headers);
      }
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 本地后端服务器请求 (for development only)
  async localRequest(endpoint, method, data, headers = {}) {
    const baseURL = 'http://localhost:3002/api'; // Local dev server
    const url = `${baseURL}${endpoint}`;

    // 获取认证令牌
    const token = wx.getStorageSync('authToken');

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // 添加认证令牌到请求头
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
      url,
      method,
      header: defaultHeaders,
      data: data
    };

    return new Promise((resolve, reject) => {
      wx.request({
        ...requestOptions,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  // 腾讯云云函数请求 (optimized for cloud deployment)
  async tencentRequest(endpoint, method, data) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'node-app', // Cloud function name from cloudbaserc.json
        data: {
          $url: endpoint, // Use $url for HTTP-like routing in cloud function
          method,
          body: data // Pass data as body
        },
        success: (res) => {
          console.log('[TCB Request] Response:', res.result);
          if (res.result !== null && res.result !== undefined) {
            resolve(res.result);
          } else {
            reject('请求失败：云函数返回空响应');
          }
        },
        fail: (err) => {
          console.error('[TCB Request] Error:', err);
          reject(err);
        }
      });
    });
  }

  // Supabase请求
  async supabaseRequest(endpoint, method, data, headers) {
    const supabaseConfig = this.config.supabase;
    const url = `${supabaseConfig.url}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'apikey': supabaseConfig.key,
      'Authorization': `Bearer ${supabaseConfig.key}`
    };

    const requestOptions = {
      url,
      method,
      header: { ...defaultHeaders, ...headers },
      data: method !== 'GET' ? data : undefined
    };

    return new Promise((resolve, reject) => {
      wx.request({
        ...requestOptions,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }


  // 商品相关API (updated for cloud: handle fileIDs for images)
  async getProducts(params = {}) {
    const response = await this.request('/products', {
      method: 'GET',
      data: params
    });

    console.log('[API GET PRODUCTS] Raw response:', response);

    // Default placeholder image
    const defaultImage = 'https://via.placeholder.com/300x300/cccccc/666666?text=No+Image';

    if (response && response.products) {
      if (this.backendType === 'tencent') {
        // Cloud deployment - handle fileIDs by getting temp URLs
        const allFileIDs = [];
        response.products.forEach(product => {
          if (product.main_image && typeof product.main_image === 'string' && !product.main_image.startsWith('http')) {
            allFileIDs.push(product.main_image);
          }
          if (product.images && Array.isArray(product.images)) {
            product.images.forEach(img => {
              if (img && typeof img === 'string' && !img.startsWith('http')) {
                allFileIDs.push(img);
              }
            });
          }
        });

        if (allFileIDs.length > 0) {
          try {
            const urlRes = await new Promise((resolve, reject) => {
              wx.cloud.getTempFileURL({
                fileList: allFileIDs,
                success: resolve,
                fail: reject
              });
            });

            const urlMap = {};
            urlRes.fileList.forEach(item => {
              urlMap[item.fileID] = item.tempFileURL;
            });

            // Map responses with URLs
            response.products = response.products.map(product => {
              console.log('[API GET PRODUCTS] Processing product:', product.id, 'main_image:', product.main_image, 'images:', product.images);

              // Handle main_image
              let mainImagePath = product.main_image;
              if (mainImagePath && typeof mainImagePath === 'string' && !mainImagePath.startsWith('http')) {
                mainImagePath = urlMap[mainImagePath] || null;
              }

              // Handle images array
              let parsedImages = [];
              if (product.images) {
                if (typeof product.images === 'string') {
                  try {
                    parsedImages = JSON.parse(product.images);
                  } catch (e) {
                    parsedImages = [];
                  }
                } else if (Array.isArray(product.images)) {
                  parsedImages = product.images;
                }
              }

              parsedImages = parsedImages.map(img => {
                const imgStr = (img || '').toString().trim();
                if (imgStr && !imgStr.startsWith('http')) {
                  return urlMap[imgStr] || imgStr;
                }
                return imgStr;
              }).filter(Boolean);

              // Fallback to first image if no main
              if (!mainImagePath && parsedImages.length > 0) {
                mainImagePath = parsedImages[0];
              }

              const imageUrl = mainImagePath || defaultImage;
              console.log('[API GET PRODUCTS] Final image URL for product', product.id, ':', imageUrl);

              return {
                ...product,
                id: product._id || product.id,
                originalPrice: product.original_price || null,
                isFeatured: Boolean(product.is_featured),
                isNew: Boolean(product.is_new),
                categoryId: product.category_id || '',
                image: imageUrl,
                images: parsedImages,
                sales: product.sales_count || 0
              };
            });
          } catch (urlErr) {
            console.error('[API GET PRODUCTS] Failed to get temp URLs:', urlErr);
            // Fallback without cloud URLs
            response.products = response.products.map(product => ({
              ...product,
              id: product._id || product.id,
              originalPrice: product.original_price || null,
              isFeatured: Boolean(product.is_featured),
              isNew: Boolean(product.is_new),
              categoryId: product.category_id || '',
              image: product.main_image || product.image || defaultImage,
              images: Array.isArray(product.images) ? product.images : [],
              sales: product.sales_count || 0
            }));
          }
        } else {
          // No fileIDs, use existing logic
          response.products = response.products.map(product => ({
            ...product,
            id: product._id || product.id,
            originalPrice: product.original_price || null,
            isFeatured: Boolean(product.is_featured),
            isNew: Boolean(product.is_new),
            categoryId: product.category_id || '',
            image: product.main_image || product.image || defaultImage,
            images: Array.isArray(product.images) ? product.images : [],
            sales: product.sales_count || 0
          }));
        }
      } else {
        // Non-cloud backend (Supabase or local)
        response.products = response.products.map(product => ({
          ...product,
          id: product._id || product.id,
          originalPrice: product.original_price || null,
          isFeatured: Boolean(product.is_featured),
          isNew: Boolean(product.is_new),
          categoryId: product.category_id || '',
          image: product.main_image || product.image || defaultImage,
          images: Array.isArray(product.images) ? product.images : [],
          sales: product.sales_count || 0
        }));
      }
    }

    console.log('[API GET PRODUCTS] Final mapped products:', response.products);
    return response;
  }

  async getProductDetail(id) {
    const response = await this.request(`/products/${id}`);
    console.log('[API GET PRODUCT DETAIL] Raw response:', response);

    if (response) {
      // Handle different response formats
      let product = response.product || response;

      if (!product) {
        throw new Error('商品不存在');
      }

      // Standardize ID
      product.id = product._id || product.id;

      // Handle cloud images if needed
      if (this.backendType === 'tencent') {
        const defaultImage = 'https://via.placeholder.com/300x300/cccccc/666666?text=No+Image';

        // Handle main_image
        let mainImagePath = product.main_image;
        if (mainImagePath && typeof mainImagePath === 'string' && !mainImagePath.startsWith('http')) {
          try {
            const urlRes = await new Promise((resolve, reject) => {
              wx.cloud.getTempFileURL({
                fileList: [mainImagePath],
                success: resolve,
                fail: reject
              });
            });
            if (urlRes.fileList && urlRes.fileList[0]) {
              mainImagePath = urlRes.fileList[0].tempFileURL;
            }
          } catch (err) {
            console.error('Failed to get temp URL for main image:', err);
            mainImagePath = defaultImage;
          }
        } else if (!mainImagePath) {
          mainImagePath = defaultImage;
        }

        // Handle images array
        let parsedImages = [];
        if (product.images) {
          if (typeof product.images === 'string') {
            try {
              parsedImages = JSON.parse(product.images);
            } catch (e) {
              parsedImages = [];
            }
          } else if (Array.isArray(product.images)) {
            parsedImages = product.images;
          }
        }

        // Get temp URLs for images
        const allFileIDs = parsedImages.filter(img => typeof img === 'string' && !img.startsWith('http'));
        if (allFileIDs.length > 0) {
          try {
            const urlRes = await new Promise((resolve, reject) => {
              wx.cloud.getTempFileURL({
                fileList: allFileIDs,
                success: resolve,
                fail: reject
              });
            });
            const urlMap = {};
            urlRes.fileList.forEach(item => {
              urlMap[item.fileID] = item.tempFileURL;
            });
            parsedImages = parsedImages.map(img => {
              const imgStr = (img || '').toString().trim();
              if (imgStr && !imgStr.startsWith('http')) {
                return urlMap[imgStr] || imgStr;
              }
              return imgStr;
            }).filter(Boolean);
          } catch (err) {
            console.error('Failed to get temp URLs for images:', err);
          }
        }

        // Fallback to first image if no main
        if (!mainImagePath && parsedImages.length > 0) {
          mainImagePath = parsedImages[0];
        }

        return {
          ...product,
          id: product.id,
          originalPrice: product.original_price || null,
          isFeatured: Boolean(product.is_featured),
          isNew: Boolean(product.is_new),
          categoryId: product.category_id || '',
          image: mainImagePath || defaultImage,
          images: parsedImages,
          sales: product.sales_count || 0
        };
      } else {
        // Non-cloud mapping
        return {
          ...product,
          id: product._id || product.id,
          originalPrice: product.original_price || null,
          isFeatured: Boolean(product.is_featured),
          isNew: Boolean(product.is_new),
          categoryId: product.category_id || '',
          image: product.main_image || product.image || defaultImage,
          images: Array.isArray(product.images) ? product.images : [],
          sales: product.sales_count || 0
        };
      }
    } else {
      console.error('[API GET PRODUCT DETAIL] Invalid response:', response);
      throw new Error('商品不存在');
    }
  }

  async createProduct(productData) {
    // For cloud, store fileIDs directly
    return this.request('/products', {
      method: 'POST',
      data: productData
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      data: productData
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async updateProductStatus(id, status) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      data: { status }
    });
  }

  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      data: categoryData
    });
  }

  // 轮播图相关API
  async getBanners() {
    return this.request('/banners');
  }

  async updateBanners(banners) {
    return this.request('/banners', {
      method: 'PUT',
      data: banners
    });
  }

  // 广告位相关API
  async getAds() {
    return this.request('/ads');
  }

  async updateAds(ads) {
    return this.request('/ads', {
      method: 'PUT',
      data: ads
    });
  }

  // 购物车相关API
  async getCart() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.id : null;
    return this.request('/cart', {
      method: 'GET',
      data: { userId }
    });
  }

  async addToCart(productId, quantity = 1, skuId = null) {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.id : null;
    console.log('[API ADD TO CART] User ID:', userId, 'Product ID:', productId, 'Quantity:', quantity, 'SKU ID:', skuId);
    return this.request('/cart/items', {
      method: 'POST',
      data: { productId, quantity, skuId, userId }
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      data: { quantity }
    });
  }

  async removeCartItem(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // 订单相关API
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      data: orderData
    });
  }

  async getOrders(params = {}) {
    return this.request('/orders', {
      method: 'GET',
      data: params
    });
  }

  async getOrderDetail(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // 用户相关API
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      data: profileData
    });
  }

  // 地址相关API
  async getAddresses() {
    return this.request('/user/addresses');
  }

  async addAddress(addressData) {
    return this.request('/user/addresses', {
      method: 'POST',
      data: addressData
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'PUT',
      data: addressData
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'DELETE'
    });
  }

  // 图片上传 - 已优化为云存储 (using wx.cloud.uploadFile for HTTPS)
  async uploadImage(filePath, type = 'products') {
    console.log('[API] 开始上传图片, filePath:', filePath, 'type:', type);
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: `${type}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`,
        filePath: filePath,
        success: (uploadRes) => {
          console.log('[API] 云上传成功:', uploadRes.fileID);
          // 获取临时 URL (HTTPS)
          wx.cloud.getTempFileURL({
            fileList: [uploadRes.fileID],
            success: (urlRes) => {
              console.log('[API] 临时 URL:', urlRes.fileList[0].tempFileURL);
              resolve({
                success: true,
                message: '文件上传成功',
                file: {
                  originalName: 'uploaded.png',
                  filename: uploadRes.fileID, // Store fileID in DB
                  size: 0, // 可选，从 filePath 获取
                  mimetype: 'image/png',
                  url: urlRes.fileList[0].tempFileURL  // HTTPS URL for immediate use
                }
              });
            },
            fail: (err) => {
              console.error('[API] 获取临时 URL 失败:', err);
              reject(err);
            }
          });
        },
        fail: (err) => {
          console.error('[API] 云上传失败:', err);
          reject(err);
        }
      });
    });
  }

  // 用户管理相关API
  async getUsers(params = {}) {
    return this.request('/users', {
      method: 'GET',
      data: params
    });
  }

  async updateUserRole(userId, role) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      data: { role }
    });
  }

  async resetUserPassword(userId) {
    return this.request(`/users/${userId}/reset-password`, {
      method: 'POST'
    });
  }

  // 首页配置相关API
  async getHomeSectionsConfig() {
    return this.request('/admin/home-sections');
  }

  async updateHomeSectionsConfig(config) {
    return this.request('/admin/home-sections', {
      method: 'PUT',
      data: config
    });
  }

  // 商品展示配置相关API
  async getProductDisplayConfig() {
    return this.request('/admin/product-display-config');
  }

  async updateProductDisplayConfig(config) {
    return this.request('/admin/product-display-config', {
      method: 'PUT',
      data: config
    });
  }

  // 微信登录
  async wxLogin(code) {
    return this.request('/auth/wxlogin', {
      method: 'POST',
      data: { code }
    });
  }

  // 管理员登录
  async adminLogin(username, password) {
    return this.request('/admin/login', {
      method: 'POST',
      data: { username, password }
    });
  }
}

// 创建单例
const apiClient = new ApiClient();

module.exports = apiClient;
