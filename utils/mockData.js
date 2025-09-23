// 模拟数据
const mockData = {
  // 用户信息
  user: {
    id: 1,
    nickName: '商城用户',
    avatarUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#FF6B35"/><text x="60" y="70" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">用户</text></svg>',
    phone: '138****8888',
    email: 'user@example.com',
    points: 1000,
    balance: 999.99,
    isAdmin: false
  },

  // 管理员信息
  admin: {
    id: 1001,
    nickName: '管理员',
    avatarUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="极 0 120 120"><circle cx="60" cy="60" r="60" fill="#4ECDC4"/><text x="60" y="70" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">管理</text></svg>',
    phone: '139****9999',
    email: 'admin@example.com',
    role: 'super_admin',
    permissions: ['product_manage', 'user_manage', 'order_manage']
  },

  // 分类数据
  categories: [
    { id: 1, name: '手机数码', icon: '📱', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FF6B35"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">手机</text></svg>' },
    { id: 2, name: '电脑办公', icon: '💻', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#4ECDC4"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">电脑</text></svg>' },
    { id: 3, name: '家用电器', icon: '🏠', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#45B7D1"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">家电</text></svg>' },
    { id: 4, name: '服装鞋包', icon: '👕', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#96CEB4"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">服装</text></svg>' },
    { id: 5, name: '美妆护肤', icon: '💄', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50极 cy="50" r="40" fill="#FECA57"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">美妆</text></svg>' },
    { id: 6, name: '食品生鲜', icon: '🍎', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FF9FF3"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">食品</text></svg>' },
    { id: 7, name: '母婴玩具', icon: '🧸', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#54A0FF"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">母婴</text></svg>' },
    { id: 8, name: '运动户外', icon: '⚽', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FF6B9D"/><text x="50" y="55" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">运动</text></svg>' }
  ],

  // 商品数据
  products: [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 512GB',
      price: 9999.00,
      originalPrice: 10999.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15</text></svg>',
      images: [
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15-1</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height极400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15-2</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white极text-anchor="middle" dominant-baseline="middle">iPhone 15-3</text></svg>'
      ],
      categoryId: 1,
      stock: 50,
      sales: 1000,
      isFeatured: true,
      isNew: true,
      status: 'published',
      description: '全新iPhone 15 Pro Max，搭载A17 Pro芯片，4800万像素主摄像头',
      detail: '<p>iPhone 15 Pro Max 采用钛金属设计，重量更轻，耐用性更强。</p><p>配备4800万像素主摄像头，支持5倍光学变焦。</p>',
      skus: [
        { id: 1, name: '深空黑色 512GB', price: 9999.00, stock: 20 },
        { id: 2, name: '银色 512GB', price: 9999.00, stock: 15 },
        { id: 3, name: '金色 512GB', price: 9999.00, stock: 15 }
      ],
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-15T14:30:00Z'
    },
    {
      id: 2,
      name: 'MacBook Pro 16英寸 M2 Pro',
      price: 18999.00,
      originalPrice: 19999.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#4ECDC4"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">MacBook Pro</text></svg>',
      categoryId: 2,
      stock: 30,
      sales: 500,
      isFeatured: true,
      status: 'published',
      description: 'MacBook Pro 16英寸，M2 Pro芯片，32GB内存，1TB SSD',
      detail: '<p>MacBook Pro 16英寸搭载M2 Pro芯片，性能强劲。</p><极>配备Liquid视网膜XDR显示屏，色彩精准。</p>',
      createdAt: '极25-08-15T09:00:00Z',
      updatedAt: '2025-09-10T16:20:00Z'
    },
    {
      id: 3,
      name: 'AirPods Pro 2代',
      price: 1899.00,
      originalPrice: 1999.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 极00 400"><rect width="400" height="400" fill="#45B7D1"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">AirPods Pro</text></svg>',
      categoryId: 1,
      stock: 100,
      sales: 2000,
      isFeatured: true,
      status: 'published',
      description: 'AirPods Pro 2代，主动降噪，空间音频',
      detail: '<p>AirPods Pro 2代提供卓越的音质和降噪效果。</p>',
      createdAt: '2025-07-20T14:00:00Z',
      updatedAt: '2025-09-05T11:45:00Z'
    },
    {
      id: 4,
      name: 'iPad Pro 12.9英寸 M2',
      price: 9299.00,
      originalPrice: 9999.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#96CEB4"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPad Pro</text></svg>',
      categoryId: 1,
      stock: 40,
      sales: 800,
      status: 'published',
      description: 'iPad Pro 12.9英寸，M2芯片，Liquid视网膜XDR显示屏',
      detail: '<p>iPad Pro 12.9英寸是创意工作的理想选择。</p>',
      createdAt: '2025-06-10T11:00:00Z',
      updatedAt: '2025-09-01T09:30:00Z'
    },
    {
      id: 5,
      name: 'Apple Watch Series 9',
      price: 3199.00,
      originalPrice: 3499.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FECA57"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">Apple Watch</text></svg>',
      categoryId: 1,
      stock: 60,
      sales: 1200,
      isNew: true,
      status: 'published',
      description: 'Apple Watch Series 9，健康监测，运动追踪',
      detail: '<p>Apple Watch Series 9提供全面的健康监测功能。</p>',
      createdAt: '2025-08-01T14:00:00Z',
      updatedAt: '2025-09-12T10:15:00Z'
    },
    {
      id: 6,
      name: 'Sony 65英寸 4K电视',
      price: 5999.00,
      originalPrice: 6999.00,
      image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF9FF3"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">Sony TV</text></svg>',
      categoryId: 3,
      stock: 25,
      sales: 300,
      status: 'published',
      description: 'Sony 65英寸4K智能电视，X1 Ultimate处理器',
      detail: '<p>Sony 4K电视提供出色的画质和音效体验。</p>',
      createdAt: '2025-07-15T16:00:00Z',
      updatedAt: '2025-09-08T14:20:00Z'
    }
  ],

  // 轮播图数据
  banners: [
    { id: 1, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><rect width="800" height="300" fill="#FF6B35"/><text x="400" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15 Pro Max</text></svg>', productId: 1 },
    { id: 2, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><rect width="800" height="300" fill="#4ECDC4"/><text x="400" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">MacBook Pro</text></svg>', productId: 2 },
    { id: 3, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300"><rect width="800" height="300" fill="#45B7D1"/><text x="400" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">AirPods Pro</text></svg>', productId: 3 }
  ],

  // 广告位数据
  ads: [
    { id: 1, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400极 height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#96CEB4"/><text x="200" y="100" font-family="Arial" font-size="18极 fill="white" text-anchor="middle" dominant-baseline="middle">iPad Pro</text></svg>', link: '/pages/product/detail?id=4' },
    { id: 2, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#FECA57"/><text x="200" y="100" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">Apple Watch</text></svg>', link: '/pages/product/detail?id=5' },
    { id: 3, image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#FF9FF3"/><text x="200" y="100" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">手机数码</text></svg>', link: '/pages/category/list?id=1' }
  ],

  // 地址数据
  addresses: [
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区18栋501室',
      isDefault: true
    },
    {
      id: 2,
      name: '李四',
      phone: '13900139000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '国贸大厦A座1201室',
      isDefault: false
    }
  ],

  // 购物车数据
  cart: {
    items: [
      {
        id: 1,
        productId: 1,
        skuId: 1,
        name: 'iPhone 15 Pro Max 512GB',
        skuName: '深空黑色 512GB',
        price: 9999.00,
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15</text></svg>',
        quantity: 1,
        selected: true
      },
      {
        id: 2,
        productId: 3,
        skuId: null,
        name: 'AirPods Pro 2代',
        skuName: '',
        price: 1899.00,
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#45B7D1"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">AirPods Pro</text></svg>',
        quantity: 2,
        selected: true
      }
    ],
    total: 13797.00
  },

  // 订单数据
  orders: [
    {
      id: 1,
      orderNo: 'ORDER20250001',
      status: 'completed',
      totalAmount: 13797.00,
      createTime: '2025-09-15T10:30:00Z',
      payTime: '2025-09-15T10:35:00Z',
      completeTime: '2025-09-18T14:20:00Z',
      items: [
        {
          id: 1,
          productId: 1,
          name: 'iPhone 15 Pro Max 512GB',
          skuName: '深空黑色 512GB',
          price: 9999.00,
          image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF6B35"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">iPhone 15</text></svg>',
          quantity: 1
        },
        {
          id: 2,
          productId: 3,
          name: '极irPods Pro 2代',
          skuName: '',
          price: 1899.00,
          image: 'data:极mage/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#45B7D1"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">AirPods Pro</text></svg>',
          quantity: 2
        }
      ],
      address: {
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区18栋501室'
      },
      paymentMethod: 'wechat',
      remark: '请工作日配送'
    },
    {
      id: 2,
      orderNo: 'ORDER20250002',
      status: 'shipped',
      totalAmount: 5999.00,
      createTime: '2025-09-20T14:20:00Z',
      payTime: '2025-09-20T14:25:00Z',
      shipTime: '2025-09-20T16:30:00Z',
      items: [
        {
          id: 3,
          product极: 6,
          name: 'Sony 65英寸 4K电视',
          skuName: '',
          price: 5999.00,
          image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#FF9FF3"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">Sony TV</text></svg>',
          quantity: 1
        }
      ],
      address: {
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区18栋501室'
      },
      paymentMethod: 'alipay',
      remark: ''
    }
  ]
};

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API响应
const mockApi = {
  // 微信登录
  async wxLogin(code) {
    await delay(800);
    // 模拟微信登录成功
    return {
      token: 'mock_wx_token_' + Date.now(),
      userInfo: mockData.user,
      expiresIn: 7200
    };
  },

  // 获取用户信息
  async getUserProfile() {
    await delay(500);
    return mockData.user;
  },

  // 管理员登录
  async adminLogin(username, password) {
    await delay(600);
    if (username === 'admin' && password === 'admin123') {
      return {
        token: 'mock_admin_token_' + Date.now(),
        userInfo: mockData.admin,
        expiresIn: 7200
      };
    }
    throw new Error('用户名或密码错误');
  },

  // 获取分类
  async getCategories() {
    await delay(300);
    return mockData.categories;
  },

  // 获取商品列表
  async getProducts(params = {}) {
    await delay(400);
    
    let products = [...mockData.products];
    
    // 分类筛选
    if (params.categoryId) {
      products = products.filter(p => p.categoryId === parseInt(params.categoryId));
    }
    
    // 状态筛选
    if (params.status) {
      products = products.filter(p => p.status === params.status);
    }
    
    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
      );
    }
    
    // 排序
    if (params.sort) {
      const order = params.order === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        if (params.sort === 'price') {
          return (a.price - b.price) * order;
        } else if (params.sort === 'sales') {
          return (a.sales - b.sales) * order;
        } else if (params.sort === 'createdAt') {
          return (a.id - b.id) * order;
        }
        return 0;
      });
    }
    
    // 分页
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return products.slice(start, end);
  },

  // 获取商品详情
  async getProductDetail(id) {
    await delay(400);
    const product = mockData.products.find(p => p.id === parseInt(id));
    if (!product) throw new Error('商品不存在');
    return product;
  },

  // 创建商品
  async createProduct(productData) {
    await delay(600);
    const newProduct = {
      id: Date.now(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      sales: 0
    };
    mockData.products.push(newProduct);
    return newProduct;
  },

  // 更新商品
  async updateProduct(id, productData) {
    await delay(500);
    const product = mockData.products.find(p => p.id === parseInt(id));
    if (!product) throw new Error('商品不存在');
    
    Object.assign(product, productData, {
      updatedAt: new Date().toISOString()
    });
    return product;
  },

  // 删除商品
  async deleteProduct(id) {
    await delay(400);
    const index = mockData.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('商品不存在');
    
    mockData.products.splice(index, 1);
    return { success: true };
  },

  // 商品上下架
  async toggleProductStatus(id, status) {
    await delay(300);
    const product = mockData.products.find(p => p.id === parseInt(id));
    if (!product) throw new Error('商品不存在');
    
    product.status = status;
    product.updatedAt = new Date().toISOString();
    return product;
  },

  // 获取轮播图
  async getBanners() {
    await delay(300);
    return mockData.banners;
  },

  // 更新轮播图
  async updateBanners(banners) {
    await delay(400);
    mockData.banners = banners;
    return { success: true };
  },

  // 获取广告位
  async getAds() {
    await delay(300);
    return mockData.ads;
  },

  // 更新广告位
  async updateAds(ads) {
    await delay(400);
    mockData.ads = ads;
    return { success: true };
  },

  // 获取购物车
  async getCart() {
    await delay(300);
    return mockData.cart;
  },

  // 添加到购物车
  async addToCart(productId, quantity = 1, skuId = null) {
    await delay(300);
    const product = mockData.products.find(p => p.id === parseInt(productId));
    if (!product) throw new Error('商品不存在');
    
    const cartItem = {
      id: Date.now(),
      productId: product.id,
      skuId,
      name: product.name,
      skuName: skuId ? product.skus?.find(s => s.id === skuId)?.name : '',
      price: skuId ? product.skus?.find(s => s.id === skuId)?.price : product.price,
      image: product.image,
      quantity: parseInt(quantity),
      selected: true
    };
    
    mockData.cart.items.push(cartItem);
    return cartItem;
  },

  // 更新购物车商品数量
  async updateCartItem(itemId, quantity) {
    await delay(300);
    const item = mockData.cart.items.find(i => i.id === parseInt(itemId));
    if (!极) throw new Error('购物车商品不存在');
    
    item.quantity = Math.max(1, parseInt(quantity));
    return item;
  },

  // 删除购物车商品
  async removeCartItem(itemId) {
    await delay(300);
    const index = mockData.cart.items.findIndex(i => i.id === parseInt(itemId));
    if (index === -1) throw new Error('购物车商品不存在');
    
    mockData.cart.items.splice(index, 1);
    return { success: true };
  },

  // 获取地址列表
  async getAddresses() {
    await delay(300);
    return mockData.addresses;
  },

  // 添加地址
  async addAddress(addressData) {
    await delay(300);
    const newAddress = {
      id: Date.now(),
      ...addressData
    };
    mockData.addresses.push(newAddress);
    return newAddress;
  },

  // 更新地址
  async updateAddress(addressId, addressData) {
    await delay(300);
    const address = mockData.addresses.find(a => a.id === parseInt(addressId));
    if (!address) throw new Error('地址不存在');
    
    Object.assign(address, addressData);
    return address;
  },

  // 删除地址
  async deleteAddress(addressId) {
    await delay(300);
    const index = mockData.addresses.findIndex(a => a.id === parseInt(addressId));
    if (index === -1) throw new Error('地址不存在');
    
    mockData.addresses.splice(index, 1);
    return { success: true };
  },

  // 获取订单列表
  async getOrders(params = {}) {
    await delay(500);
    let orders = [...mockData.orders];
    
    // 状态筛选
    if (params.status && params.status !== 'all') {
      orders = orders.filter(o => o.status === params.status);
    }
    
    // 分页
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return orders.slice(start, end);
  },

  // 获取订单详情
  async getOrderDetail(orderId) {
    await delay(400);
    const order = mockData.orders.find(o => o.id === parseInt(orderId));
    if (!order) throw new Error('订单不存在');
    return order;
  },

  // 创建订单
  async createOrder(orderData) {
    await delay(600);
    const newOrder = {
      id: Date.now(),
      order极: 'ORDER' + Date.now(),
      status: 'pending',
      totalAmount: orderData.totalAmount,
      createTime: new Date().toISOString(),
      items: orderData.items,
      address: mockData.addresses.find(a => a.id === orderData.addressId),
      paymentMethod: orderData.paymentMethod,
      remark: orderData.remark
    };
    
    mockData.orders.unshift(newOrder);
    return newOrder;
  },

  // 上传图片
  async uploadImage(filePath) {
    await delay(1000);
    // 模拟上传成功，返回图片URL
    return {
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#${Math.floor(Math.random()*16777215).toString(16)}"/><text x="200" y="200" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">上传图片</text></svg>`,
      success: true
    };
  },

  // 用户管理相关API
  async getUsers(params = {}) {
    await delay(500);

    // 模拟用户数据
    const mockUsers = [
      { id: 1, nick_name: '普通用户', avatar_url: mockData.user.avatarUrl, phone: '138****8888', email: 'user@example.com', role: 'user', created_at: '2025-09-01T10:00:00Z' },
      { id: 2, nick_name: '管理员', avatar_url: mockData.admin.avatarUrl, phone: '139****9999', email: 'admin@example.com', role: 'admin', created_at: '2025-08-15T09:00:00Z' },
      { id: 3, nick_name: '测试用户1', avatar_url: mockData.user.avatarUrl, phone: '137****7777', email: 'test1@example.com', role: 'user', created_at: '2025-09-10T14:30:00Z' },
      { id: 4, nick_name: '测试用户2', avatar_url: mockData.user.avatarUrl, phone: '136****6666', email: 'test2@example.com', role: 'user', created_at: '2025-09-12T11:20:00Z' },
      { id: 5, nick_name: 'VIP用户', avatar_url: mockData.user.avatarUrl, phone: '135****5555', email: 'vip@example.com', role: 'user', created_at: '2025-09-05T16:45:00Z' }
    ];

    let users = [...mockUsers];

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      users = users.filter(u =>
        u.nick_name.toLowerCase().includes(keyword) ||
        u.phone.includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      );
    }

    // 角色筛选
    if (params.role) {
      users = users.filter(u => u.role === params.role);
    }

    // 分页
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      users: users.slice(start, end),
      totalPages: Math.ceil(users.length / limit),
      currentPage: page,
      total: users.length
    };
  },

  async updateUserRole(userId, role) {
    await delay(300);
    // 模拟更新用户角色
    return { success: true, message: '用户角色更新成功' };
  },

  async resetUserPassword(userId) {
    await delay(300);
    // 模拟重置密码
    return { success: true, message: '密码重置成功' };
  },

  // 首页配置相关API
  async getHomeSectionsConfig() {
    await delay(300);
    // 模拟首页配置数据
    return mockData.homeSections || {
      banners: true,
      categories: true,
      featured: true,
      hot: true,
      new: true,
      ads: true
    };
  },

  async updateHomeSectionsConfig(config) {
    await delay(300);
    // 模拟保存首页配置
    mockData.homeSections = config;
    return { success: true, message: '首页配置保存成功' };
  }
};

module.exports = mockApi;
