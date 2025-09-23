// 常量定义
module.exports = {
  // 订单状态
  ORDER_STATUS: {
    PENDING: 'pending',      // 待付款
    PAID: 'paid',            // 已付款
    SHIPPED: 'shipped',      // 已发货
    COMPLETED: 'completed',  // 已完成
    CANCELLED: 'cancelled'   // 已取消
  },

  // 订单状态文本
  ORDER_STATUS_TEXT: {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  },

  // 订单状态描述
  ORDER_STATUS_DESC: {
    pending: '等待买家付款',
    paid: '商家正在准备商品',
    shipped: '商品已发货',
    completed: '交易已完成',
    cancelled: '订单已取消'
  },

  // 支付方式
  PAYMENT_METHODS: {
    WECHAT: 'wechat',
    ALIPAY: 'alipay'
  },

  // 后端类型
  BACKEND_TYPES: {
    TENCENT: 'tencent',
    SUPABASE: 'supabase'
  },

  // 页面路径
  PAGES: {
    INDEX: '/pages/index/index',
    CATEGORY: '/pages/category/category',
    PRODUCT_LIST: '/pages/product/list',
    PRODUCT_DETAIL: '/pages/product/detail',
    CART: '/pages/cart/cart',
    ORDER_CONFIRM: '/pages/order/confirm',
    ORDER_LIST: '/pages/order/list',
    ORDER_DETAIL: '/pages/order/detail',
    USER: '/pages/user/user',
    ADDRESS: '/pages/user/address',
    ADDRESS_EDIT: '/pages/user/address-edit'
  },

  // API 端点
  API_ENDPOINTS: {
    // 商品相关
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/{id}',
    CATEGORIES: '/categories',
    
    // 购物车相关
    CART: '/cart',
    CART_ITEMS: '/cart/items',
    CART_ITEM: '/cart/items/{id}',
    
    // 订单相关
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/{id}',
    CANCEL_ORDER: '/orders/{id}/cancel',
    CONFIRM_RECEIPT: '/orders/{id}/confirm',
    
    // 用户相关
    USER_PROFILE: '/user/profile',
    USER_ADDRESSES: '/user/addresses',
    USER_ADDRESS: '/user/addresses/{id}'
  },

  // 错误代码
  ERROR_CODES: {
    NETWORK_ERROR: 1001,
    API_ERROR: 1002,
    VALIDATION_ERROR: 1003,
    AUTH_ERROR: 1004
  },

  // 配置
  CONFIG: {
    PAGE_SIZE: 20,
    MAX_CART_QUANTITY: 99,
    DEFAULT_AVATAR: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI2MCIgZmlsbD0iI0ZGNkIzNSIvPjx0ZXh0IHg9IjYwIiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7nlKjmiLc8L3RleHQ+PC9zdmc+',
    DEFAULT_PRODUCT_IMAGE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuWbvueJh+WbvueJhzwvdGV4dD48L3N2Zz4='
  }
};