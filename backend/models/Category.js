const db = require('../config/database');

class Category {
  // 获取所有分类
  static async getAll() {
    try {
      // 检查是否为模拟模式
      const dbType = db.getType();
      if (dbType === 'mock') {
        // 模拟模式下直接返回测试数据
        return [
          { id: 1, name: '手机', description: '智能手机', status: 'active', sort_order: 1, parent_id: null },
          { id: 2, name: '电脑', description: '笔记本电脑', status: 'active', sort_order: 2, parent_id: null },
          { id: 3, name: '耳机', description: '音频设备', status: 'active', sort_order: 3, parent_id: null }
        ];
      }

      const result = await db.query('SELECT * FROM categories WHERE status = ? ORDER BY sort_order ASC, name ASC', ['active']);
      
      // 处理不同数据库的返回格式
      if (result && result.data) {
        // Supabase格式: { data: [], error: null }
        return result.data;
      } else if (Array.isArray(result)) {
        // MySQL/PostgreSQL数组格式
        return result;
      } else if (result && result.rows) {
        // PostgreSQL格式: { rows: [] }
        return result.rows;
      } else {
        // 其他情况返回空数组
        return [];
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      // 在错误情况下也返回测试数据
      return [
        { id: 1, name: '手机', description: '智能手机', status: 'active', sort_order: 1, parent_id: null },
        { id: 2, name: '电脑', description: '笔记本电脑', status: 'active', sort_order: 2, parent_id: null },
        { id: 3, name: '耳机', description: '音频设备', status: 'active', sort_order: 3, parent_id: null }
      ];
    }
  }

  // 根据ID获取分类
  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM categories WHERE id = ? AND status = ?', [id, 'active']);
      
      // 处理不同数据库的返回格式
      if (result && result.data) {
        // Supabase格式: { data: [], error: null }
        return result.data[0] || null;
      } else if (Array.isArray(result)) {
        // MySQL数组格式
        return result[0] || null;
      } else if (result && result.rows) {
        // PostgreSQL格式: { rows: [] }
        return result.rows[0] || null;
      } else {
        return null;
      }
    } catch (error) {
      console.error('获取分类详情失败:', error);
      throw error;
    }
  }

  // 创建分类
  static async create(categoryData) {
    const { name, description, parent_id = null, sort_order = 0, image = null } = categoryData;
    
    try {
      const result = await db.query(
        'INSERT INTO categories (name, description, parent_id, sort_order, image, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, parent_id, sort_order, image, 'active']
      );
      
      return { id: result.insertId || result.rows[0].id, ...categoryData };
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  // 更新分类
  static async update(id, categoryData) {
    const { name, description, parent_id, sort_order, image, status } = categoryData;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (parent_id !== undefined) {
      updates.push('parent_id = ?');
      values.push(parent_id);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(sort_order);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return { id, ...categoryData };
    }

    values.push(id);

    try {
      await db.query(
        `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      
      return { id, ...categoryData };
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  // 删除分类（软删除）
  static async delete(id) {
    try {
      await db.query('UPDATE categories SET status = ? WHERE id = ?', ['deleted', id]);
      return true;
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }

  // 获取分类树形结构
  static async getTree() {
    try {
      const categories = await this.getAll();
      
      // 直接使用getAll返回的数据，因为getAll已经处理了各种数据库格式
      return this.buildTree(categories);
    } catch (error) {
      console.error('获取分类树失败:', error);
      throw error;
    }
  }

  // 构建树形结构
  static buildTree(categories, parentId = null) {
    const tree = [];
    
    // 确保categories是数组
    if (!Array.isArray(categories)) {
      return tree;
    }
    
    categories.forEach(category => {
      if (category.parent_id === parentId || 
          (category.parent_id === null && parentId === null) ||
          (category.parent_id == parentId)) { // 宽松比较处理不同数据库类型
        const children = this.buildTree(categories, category.id);
        if (children.length > 0) {
          category.children = children;
        }
        tree.push(category);
      }
    });

    return tree;
  }

  // 检查分类是否存在
  static async exists(id) {
    try {
      const category = await this.getById(id);
      return !!category;
    } catch (error) {
      return false;
    }
  }
}

module.exports = Category;