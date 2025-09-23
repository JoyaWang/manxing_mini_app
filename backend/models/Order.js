const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
  constructor() {
    this.tableName = 'orders';
  }

  // 创建订单表
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id VARCHAR(36) PRIMARY KEY,
        order_no VARCHAR(20) UNIQUE NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        actual_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
        payment_method ENUM('wechat', 'alipay', 'balance'),
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_time TIMESTAMP NULL,
        shipping_address JSON,
        items JSON NOT NULL,
        remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_order_no (order_no),
        INDEX idx_created_at (created_at)
      )
    `;
    await db.query(sql);
  }

  // 生成订单号
  generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `O${year}${month}${day}${random}`;
  }

  // 创建订单
  async create(orderData, userId) {
    const order = {
      id: uuidv4(),
      order_no: this.generateOrderNo(),
      user_id: userId,
      total_amount: parseFloat(orderData.total_amount),
      actual_amount: parseFloat(orderData.actual_amount || orderData.total_amount),
      status: 'pending',
      payment_method: orderData.payment_method,
      payment_status: 'pending',
      shipping_address: JSON.stringify(orderData.shipping_address),
      items: JSON.stringify(orderData.items),
      remark: orderData.remark || null
    };

    const sql = `INSERT INTO ${this.tableName} SET ?`;
    await db.query(sql, [order]);
    return await this.findById(order.id);
  }

  // 通过ID查找订单
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const orders = await db.query(sql, [id]);
    return this.parseOrder(orders[0]);
  }

  // 通过订单号查找订单
  async findByOrderNo(orderNo) {
    const sql = `SELECT * FROM ${this.tableName} WHERE order_no = ?`;
    const orders = await db.query(sql, [orderNo]);
    return this.parseOrder(orders[0]);
  }

  // 获取用户订单列表
  async getUserOrders(userId, filters = {}, page = 1, limit = 10) {
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.payment_status) {
      whereClause += ' AND payment_status = ?';
      params.push(filters.payment_status);
    }

    const offset = (page - 1) * limit;

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;

    // 获取数据
    const dataSql = `
      SELECT * FROM ${this.tableName}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const orders = await db.query(dataSql, [...params, limit, offset]);

    return {
      orders: orders.map(o => this.parseOrder(o)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 获取所有订单列表（管理员）
  async getAllOrders(filters = {}, page = 1, limit = 20) {
    try {
      console.log('📊 开始查询所有订单:', { filters, page, limit });

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.payment_status) {
        whereClause += ' AND payment_status = ?';
        params.push(filters.payment_status);
      }

      if (filters.user_id) {
        whereClause += ' AND user_id = ?';
        params.push(filters.user_id);
      }

      if (filters.search) {
        whereClause += ' AND (order_no LIKE ? OR user_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      const offset = (page - 1) * limit;

      // 获取总数
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      console.log('🔢 执行COUNT查询:', countSql, params);
      const countResult = await db.query(countSql, params);
      console.log('📈 COUNT查询结果:', countResult);

      // 处理不同的数据库返回格式
      let total = 0;
      if (Array.isArray(countResult) && countResult.length > 0) {
        // MySQL/PostgreSQL 格式
        total = countResult[0]?.total || 0;
      } else if (countResult && typeof countResult === 'object') {
        // Supabase 或其他格式
        total = countResult.total || 0;
      } else if (typeof countResult === 'number') {
        // 直接返回数字
        total = countResult;
      }

      // 获取数据
      const dataSql = `
        SELECT o.*, u.nick_name, u.avatar_url
        FROM ${this.tableName} o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;
      console.log('📋 执行数据查询:', dataSql, [...params, limit, offset]);
      const orders = await db.query(dataSql, [...params, limit, offset]);
      console.log('✅ 数据查询结果:', orders.length, '条订单');

      return {
        orders: orders.map(o => this.parseOrder(o)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ 获取所有订单失败:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // 更新订单状态
  async updateStatus(id, status) {
    const sql = `UPDATE ${this.tableName} SET status = ?, updated_at = NOW() WHERE id = ?`;
    await db.query(sql, [status, id]);
    return await this.findById(id);
  }

  // 更新支付状态
  async updatePaymentStatus(id, paymentStatus, paymentTime = null) {
    const updates = {
      payment_status: paymentStatus,
      updated_at: new Date()
    };

    if (paymentTime) {
      updates.payment_time = paymentTime;
    }

    if (paymentStatus === 'paid') {
      updates.status = 'paid';
    }

    const sql = `UPDATE ${this.tableName} SET ? WHERE id = ?`;
    await db.query(sql, [updates, id]);
    return await this.findById(id);
  }

  // 取消订单
  async cancelOrder(id) {
    const sql = `UPDATE ${this.tableName} SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND status = 'pending'`;
    await db.query(sql, [id]);
    return await this.findById(id);
  }

  // 删除订单（软删除）
  async delete(id) {
    const sql = `UPDATE ${this.tableName} SET status = 'cancelled', order_no = CONCAT('deleted_', order_no) WHERE id = ?`;
    await db.query(sql, [id]);
    return { success: true };
  }

  // 获取订单统计
  async getOrderStats(userId = null) {
    let whereClause = '';
    const params = [];

    if (userId) {
      whereClause = 'WHERE user_id = ?';
      params.push(userId);
    }

    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(total_amount) as total_amount
      FROM ${this.tableName}
      ${whereClause}
    `;

    const stats = await db.query(sql, params);
    return stats[0];
  }

  // 解析订单数据（处理JSON字段）
  parseOrder(order) {
    if (!order) return null;

    return {
      ...order,
      total_amount: parseFloat(order.total_amount),
      actual_amount: parseFloat(order.actual_amount),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : {},
      items: order.items ? JSON.parse(order.items) : [],
      created_at: order.created_at,
      updated_at: order.updated_at,
      payment_time: order.payment_time
    };
  }
}

module.exports = new Order();
