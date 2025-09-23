const db = require('./config/database');
const Product = require('./models/Product');

// 添加测试商品数据
const addTestProducts = async () => {
  try {
    console.log('🔄 开始添加测试商品数据...');

    // 测试商品数据
    const testProducts = [
      {
        name: 'iPhone 15 Pro Max',
        price: 9999,
        original_price: 10999,
        stock: 50,
        description: '最新款iPhone，搭载A17 Pro芯片，钛金属设计',
        detail: '<p>iPhone 15 Pro Max 是目前最强大的iPhone，配备A17 Pro芯片。</p>',
        category_id: 'phone-category',
        is_featured: true,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/iphone-15-pro.jpg'],
        main_image: '/uploads/products/iphone-15-pro.jpg',
        sort_order: 1
      },
      {
        name: 'MacBook Pro 14英寸',
        price: 12999,
        original_price: 14999,
        stock: 30,
        description: '专业级笔记本电脑，M3 Pro芯片， Liquid视网膜XDR显示屏',
        detail: '<p>MacBook Pro 14英寸搭载M3 Pro芯片，适合专业用户。</p>',
        category_id: 'computer-category',
        is_featured: true,
        is_new: true,
        status: 'published',
        images: ['/uploads/products/macbook-pro-14.jpg'],
        main_image: '/uploads/products/macbook-pro-14.jpg',
        sort_order: 2
      },
      {
        name: 'AirPods Pro',
        price: 1899,
        original_price: 1999,
        stock: 100,
        description: '主动降噪无线耳机，通透模式，空间音频',
        detail: '<p>AirPods Pro 提供出色的音质和主动降噪功能。</p>',
        category_id: 'audio-category',
        is_featured: false,
        is_new: true,
        status: 'published',
        images: ['/uploads/products/airpods-pro.jpg'],
        main_image: '/uploads/products/airpods-pro.jpg',
        sort_order: 3
      },
      {
        name: 'Apple Watch Series 9',
        price: 2999,
        original_price: 3199,
        stock: 40,
        description: '智能手表，血氧检测，心电图功能',
        detail: '<p>Apple Watch Series 9 健康监测功能全面升级。</p>',
        category_id: 'watch-category',
        is_featured: true,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/apple-watch-s9.jpg'],
        main_image: '/uploads/products/apple-watch-s9.jpg',
        sort_order: 4
      },
      {
        name: 'iPad Air',
        price: 4399,
        original_price: 4799,
        stock: 25,
        description: '轻薄平板电脑，M1芯片，支持Apple Pencil',
        detail: '<p>iPad Air 轻薄便携，适合学习和创作。</p>',
        category_id: 'tablet-category',
        is_featured: false,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/ipad-air.jpg'],
        main_image: '/uploads/products/ipad-air.jpg',
        sort_order: 5
      },
      {
        name: 'Magic Keyboard',
        price: 999,
        original_price: 1099,
        stock: 60,
        description: '无线键盘，带触控ID，剪刀式结构',
        detail: '<p>Magic Keyboard 提供舒适的打字体验。</p>',
        category_id: 'accessory-category',
        is_featured: false,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/magic-keyboard.jpg'],
        main_image: '/uploads/products/magic-keyboard.jpg',
        sort_order: 6
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 8999,
        original_price: 9999,
        stock: 20,
        description: '安卓旗舰手机，200MP摄像头，S Pen手写笔',
        detail: '<p>Samsung Galaxy S24 Ultra 配备强大的摄像头系统。</p>',
        category_id: 'phone-category',
        is_featured: false,
        is_new: true,
        status: 'published',
        images: ['/uploads/products/samsung-s24-ultra.jpg'],
        main_image: '/uploads/products/samsung-s24-ultra.jpg',
        sort_order: 7
      },
      {
        name: 'Sony WH-1000XM5',
        price: 2399,
        original_price: 2699,
        stock: 35,
        description: '索尼降噪耳机，业界领先的降噪技术',
        detail: '<p>Sony WH-1000XM5 提供卓越的降噪效果。</p>',
        category_id: 'audio-category',
        is_featured: true,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/sony-wh1000xm5.jpg'],
        main_image: '/uploads/products/sony-wh1000xm5.jpg',
        sort_order: 8
      },
      {
        name: 'Dell XPS 13',
        price: 7999,
        original_price: 8999,
        stock: 15,
        description: '轻薄商务笔记本，13.4英寸显示屏',
        detail: '<p>Dell XPS 13 轻薄便携，适合商务人士。</p>',
        category_id: 'computer-category',
        is_featured: false,
        is_new: true,
        status: 'published',
        images: ['/uploads/products/dell-xps13.jpg'],
        main_image: '/uploads/products/dell-xps13.jpg',
        sort_order: 9
      },
      {
        name: '小米13 Ultra',
        price: 5999,
        original_price: 6999,
        stock: 45,
        description: '徕卡影像旗舰，骁龙8 Gen2处理器',
        detail: '<p>小米13 Ultra 配备徕卡专业影像系统。</p>',
        category_id: 'phone-category',
        is_featured: true,
        is_new: false,
        status: 'published',
        images: ['/uploads/products/xiaomi13-ultra.jpg'],
        main_image: '/uploads/products/xiaomi13-ultra.jpg',
        sort_order: 10
      }
    ];

    // 添加商品到数据库
    for (const productData of testProducts) {
      try {
        const product = await Product.create(productData, 'admin_joya');
        console.log(`✅ 添加商品成功: ${product.name}`);
      } catch (error) {
        console.error(`❌ 添加商品失败: ${productData.name}`, error.message);
      }
    }

    console.log('🎉 测试商品数据添加完成！');
    console.log('📊 总共添加了', testProducts.length, '个测试商品');

  } catch (error) {
    console.error('❌ 添加测试商品数据失败:', error.message);
  }
};

// 运行脚本
if (require.main === module) {
  addTestProducts();
}

module.exports = { addTestProducts };

