const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product {
  constructor() {
    this.tableName = 'products';
  }

  // 创建商品表
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        detail LONGTEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        main_image TEXT,
        images JSON,
        category_id VARCHAR(36),
        stock INT DEFAULT 0,
        sales INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_new BOOLEAN DEFAULT false,
        status ENUM('draft', 'published', 'sold_out', 'archived') DEFAULT 'draft',
        skus JSON,
        sort_order INT DEFAULT 0,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category_id),
        INDEX idx_status (status),
        INDEX idx_featured (is_featured),
        INDEX idx_new (is_new),
        INDEX idx_created_at (created_at),
        FULLTEXT INDEX idx_search (name, description)
      )
    `;
    await db.query(sql);
  }

  // 创建商品分类表
  async createCategoryTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        image TEXT,
        parent_id VARCHAR(36),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent (parent_id),
        INDEX idx_active (is_active)
      )
    `;
    await db.query(sql);
  }

  // 创建新商品
  async create(productData, userId) {
    console.log('[BACKEND MODEL PRODUCT CREATE] 开始创建商品, userId:', userId);
    console.log('[BACKEND MODEL PRODUCT CREATE] 接收到的productData:', productData);
    console.log('[BACKEND MODEL PRODUCT CREATE] 重点字段 - main_image:', productData.main_image);
    console.log('[BACKEND MODEL PRODUCT CREATE] 重点字段 - images:', productData.images);
    console.log('[BACKEND MODEL PRODUCT CREATE] images 类型:', typeof productData.images);
    console.log('[BACKEND MODEL PRODUCT CREATE] images 是否数组:', Array.isArray(productData.images));

    const product = {
      id: uuidv4(),
      name: productData.name,
      description: productData.description,
      detail: productData.detail,
      price: parseFloat(productData.price),
      original_price: productData.original_price ? parseFloat(productData.original_price) : null,
      main_image: productData.main_image,
      images: JSON.stringify(productData.images || []),
      category_id: productData.category_id,
      stock: parseInt(productData.stock || 0),
      is_featured: Boolean(productData.is_featured),
      is_new: Boolean(productData.is_new),
      status: productData.status || 'draft',
      skus: JSON.stringify(productData.skus || []),
      sort_order: parseInt(productData.sort_order || 0),
      created_by: userId
    };

    console.log('[BACKEND MODEL PRODUCT CREATE] 准备插入数据库的product对象:', product);
    console.log('[BACKEND MODEL PRODUCT CREATE] 数据库插入SQL:', `INSERT INTO ${this.tableName} SET ?`);

    const sql = `INSERT INTO ${this.tableName} SET ?`;
    const result = await db.query(sql, [product]);
    console.log('[BACKEND MODEL PRODUCT CREATE] 数据库插入结果:', result);

    const createdProduct = await this.findById(product.id);
    console.log('[BACKEND MODEL PRODUCT CREATE] 查询创建后的商品:', createdProduct);
    return createdProduct;
  }

  // 通过ID查找商品
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const products = await db.query(sql, [id]);
    return this.parseProduct(products[0]);
  }

  // 获取商品列表
  async getProducts(filters = {}, page = 1, limit = 20) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.category_id) {
      whereClause += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.is_featured) {
      whereClause += ' AND is_featured = true';
    }

    if (filters.is_new) {
      whereClause += ' AND is_new = true';
    }

    if (filters.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.min_price) {
      whereClause += ' AND price >= ?';
      params.push(parseFloat(filters.min_price));
    }

    if (filters.max_price) {
      whereClause += ' AND price <= ?';
      params.push(parseFloat(filters.max_price));
    }

    const offset = (page - 1) * limit;

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult && countResult[0] ? (countResult[0].total || 0) : 0;

    // 获取数据
    const dataSql = `
      SELECT * FROM ${this.tableName}
      ${whereClause}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    const products = await db.query(dataSql, [...params, limit, offset]);

    // 确保products是数组
    const productArray = Array.isArray(products) ? products : [];

    return {
      products: productArray.map(p => this.parseProduct(p)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新商品
  async update(id, updates, userId) {
    // 构建更新对象
    const updateData = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.detail) updateData.detail = updates.detail;
    if (updates.price) updateData.price = parseFloat(updates.price);
    if (updates.original_price !== undefined) {
      updateData.original_price = updates.original_price ? parseFloat(updates.original_price) : null;
    }
    if (updates.main_image) updateData.main_image = updates.main_image;
    if (updates.images) updateData.images = JSON.stringify(updates.images);
    if (updates.category_id) updateData.category_id = updates.category_id;
    if (updates.stock !== undefined) updateData.stock = parseInt(updates.stock);
    if (updates.is_featured !== undefined) updateData.is_featured = Boolean(updates.is_featured);
    if (updates.is_new !== undefined) updateData.is_new = Boolean(updates.is_new);
    if (updates.status) updateData.status = updates.status;
    if (updates.skus) updateData.skus = JSON.stringify(updates.skus);
    if (updates.sort_order !== undefined) updateData.sort_order = parseInt(updates.sort_order);

    if (Object.keys(updateData).length === 0) {
      return await this.findById(id);
    }

    const sql = `UPDATE ${this.tableName} SET ? WHERE id = ?`;
    await db.query(sql, [updateData, id]);
    return await this.findById(id);
  }

  // 删除商品
  async delete(id) {
    const sql = `UPDATE ${this.tableName} SET status = 'archived' WHERE id = ?`;
    await db.query(sql, [id]);
    return { success: true };
  }

  // 更新商品库存
  async updateStock(id, quantity) {
    const sql = `UPDATE ${this.tableName} SET stock = stock + ? WHERE id = ?`;
    await db.query(sql, [quantity, id]);
    return await this.findById(id);
  }

  // 更新商品销量
  async updateSales(id, quantity) {
    const sql = `UPDATE ${this.tableName} SET sales = sales + ? WHERE id = ?`;
    await db.query(sql, [quantity, id]);
    return await this.findById(id);
  }

  // 解析商品数据（处理JSON字段）
  parseProduct(product) {
    if (!product) return null;

    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      skus: product.skus ? JSON.parse(product.skus) : [],
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      is_featured: Boolean(product.is_featured),
      is_new: Boolean(product.is_new),
      sort_order: parseInt(product.sort_order)
    };
  }

  // 获取分类列表
  async getCategories() {
    const sql = `SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC`;
    return await db.query(sql);
  }

  // 创建分类
  async createCategory(categoryData) {
    const category = {
      id: uuidv4(),
      name: categoryData.name,
      icon: categoryData.icon,
      image: categoryData.image,
      parent_id: categoryData.parent_id || null,
      sort_order: parseInt(categoryData.sort_order || 0),
      is_active: true
    };

    const sql = `INSERT INTO categories SET ?`;
    await db.query(sql, [category]);
    return category;
  }
}

module.exports = new Product();
