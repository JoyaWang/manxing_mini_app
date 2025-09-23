const database = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');

async function initDatabase() {
  console.log('🔄 开始初始化数据库...');
  
  try {
    // 创建示例用户
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        avatar: 'https://via.placeholder.com/100',
        created_at: new Date()
      },
      {
        username: 'user1',
        password: 'user123',
        email: 'user1@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/100',
        created_at: new Date()
      }
    ];

    // 创建示例商品
    const products = [
      {
        name: 'iPhone 15 Pro',
        price: 7999,
        original_price: 8999,
        description: '最新款iPhone，搭载A17 Pro芯片',
        images: ['https://via.placeholder.com/400x400?text=iPhone+15+Pro'],
        category: '手机',
        stock: 100,
        status: 'active',
        created_at: new Date()
      },
      {
        name: 'MacBook Pro 16"',
        price: 14999,
        original_price: 16999,
        description: '专业级笔记本电脑，M2 Pro芯片',
        images: ['https://via.placeholder.com/400x400?text=MacBook+Pro'],
        category: '电脑',
        stock: 50,
        status: 'active',
        created_at: new Date()
      },
      {
        name: 'AirPods Pro',
        price: 1999,
        original_price: 2499,
        description: '主动降噪无线耳机',
        images: ['https://via.placeholder.com/400x400?text=AirPods+Pro'],
        category: '耳机',
        stock: 200,
        status: 'active',
        created_at: new Date()
      },
      {
        name: 'Apple Watch Series 9',
        price: 2999,
        original_price: 3299,
        description: '智能手表，健康监测',
        images: ['https://via.placeholder.com/400x400?text=Apple+Watch'],
        category: '手表',
        stock: 80,
        status: 'active',
        created_at: new Date()
      }
    ];

    console.log('📝 插入示例数据...');
    
    // 插入用户数据
    for (const userData of users) {
      await User.createFromWechat(userData);
    }
    
    // 插入商品数据
    for (const productData of products) {
      await Product.create(productData, 'system');
    }

    console.log('✅ 数据库初始化完成！');
    console.log('👥 创建了 2 个用户 (admin/user1)');
    console.log('🛍️  创建了 4 个商品');
    console.log('🔑 管理员账号: admin / admin123');
    console.log('👤 普通用户: user1 / user123');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
  }
}

// 如果是直接运行此脚本，则执行初始化
if (require.main === module) {
  initDatabase().then(() => {
    console.log('🎉 初始化脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { initDatabase };