// 配置文件示例
// 复制此文件为 config.js 并填写实际配置

module.exports = {
  // 腾讯云配置
  tencent: {
    env: 'your-cloud-env-id', // 云环境ID
    // 其他腾讯云配置...
  },

  // Supabase配置
  supabase: {
    url: 'https://your-project.supabase.co', // Supabase项目URL
    key: 'your-supabase-anon-key', // Supabase匿名密钥
    // 其他Supabase配置...
  },

  // API配置
  api: {
    baseURL: 'https://api.yourdomain.com',
    timeout: 10000,
    // 其他API配置...
  },

  // 小程序配置
  miniprogram: {
    appId: 'your-app-id',
    appSecret: 'your-app-secret',
    // 其他小程序配置...
  },

  // 功能开关
  features: {
    wechatPay: true,     // 微信支付
    alipay: false,       // 支付宝支付
    coupon: true,        // 优惠券功能
    points: true,        // 积分功能
    // 其他功能开关...
  },

  // 业务配置
  business: {
    shopName: '我的商城',
    contact: {
      phone: '400-123-4567',
      email: 'support@yourdomain.com',
      address: '北京市朝阳区xxx路xxx号'
    },
    // 其他业务配置...
  }
};

// 使用方法：
// 1. 复制此文件为 config.js
// 2. 填写实际配置信息
// 3. 在 app.js 中引入配置：
//    const config = require('./config');
//    App({
//      globalData: {
//        config: config
//      }
//    });