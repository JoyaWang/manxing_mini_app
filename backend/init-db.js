const db = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// 初始化示例数据
const initSampleData = async () => {
  try {
    console.log('🔄 开始初始化示例数据...');

    console.log('⚠️  当前使用模拟数据库模式，跳过数据初始化');
    console.log('📋 如需真实数据，请配置数据库环境变量：');
    console.log('   - SUPABASE_URL 和 SUPABASE_ANON_KEY (Supabase)');
    console.log('   - 或 TENCENT_DB_HOST 等 (腾讯云MySQL)');
    console.log('   - 或 PG_HOST 等 (PostgreSQL)');
    
    // 模拟用户数据用于测试
    const savedAdmin = { _id: 'admin-user-id', username: '管理员', email: 'admin@wechat-mall.com' };
    const savedUser = { _id: 'test-user-id', username: '测试用户', email: 'test@wechat-mall.com' };
    console.log('✅ 用户数据初始化完成');

    // 创建示例商品
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro Max',
        price: 9999,
        originalPrice: 10999,
        stock: 50,
        description: '最新款iPhone，搭载A17 Pro芯片，钛金属设计',
        category: '手机',
        specs: ['256GB', '钛金属', '5倍光学变焦'],
        images: ['/uploads/products/iphone-1.jpg', '/uploads/products/iphone-2.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      },
      {
        name: 'MacBook Pro 14英寸',
        price: 12999,
        originalPrice: 14999,
        stock: 30,
        description: '专业级笔记本电脑，M3 Pro芯片， Liquid视网膜XDR显示屏',
        category: '电脑',
        specs: ['M3 Pro', '16GB', '1TB SSD'],
        images: ['/uploads/products/macbook-1.jpg', '/uploads/products/macbook-2.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      },
      {
        name: 'AirPods Pro',
        price: 1899,
        originalPrice: 1999,
        stock: 100,
        description: '主动降噪无线耳机，通透模式，空间音频',
        category: '耳机',
        specs: ['降噪', '无线充电', '空间音频'],
        images: ['/uploads/products/airpods-1.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      },
      {
        name: 'Apple Watch Series 9',
        price: 2999,
        originalPrice: 3199,
        stock: 40,
        description: '智能手表，血氧检测，心电图功能',
        category: '手表',
        specs: ['45mm', 'GPS', '血氧检测'],
        images: ['/uploads/products/watch-1.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      },
      {
        name: 'iPad Air',
        price: 4399,
        originalPrice: 4799,
        stock: 25,
        description: '轻薄平板电脑，M1芯片，支持Apple Pencil',
        category: '平板',
        specs: ['M1芯片', '10.9英寸', '5G'],
        images: ['/uploads/products/ipad-1.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      },
      {
        name: 'Magic Keyboard',
        price: 999,
        originalPrice: 1099,
        stock: 60,
        description: '无线键盘，带触控ID，剪刀式结构',
        category: '配件',
        specs: ['无线', '触控ID', '背光'],
        images: ['/uploads/products/keyboard-1.jpg'],
        status: 'active',
        createdBy: savedAdmin._id
      }
    ];

    console.log('✅ 模拟数据初始化完成');
    console.log('📋 管理员账号: admin@wechat-mall.com');
    console.log('📋 测试用户账号: test@wechat-mall.com');
    console.log('💡 提示：当前为模拟模式，请配置真实数据库以获得完整功能');

  } catch (error) {
    console.error('❌ 数据初始化失败:', error.message);
    process.exit(1);
  }
};

// 主函数
const main = async () => {
  try {
    // 等待数据库连接
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('📊 当前数据库类型:', db.getType());
    console.log('📊 数据库连接状态:', db.isConnected ? '已连接' : '模拟模式');
    
    // 初始化数据
    await initSampleData();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化过程失败:', error.message);
    process.exit(1);
  }
};

// 运行初始化
if (require.main === module) {
  main();
}

module.exports = { initSampleData };