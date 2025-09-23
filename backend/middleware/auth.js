const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// 生成JWT令牌
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // 检查是否为管理员用户（ID以admin_开头）
    if (decoded.userId && decoded.userId.startsWith('admin_')) {
      // 管理员用户，创建合成用户对象
      const username = decoded.userId.replace('admin_', '');
      req.user = {
        id: decoded.userId,
        nick_name: username,
        role: decoded.role || 'admin',
        is_active: true,
        isAdmin: true
      };
      return next();
    }

    // 检查普通用户是否存在
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: '用户不存在或已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: '认证失败', message: error.message });
  }
};

// 管理员权限检查
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    // 检查是否为合成管理员用户（ID以admin_开头）
    if (req.user.id && req.user.id.startsWith('admin_')) {
      return next();
    }

    const isAdmin = await User.isAdmin(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: '权限检查失败', message: error.message });
  }
};

// 超级管理员权限检查
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: '需要超级管理员权限' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: '权限检查失败', message: error.message });
  }
};

// 可选认证（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      const user = await User.findById(decoded.userId);
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证，忽略错误继续执行
    next();
  }
};

// 微信登录验证中间件
const wechatAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '需要微信授权码' });
    }

    // 这里应该调用微信API获取用户信息
    // 由于需要真实的微信配置，这里使用模拟数据
    const wechatUser = {
      openid: `mock_openid_${Date.now()}`,
      unionid: `mock_unionid_${Date.now()}`,
      nickName: '微信用户',
      avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
      gender: 1,
      city: '深圳',
      province: '广东',
      country: '中国'
    };

    req.wechatUser = wechatUser;
    next();
  } catch (error) {
    return res.status(500).json({ error: '微信登录失败', message: error.message });
  }
};

// 生成游客令牌（用于未登录用户）
const generateGuestToken = () => {
  return generateToken({ 
    userId: 'guest', 
    role: 'guest',
    isGuest: true 
  }, '1h');
};

// 检查是否为游客
const isGuest = (user) => {
  return user && user.id === 'guest';
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  requireAdmin,
  requireSuperAdmin,
  optionalAuth,
  wechatAuth,
  generateGuestToken,
  isGuest,
  JWT_SECRET
};
