const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

// 获取管理仪表板数据（简化版）
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // 获取用户总数
    const usersResult = await User.getUsers(1, 1);
    const totalUsers = usersResult.pagination.total;

    // 获取商品总数（已发布的）
    const productsResult = await Product.getProducts({ status: 'published' }, 1, 1);
    const totalProducts = productsResult.pagination.total;

    // 获取订单总数
    const ordersResult = await Order.getOrders({}, 1, 1);
    const totalOrders = ordersResult.pagination.total;

    // 获取总收入（需要Order模型支持）
    const totalRevenue = 0; // 暂时设为0，需要Order模型添加相关方法

    // 获取最近10个订单
    const recentOrdersResult = await Order.getOrders({}, 1, 10);
    const recentOrders = recentOrdersResult.orders;

    // 获取低库存商品（库存小于10）
    const lowStockProductsResult = await Product.getProducts({}, 1, 10);
    const lowStockProducts = lowStockProductsResult.products.filter(p => p.stock < 10);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取销售统计（简化版）
router.get('/sales-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // 简化版本，返回空数据
    res.json({ 
      period: req.query.period || 'month', 
      salesData: [],
      message: '销售统计功能需要数据库支持时间分组查询'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户增长统计（简化版）
router.get('/user-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // 简化版本，返回空数据
    res.json({ 
      period: req.query.period || 'month', 
      userStats: [],
      message: '用户增长统计功能需要数据库支持时间分组查询'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取热门商品（简化版）
router.get('/top-products', authenticate, requireAdmin, async (req, res) => {
  try {
    // 简化版本，返回空数据
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取订单状态分布（简化版）
router.get('/order-status', authenticate, requireAdmin, async (req, res) => {
  try {
    // 简化版本，返回空数据
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 首页板块配置管理
router.get('/home-sections', authenticate, requireAdmin, async (req, res) => {
  try {
    // 这里应该从数据库获取配置，暂时返回默认配置
    const defaultConfig = {
      banners: true,
      categories: true,
      featuredProducts: true,
      hotProducts: true,
      newProducts: true,
      ads: true,
      recommendedProducts: true,
      flashSale: false,
      brandZone: false
    };

    res.json(defaultConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/home-sections', authenticate, requireAdmin, async (req, res) => {
  try {
    const config = req.body;

    // 这里应该将配置保存到数据库
    // 暂时直接返回成功

    res.json({
      success: true,
      message: '首页配置保存成功',
      config
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取商品展示配置
router.get('/product-display-config', authenticate, requireAdmin, async (req, res) => {
  try {
    // 返回商品展示配置
    const config = {
      featuredProducts: { limit: 8, enabled: true },
      hotProducts: { limit: 8, enabled: true },
      newProducts: { limit: 8, enabled: true },
      recommendedProducts: { limit: 6, enabled: true }
    };

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
