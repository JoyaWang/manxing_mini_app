const database = require('./config/database');

const verifySetup = async () => {
  console.log('🔍 验证微信商城小程序后端配置...\n');

  try {
    // 1. 检查环境变量
    console.log('1. 检查环境变量...');
    require('dotenv').config();
    
    const requiredEnvVars = ['DB_TYPE', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.log('❌ 缺少必需的环境变量:', missingEnvVars.join(', '));
      console.log('💡 请复制 .env.example 为 .env 并配置相关参数');
      return false;
    }
    console.log('✅ 环境变量检查通过');

    // 2. 检查数据库连接
    console.log('\n2. 检查数据库连接...');
    try {
      // 等待数据库初始化完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (database.client) {
        console.log('✅ 数据库连接成功');
      } else {
        console.log('❌ 数据库连接失败: 客户端未初始化');
        return false;
      }
    } catch (error) {
      console.log('❌ 数据库连接失败:', error.message);
      console.log('💡 请检查数据库配置是否正确');
      return false;
    }

    // 3. 检查依赖包
    console.log('\n3. 检查依赖包...');
    try {
      require('express');
      require('mongoose');
      require('jsonwebtoken');
      require('@supabase/supabase-js');
      console.log('✅ 所有依赖包加载正常');
    } catch (error) {
      console.log('❌ 依赖包加载失败:', error.message);
      console.log('💡 请运行 npm install 安装依赖');
      return false;
    }

    // 4. 检查上传目录
    console.log('\n4. 检查文件上传目录...');
    const fs = require('fs');
    const uploadDirs = ['uploads', 'uploads/products', 'uploads/general'];
    
    for (const dir of uploadDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 创建目录: ${dir}`);
      }
    }
    console.log('✅ 文件上传目录准备就绪');

    // 5. 检查路由文件
    console.log('\n5. 检查路由文件...');
    const routes = [
      './routes/auth',
      './routes/products', 
      './routes/orders',
      './routes/users',
      './routes/upload',
      './routes/admin'
    ];
    
    for (const route of routes) {
      try {
        require(route);
      } catch (error) {
        console.log(`❌ 路由文件 ${route} 加载失败:`, error.message);
        return false;
      }
    }
    console.log('✅ 所有路由文件加载正常');

    console.log('\n🎉 所有配置验证通过！');
    console.log('\n📋 下一步操作:');
    console.log('   1. 配置 .env 文件中的数据库连接信息');
    console.log('   2. 运行 npm run init-db 初始化示例数据');
    console.log('   3. 运行 npm start 启动服务器');
    console.log('   4. 在微信开发者工具中导入前端项目');
    
    return true;

  } catch (error) {
    console.log('❌ 验证过程中出现错误:', error.message);
    return false;
  }
};

// 运行验证
if (require.main === module) {
  verifySetup().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifySetup };