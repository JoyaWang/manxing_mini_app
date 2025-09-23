const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor() {
    this.tableName = 'users';
  }

  // 创建用户表（初始化）
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id VARCHAR(36) PRIMARY KEY,
        openid VARCHAR(128) UNIQUE,
        unionid VARCHAR(128),
        nick_name VARCHAR(100),
        avatar_url TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
        points INT DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
      )
    `;
    await db.query(sql);
  }

  // 通过微信openid查找用户
  async findByOpenId(openid) {
    const sql = `SELECT * FROM ${this.tableName} WHERE openid = ?`;
    const users = await db.query(sql, [openid]);
    return users[0] || null;
  }

  // 通过ID查找用户
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }

  // 创建新用户（微信登录）
  async createFromWechat(wechatUser) {
    const user = {
      id: uuidv4(),
      openid: wechatUser.openid,
      unionid: wechatUser.unionid || null,
      nick_name: wechatUser.nickName,
      avatar_url: wechatUser.avatarUrl,
      phone: wechatUser.phone || null,
      role: 'user',
      points: 100, // 新用户赠送100积分
      balance: 0.00,
      is_active: true,
      last_login: new Date()
    };

    const sql = `INSERT INTO ${this.tableName} SET ?`;
    await db.query(sql, [user]);
    return user;
  }

  // 更新用户信息
  async update(id, updates) {
    const sql = `UPDATE ${this.tableName} SET ? WHERE id = ?`;
    await db.query(sql, [updates, id]);
    return await this.findById(id);
  }

  // 更新最后登录时间
  async updateLastLogin(id) {
    const sql = `UPDATE ${this.tableName} SET last_login = NOW() WHERE id = ?`;
    await db.query(sql, [id]);
  }

  // 检查是否为管理员
  async isAdmin(userId) {
    const user = await this.findById(userId);
    return user && (user.role === 'admin' || user.role === 'super_admin');
  }

  // 获取用户列表（分页）
  async getUsers(page = 1, limit = 20, filters = {}) {
    let whereClause = 'WHERE is_active = true';
    const params = [];

    if (filters.role) {
      whereClause += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.search) {
      whereClause += ' AND (nick_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const offset = (page - 1) * limit;

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;

    // 获取数据
    const dataSql = `
      SELECT id, openid, nick_name, avatar_url, phone, email, role, points, balance, last_login, created_at
      FROM ${this.tableName}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const users = await db.query(dataSql, [...params, limit, offset]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新用户余额
  async updateBalance(userId, amount) {
    const sql = `UPDATE ${this.tableName} SET balance = balance + ? WHERE id = ?`;
    await db.query(sql, [amount, userId]);
    return await this.findById(userId);
  }

  // 更新用户积分
  async updatePoints(userId, points) {
    const sql = `UPDATE ${this.tableName} SET points = points + ? WHERE id = ?`;
    await db.query(sql, [points, userId]);
    return await this.findById(userId);
  }

  // 禁用用户
  async deactivate(userId) {
    const sql = `UPDATE ${this.tableName} SET is_active = false WHERE id = ?`;
    await db.query(sql, [userId]);
  }

  // 删除用户（软删除）
  async delete(userId) {
    const sql = `UPDATE ${this.tableName} SET is_active = false, openid = CONCAT('deleted_', openid) WHERE id = ?`;
    await db.query(sql, [userId]);
  }
}

module.exports = new User();