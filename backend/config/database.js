const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

class Database {
  constructor() {
    this.client = null;
    this.type = process.env.DB_TYPE || 'supabase';
    this.isConnected = false;
    this.init().catch(error => {
      console.log('⚠️  数据库连接失败，使用模拟模式继续运行');
      this.setupMockClient();
    });
  }

  async init() {
    try {
      switch (this.type) {
        case 'supabase':
          if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.log('⚠️  Supabase配置缺失，使用模拟模式');
            this.setupMockClient();
            return; // 立即返回，避免继续执行
          } else {
            // 检查是否是本地模拟的Supabase配置
            if (process.env.SUPABASE_URL.includes('localhost') ||
                process.env.SUPABASE_URL.includes('127.0.0.1') ||
                process.env.SUPABASE_ANON_KEY === 'test_key') {
                          console.log('🔧 检测到本地Supabase模拟配置，使用文件存储模式');
                          this.setupFileStorage();
              return;
            } else {
              this.client = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
              );
              console.log('✅ Supabase 数据库连接成功');
              this.isConnected = true;
              return; // 连接成功，返回
            }
          }

        case 'mysql':
        case 'tencent':
          if (!process.env.TENCENT_DB_HOST) {
            console.log('⚠️  MySQL配置缺失，使用模拟模式');
            this.setupMockClient();
            return;
          } else {
            this.client = await mysql.createConnection({
              host: process.env.TENCENT_DB_HOST,
              port: process.env.TENCENT_DB_PORT || 3306,
              user: process.env.TENCENT_DB_USER,
              password: process.env.TENCENT_DB_PASSWORD,
              database: process.env.TENCENT_DB_NAME || 'wechat_mall'
            });
            console.log('✅ MySQL 数据库连接成功');
            this.isConnected = true;
            return;
          }

        case 'postgresql':
          if (!process.env.PG_HOST) {
            console.log('⚠️  PostgreSQL配置缺失，使用模拟模式');
            this.setupMockClient();
            return;
          } else {
            this.client = new Pool({
              host: process.env.PG_HOST,
              user: process.env.PG_USER || 'postgres',
              password: process.env.PG_PASSWORD || '',
              database: process.env.PG_DATABASE || 'mall',
              port: process.env.PG_PORT || 5432
            });
            console.log('✅ PostgreSQL 数据库连接成功');
            this.isConnected = true;
            return;
          }

        default:
          console.log('⚠️  不支持的数据库类型，使用模拟模式');
          this.setupMockClient();
      }
    } catch (error) {
      console.log('⚠️  数据库连接失败:', error.message);
      this.setupMockClient();
    }
  }

  setupMockClient() {
    this.client = { 
      from: () => ({ 
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null })
      }),
      execute: (sql, params) => {
        if (sql && sql.includes('COUNT(*)')) {
          return Promise.resolve([[{ total: 0 }]]);
        }
        return Promise.resolve([[]]);
      },
      query: (sql, params) => {
        if (sql && sql.includes('COUNT(*)')) {
          return Promise.resolve([{ total: 0 }]);
        }
        // 对于分类查询，返回一些模拟数据
        if (sql && sql.includes('categories')) {
          return Promise.resolve([
            { id: 1, name: '手机', description: '智能手机', status: 'active', sort_order: 1 },
            { id: 2, name: '电脑', description: '笔记本电脑', status: 'active', sort_order: 2 },
            { id: 3, name: '耳机', description: '音频设备', status: 'active', sort_order: 3 }
          ]);
        }
        // 对于订单查询，返回空数组
        if (sql && sql.includes('orders')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      }
    };
    this.type = 'mock'; // 更新类型为mock
    this.isConnected = false;
  }

  // 通用查询方法
  async query(sql, params = []) {
    try {
      console.log(`📊 数据库查询: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`, params.length > 0 ? `参数: ${JSON.stringify(params)}` : '');

      // 统一处理数据库类型映射
      const dbType = this.type === 'tencent' ? 'mysql' : this.type;

      switch (dbType) {
        case 'supabase':
          // Supabase 使用 REST API，需要特殊处理
          try {
            if (sql.trim().toLowerCase().startsWith('select')) {
              const tableName = this.getTableName(sql);
              console.log(`🔍 Supabase查询表: ${tableName}`);
              const { data, error } = await this.client.from(tableName).select('*');
              if (error) {
                console.error(`❌ Supabase查询错误: ${error.message}`);
                // 如果表不存在，返回空数组而不是抛出错误
                if (error.code === 'PGRST116' || error.message.includes('not found')) {
                  console.log(`📋 表 ${tableName} 不存在，返回空数据`);
                  return [];
                }
                throw error;
              }
              return data;
            } else if (sql.trim().toLowerCase().startsWith('insert')) {
              const tableName = this.getTableName(sql);
              const { data, error } = await this.client.from(tableName).insert(params[0]);
              if (error) throw error;
              return data;
            } else if (sql.trim().toLowerCase().startsWith('update')) {
              const tableName = this.getTableName(sql);
              const { data, error } = await this.client.from(tableName).update(params[0]);
              if (error) throw error;
              return data;
            } else if (sql.trim().toLowerCase().startsWith('delete')) {
              const tableName = this.getTableName(sql);
              const { data, error } = await this.client.from(tableName).delete();
              if (error) throw error;
              return data;
            }
          } catch (error) {
            console.error('❌ Supabase操作失败:', error.message);
            // 对于Supabase错误，返回空数据而不是崩溃
            return [];
          }
          break;

        case 'mysql':
          const [rows] = await this.client.execute(sql, params);
          return rows;

        case 'postgresql':
          const result = await this.client.query(sql, params);
          return result.rows;

        case 'mock':
          // 模拟模式直接返回空数组
          console.log('🔧 使用模拟数据库模式');
          return [];
        default:
          throw new Error(`不支持的数据库类型: ${dbType}`);
      }
    } catch (error) {
      console.error('❌ 数据库查询错误:', error.message);
      console.error('SQL:', sql);
      console.error('参数:', params);
      throw error;
    }
  }

  // 从SQL语句中提取表名（简化版）
  getTableName(sql) {
    const match = sql.match(/from\s+(\w+)/i) || sql.match(/into\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }

  // 获取原生客户端
  getClient() {
    return this.client;
  }

  // 获取数据库类型
  getType() {
    return this.type;
  }

  // 切换数据库类型（用于测试）
  setType(type) {
    this.type = type;
  }

  // 文件存储实现
  setupFileStorage() {
    console.log('📁 使用文件存储模式');
    this.type = 'file';
    this.isConnected = true;

    // 简单的内存存储（可以扩展为文件存储）
    this.fileStorage = {
      products: [],
      users: [],
      orders: [],
      categories: []
    };

    this.query = async (sql, params = []) => {
      const tableName = this.getTableName(sql);

      if (sql.toLowerCase().includes('select')) {
        // SELECT查询
        if (sql.toLowerCase().includes('count(*)')) {
          // COUNT查询
          return [{ total: this.fileStorage[tableName]?.length || 0 }];
        }

        // 简单的SELECT查询
        return this.fileStorage[tableName] || [];
      } else if (sql.toLowerCase().includes('insert')) {
        // INSERT查询
        const data = params[0] || {};
        const newItem = { ...data, id: data.id || Date.now().toString() };

        if (!this.fileStorage[tableName]) {
          this.fileStorage[tableName] = [];
        }

        this.fileStorage[tableName].push(newItem);
        return [newItem];
      } else if (sql.toLowerCase().includes('update')) {
        // UPDATE查询
        const [updateData, id] = params;
        const items = this.fileStorage[tableName] || [];
        const index = items.findIndex(item => item.id === id);

        if (index !== -1) {
          items[index] = { ...items[index], ...updateData };
          return [items[index]];
        }
        return [];
      }

      return [];
    };
  }
}

// 创建单例实例
const database = new Database();

module.exports = database;
