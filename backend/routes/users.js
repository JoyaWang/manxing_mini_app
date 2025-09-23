const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// 获取用户个人信息
router.get('/profile', authenticate, async (req, res) => {
  try {
    // 确保数据库表存在
    console.log('[BACKEND USER GET] 确保数据库表存在...');
    await User.createTable();
    console.log('[BACKEND USER GET] 数据库表检查完成');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 移除敏感信息
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新用户个人信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { nick_name, avatar_url, phone, email } = req.body;
    
    const updates = {};
    if (nick_name) updates.nick_name = nick_name;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;

    const updatedUser = await User.update(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 移除敏感信息
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取用户地址列表
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('addresses');
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加用户地址
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    // 如果设置为默认地址，取消其他默认地址
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    
    const newAddress = {
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault: isDefault || false
    };
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新用户地址
router.put('/addresses/:addressId', authenticate, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;
    const addressId = req.params.addressId;
    
    const user = await User.findById(req.user.userId);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: '地址不存在' });
    }
    
    // 如果设置为默认地址，取消其他默认地址
    if (isDefault) {
      user.addresses.forEach(addr => { 
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }
    
    Object.assign(address, {
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault
    });
    
    await user.save();
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除用户地址
router.delete('/addresses/:addressId', authenticate, async (req, res) => {
  try {
    const addressId = req.params.addressId;
    
    const user = await User.findById(req.user.userId);
    user.addresses.pull(addressId);
    await user.save();
    
    res.json({ message: '地址删除成功' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取所有用户（管理员）
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (role) filters.role = role;

    const result = await User.getUsers(parseInt(page), parseInt(limit), filters);
    
    // 移除所有用户的敏感信息
    const safeUsers = result.users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      users: safeUsers,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新用户角色（管理员）
router.patch('/:userId/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: '无效的用户角色' });
    }

    const user = await User.update(req.params.userId, { role });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 移除敏感信息
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 地址管理功能暂时移除，因为User模型中没有addresses字段
// 如果需要地址管理，需要在User模型中添加相关功能

module.exports = router;
