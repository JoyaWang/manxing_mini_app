const express = require('express');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// 创建订单
router.post('/', authenticate, async (req, res) => {
  try {
    // 确保数据库表存在
    console.log('[BACKEND ORDER CREATE] 确保数据库表存在...');
    await Order.createTable();
    console.log('[BACKEND ORDER CREATE] 数据库表检查完成');
    // 确保数据库表存在
    console.log('[BACKEND ORDER CREATE] 确保数据库表存在...');
    await Order.createTable();
    console.log('[BACKEND ORDER CREATE] 数据库表检查完成');
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // 验证商品库存
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `商品 ${item.productId} 不存在` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `商品 ${product.name} 库存不足` });
      }
    }

    const orderData = {
      items,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      total_amount: parseFloat(totalAmount),
      actual_amount: parseFloat(totalAmount)
    };

    const savedOrder = await Order.create(orderData, req.user.userId);

    // 减少商品库存
    for (const item of items) {
      await Product.updateStock(item.productId, -item.quantity);
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取用户订单列表
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    // 确保数据库表存在
    console.log('[BACKEND ORDER GET] 确保数据库表存在...');
    await Order.createTable();
    console.log('[BACKEND ORDER GET] 数据库表检查完成');
    const { page = 1, limit = 10, status } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const result = await Order.getUserOrders(req.user.userId, filters, parseInt(page), parseInt(limit));

    res.json({
      orders: result.orders,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个订单详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查订单是否属于当前用户
    if (order.user_id !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: '无权访问此订单' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新订单状态（支付成功、发货等）
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 只有管理员可以更新订单状态
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, status);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 取消订单
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查订单是否属于当前用户
    if (order.user_id !== req.user.userId) {
      return res.status(403).json({ message: '无权取消此订单' });
    }

    // 只能取消待支付或待发货的订单
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: '当前状态无法取消订单' });
    }

    const updatedOrder = await Order.cancelOrder(req.params.id);

    // 恢复商品库存
    for (const item of order.items) {
      await Product.updateStock(item.productId, item.quantity);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取所有订单（管理员）
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📋 获取订单列表请求:', {
      user: req.user,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    if (!req.user.isAdmin) {
      console.log('🚫 权限不足: 需要管理员权限');
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const { page = 1, limit = 10, status, user_id } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (user_id) filters.user_id = user_id;

    console.log('🔍 查询参数:', { filters, page, limit });

    const result = await Order.getAllOrders(filters, parseInt(page), parseInt(limit));

    console.log('✅ 订单查询成功:', {
      orderCount: result.orders.length,
      total: result.pagination.total,
      totalPages: result.pagination.pages
    });

    res.json({
      orders: result.orders,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      total: result.pagination.total
    });
  } catch (error) {
    console.error('❌ 获取订单列表错误:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      message: '获取订单列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '内部服务器错误'
    });
  }
});

module.exports = router;
