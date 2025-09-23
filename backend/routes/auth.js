const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate, wechatAuth, requireAdmin } = require('../middleware/auth');

// 微信登录
router.post('/wechat-login', wechatAuth, async (req, res) => {
  try {
    const { wechatUser } = req;

    // 查找或创建用户
    let user = await User.findByOpenId(wechatUser.openid);
    
    if (!user) {
      // 新用户注册
      user = await User.createFromWechat(wechatUser);
    } else {
      // 更新最后登录时间
      await User.updateLastLogin(user.id);
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      openid: user.openid,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nickName: user.nick_name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        email: user.email,
        role: user.role,
        points: user.points,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '登录失败', 
      message: error.message 
    });
  }
});

// 管理员登录
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '用户名和密码不能为空' 
      });
    }

    // 这里应该是从数据库查询管理员用户
    // 简化处理：使用固定账号
    const adminUsers = {
      'admin': { password: 'admin123', role: 'admin' },
      'superadmin': { password: 'superadmin123', role: 'super_admin' },
      'joya': { password: '123', role: 'admin' }
    };

    const adminUser = adminUsers[username];
    
    if (!adminUser || adminUser.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      });
    }

    // 生成管理员令牌
    const token = generateToken({
      userId: `admin_${username}`,
      role: adminUser.role,
      isAdmin: true
    });

    res.json({
      success: true,
      token,
      user: {
        id: `admin_${username}`,
        nickName: username,
        avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        role: adminUser.role,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '登录失败', 
      message: error.message 
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        nickName: user.nick_name,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        email: user.email,
        role: user.role,
        points: user.points,
        balance: user.balance,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取用户信息失败', 
      message: error.message 
    });
  }
});

// 更新用户信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { nickName, phone, email } = req.body;
    const updates = {};

    if (nickName) updates.nick_name = nickName;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '没有要更新的信息' 
      });
    }

    const updatedUser = await User.update(req.user.id, updates);
    
    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        nickName: updatedUser.nick_name,
        avatarUrl: updatedUser.avatar_url,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        points: updatedUser.points,
        balance: updatedUser.balance
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '更新用户信息失败', 
      message: error.message 
    });
  }
});

// 退出登录（客户端需要清除token）
router.post('/logout', authenticate, (req, res) => {
  res.json({ 
    success: true, 
    message: '退出登录成功' 
  });
});

// 验证令牌有效性
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: '令牌不能为空' 
      });
    }

    const decoded = require('../middleware/auth').verifyToken(token);

    // 检查是否为管理员用户（ID以admin_开头）
    if (decoded.userId && decoded.userId.startsWith('admin_')) {
      // 管理员用户，创建合成用户对象
      const username = decoded.userId.replace('admin_', '');
      return res.json({
        success: true,
        valid: true,
        user: {
          id: decoded.userId,
          nickName: username,
          avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
          role: decoded.role || 'admin'
        }
      });
    }

    // 检查普通用户是否存在
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: '令牌无效'
      });
    }

    res.json({ 
      success: true, 
      valid: true,
      user: {
        id: user.id,
        nickName: user.nick_name,
        avatarUrl: user.avatar_url,
        role: user.role
      }
    });
  } catch (error) {
    res.json({
      success: false,
      valid: false,
      error: '令牌无效'
    });
  }
});

// 管理员获取用户列表
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const result = await User.getUsers(parseInt(page), parseInt(limit), {
      role,
      search
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取用户列表失败', 
      message: error.message 
    });
  }
});

module.exports = router;
