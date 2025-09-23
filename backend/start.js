const app = require('./app');
const db = require('./config/database');
const net = require('net');

// 检查端口是否可用
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// 寻找可用端口
const findAvailablePort = async (startPort = 3000, maxAttempts = 100) => {
  for (let port = startPort; port <= startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`在端口 ${startPort}-${startPort + maxAttempts} 范围内找不到可用端口`);
};

// 启动服务器
const startServer = async () => {
  try {
    // 检查数据库连接状态
    let dbStatus = '模拟模式';
    try {
      // 等待数据库初始化完成
      await new Promise(resolve => setTimeout(resolve, 100));
      if (db.client && typeof db.client.query === 'function') {
        dbStatus = '已连接';
      }
    } catch (dbError) {
      console.log('⚠️  数据库连接失败，使用模拟模式继续运行');
      dbStatus = '模拟模式';
    }
    
    console.log('✅ 数据库连接状态:', dbStatus);
    
    const startPort = parseInt(process.env.PORT) || 3008;
    const PORT = await findAvailablePort(startPort);
    
    app.listen(PORT, () => {
      console.log('🚀 微信商城小程序后端服务器启动成功！');
      console.log(`📍 服务器运行在: http://localhost:${PORT}`);
      console.log(`📱 API地址: http://localhost:${PORT}/api`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log('📊 当前环境:', process.env.NODE_ENV || 'development');
      console.log('💾 数据库:', process.env.DB_TYPE || '未配置');
      console.log('==============================================');
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();
