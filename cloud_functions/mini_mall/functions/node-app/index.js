const cloud = require('wx-server-sdk');
const bcrypt = require('bcryptjs');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 集合初始化函数
async function ensureCollection(collectionName) {
  try {
    await db.collection(collectionName).limit(1).get();
    console.log(`集合 ${collectionName} 已存在`);
    return true;
  } catch (error) {
    if (error.errCode === -502005) {
      console.log(`集合 ${collectionName} 不存在，尝试初始化...`);
      try {
        const tempDoc = await db.collection(collectionName).add({
          data: {
            _temp_init: true,
            created_at: new Date()
          }
        });
        await db.collection(collectionName).doc(tempDoc._id).remove();
        console.log(`集合 ${collectionName} 初始化成功`);
        return true;
      } catch (initError) {
        console.error(`集合 ${collectionName} 初始化失败:`, initError);
        return false;
      }
    } else {
      console.error(`检查集合 ${collectionName} 时出错:`, error);
      return false;
    }
  }
}

// 云函数主入口
exports.main = async (event, context) => {
  console.log('云函数被调用:', event);

  const { $url: path, method = 'GET', body, query } = event;

  console.log('Received path:', path, 'method:', method, 'body keys:', Object.keys(body || {}));

  try {
    // 初始化集合
    await ensureCollection('products');
    await ensureCollection('categories');
    await ensureCollection('banners');
    await ensureCollection('ads');
    await ensureCollection('carts');
    await ensureCollection('admins');
    await ensureCollection('users');
    await ensureCollection('orders');

    // Admin login endpoint (POST /admin/login)
    if (path === '/admin/login' && method === 'POST') {
      try {
        const { username, password } = body || {};

        if (!username || !password) {
          return { success: false, error: '用户名和密码不能为空' };
        }

        const adminResult = await db.collection('admins').where({ username }).get();

        if (adminResult.data.length === 0) {
          return { success: false, error: '用户不存在' };
        }

        const admin = adminResult.data[0];

        const isPasswordValid = bcrypt.compareSync(password, admin.password);

        if (!isPasswordValid) {
          return { success: false, error: '密码错误' };
        }

        // Generate admin token
        const token = `admin-token-${admin._id}-${Date.now()}`;

        return {
          success: true,
          message: '管理员登录成功',
          admin_id: admin._id,
          token,
          admin: {
            id: admin._id,
            username: admin.username,
            role: admin.role
          }
        };
      } catch (error) {
        console.error('管理员登录错误:', error);
        return { success: false, error: '登录失败' };
      }
    }

    // User login endpoint (POST /user/login)
    if (path === '/user/login' && method === 'POST') {
      try {
        const { code, nickname, avatarUrl } = body || {};

        if (!code) {
          return { success: false, error: '登录码不能为空' };
        }

        // For development/testing, use fixed openid (replace with proper code2session in production)
        const openid = `test_openid_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

        // 查找或创建用户
        let userResult = await db.collection('users').where({ openid }).get();

        let user;
        if (userResult.data.length === 0) {
          // 创建新用户
          const newUserResult = await db.collection('users').add({
            data: {
              openid,
              nickname: nickname || '用户',
              avatar_url: avatarUrl || '',
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          user = {
            id: newUserResult._id,
            openid,
            nickname: nickname || '用户',
            avatar_url: avatarUrl || ''
          };
        } else {
          // 更新现有用户
          user = userResult.data[0];
          user.id = user._id;

          await db.collection('users').doc(user.id).update({
            data: {
              nickname: nickname || user.nickname,
              avatar_url: avatarUrl || user.avatar_url,
              updated_at: new Date()
            }
          });
        }

        // 生成token
        const token = `user-token-${user.id}-${Date.now()}`;

        return {
          success: true,
          message: '登录成功',
          user_id: user.id,
          token,
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url
          }
        };
      } catch (error) {
        console.error('用户登录错误:', error);
        return { success: false, error: '登录失败' };
      }
    }

    // 获取产品列表 (GET /products)
    if (path === '/products' && method === 'GET') {
      try {
        await ensureCollection('products');

        const { page = 1, limit = 10, category_id, search, status } = query || {};

        let whereCondition = {};
        if (category_id) whereCondition.category_id = category_id;
        if (search) whereCondition.name = new RegExp(search, 'i');
        if (status) whereCondition.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 获取总数
        const totalResult = await db.collection('products')
          .where(whereCondition)
          .count();

        // 获取数据
        const dataResult = await db.collection('products')
          .where(whereCondition)
          .skip(skip)
          .limit(parseInt(limit))
          .orderBy('created_at', 'desc')
          .get();

        return {
          success: true,
          products: dataResult.data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult.total,
            pages: Math.ceil(totalResult.total / parseInt(limit))
          }
        };
      } catch (error) {
        console.error('获取产品列表错误:', error);
        if (error.errCode === -502005) {
          return { success: false, error: '数据库集合不存在，请先初始化数据库' };
        }
        return { success: false, error: '获取产品列表失败' };
      }
    }

    // 创建产品 (POST /products)
    if (path === '/products' && method === 'POST') {
      try {
        await ensureCollection('products');
        const productData = body || {};

        if (!productData.name || !productData.price || !productData.stock) {
          return { success: false, error: '产品名称、价格和库存不能为空' };
        }

        // 验证SKU数组
        let validatedSkus = [];
        if (productData.skus && Array.isArray(productData.skus)) {
          validatedSkus = productData.skus.map(sku => ({
            name: sku.name || '',
            price: parseFloat(sku.price) || 0,
            stock: parseInt(sku.stock) || 0,
            id: sku.id || Date.now().toString() + Math.random().toString(36).substr(2)
          })).filter(sku => sku.name && sku.price > 0 && sku.stock >= 0);
        }

        const result = await db.collection('products').add({
          data: {
            ...productData,
            skus: validatedSkus,
            status: productData.status || 'draft',
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        return {
          success: true,
          message: '产品创建成功',
          product: { id: result._id, ...productData, skus: validatedSkus }
        };
      } catch (error) {
        console.error('创建产品错误:', error);
        return { success: false, error: '创建产品失败' };
      }
    }

    // 获取单个产品 (GET /products/{id})
    if (path.startsWith('/products/') && method === 'GET' && path.split('/').length === 3) {
      try {
        await ensureCollection('products');
        const productId = path.split('/')[2];
        const result = await db.collection('products').doc(productId).get();

        if (!result.data) {
          return { success: false, error: '产品不存在' };
        }

        return { success: true, product: result.data };
      } catch (error) {
        console.error('获取产品详情错误:', error);
        return { success: false, error: '获取产品详情失败' };
      }
    }

    // 更新产品 (PUT /products/{id})
    if (path.startsWith('/products/') && method === 'PUT' && path.split('/').length === 3) {
      try {
        await ensureCollection('products');
        const productId = path.split('/')[2];
        const productData = body || {};

        // 验证SKU数组
        let validatedSkus = [];
        if (productData.skus && Array.isArray(productData.skus)) {
          validatedSkus = productData.skus.map(sku => ({
            name: sku.name || '',
            price: parseFloat(sku.price) || 0,
            stock: parseInt(sku.stock) || 0,
            id: sku.id || Date.now().toString() + Math.random().toString(36).substr(2)
          })).filter(sku => sku.name && sku.price > 0 && sku.stock >= 0);
        }

        const result = await db.collection('products').doc(productId).update({
          data: {
            ...productData,
            skus: validatedSkus,
            updated_at: new Date()
          }
        });

        if (result.stats.updated === 0) {
          return { success: false, error: '产品更新失败' };
        }

        return { success: true, message: '产品更新成功' };
      } catch (error) {
        console.error('更新产品错误:', error);
        return { success: false, error: '产品更新失败' };
      }
    }

    // 删除产品 (DELETE /products/{id})
    if (path.startsWith('/products/') && method === 'DELETE' && path.split('/').length === 3) {
      try {
        await ensureCollection('products');
        const productId = path.split('/')[2];
        await db.collection('products').doc(productId).remove();

        return { success: true, message: '产品删除成功' };
      } catch (error) {
        console.error('删除产品错误:', error);
        return { success: false, error: '产品删除失败' };
      }
    }

    // 更新产品状态 (PATCH /products/{id})
    if (path.startsWith('/products/') && method === 'PATCH' && path.split('/').length === 3) {
      try {
        await ensureCollection('products');
        const productId = path.split('/')[2];
        const { status } = body || {};

        if (!status) {
          return { success: false, error: '状态不能为空' };
        }

        const result = await db.collection('products').doc(productId).update({
          data: {
            status,
            updated_at: new Date()
          }
        });

        if (result.stats.updated === 0) {
          return { success: false, error: '产品状态更新失败' };
        }

        return { success: true, message: '产品状态更新成功' };
      } catch (error) {
        console.error('更新产品状态错误:', error);
        return { success: false, error: '更新产品状态失败' };
      }
    }

    // 分类相关端点
    // 获取分类列表 (GET /categories)
    if (path === '/categories' && method === 'GET') {
      try {
        await ensureCollection('categories');
        const result = await db.collection('categories').orderBy('sort_order', 'asc').get();
        return { success: true, categories: result.data };
      } catch (error) {
        console.error('获取分类列表错误:', error);
        return { success: false, error: '获取分类列表失败' };
      }
    }

    // 创建分类 (POST /categories)
    if (path === '/categories' && method === 'POST') {
      try {
        await ensureCollection('categories');
        const categoryData = body || {};
        const result = await db.collection('categories').add({
          data: {
            ...categoryData,
            sort_order: categoryData.sort_order || 0,
            created_at: new Date()
          }
        });
        return { success: true, message: '分类创建成功', category: { id: result._id, ...categoryData } };
      } catch (error) {
        console.error('创建分类错误:', error);
        return { success: false, error: '创建分类失败' };
      }
    }

    // 更新分类 (PUT /categories/{id})
    if (path.startsWith('/categories/') && method === 'PUT' && path.split('/').length === 3) {
      try {
        await ensureCollection('categories');
        const categoryId = path.split('/')[2];
        const categoryData = body || {};
        await db.collection('categories').doc(categoryId).update({
          data: {
            ...categoryData,
            updated_at: new Date()
          }
        });
        return { success: true, message: '分类更新成功' };
      } catch (error) {
        console.error('更新分类错误:', error);
        return { success: false, error: '更新分类失败' };
      }
    }

    // 删除分类 (DELETE /categories/{id})
    if (path.startsWith('/categories/') && method === 'DELETE' && path.split('/').length === 3) {
      try {
        await ensureCollection('categories');
        const categoryId = path.split('/')[2];
        await db.collection('categories').doc(categoryId).remove();
        return { success: true, message: '分类删除成功' };
      } catch (error) {
        console.error('删除分类错误:', error);
        return { success: false, error: '分类删除失败' };
      }
    }

    // 轮播图相关端点
    // 获取轮播图 (GET /banners)
    if (path === '/banners' && method === 'GET') {
      try {
        await ensureCollection('banners');
        const result = await db.collection('banners').orderBy('sort_order', 'asc').get();
        return { success: true, banners: result.data };
      } catch (error) {
        console.error('获取轮播图错误:', error);
        return { success: false, error: '获取轮播图失败' };
      }
    }

    // 更新轮播图 (PUT /banners)
    if (path === '/banners' && method === 'PUT') {
      try {
        await ensureCollection('banners');
        const bannersData = body || [];
        // 清空现有轮播图
        await db.collection('banners').remove();
        // 添加新轮播图
        for (const banner of bannersData) {
          await db.collection('banners').add({
            data: {
              ...banner,
              sort_order: banner.sort_order || 0,
              updated_at: new Date()
            }
          });
        }
        return { success: true, message: '轮播图更新成功' };
      } catch (error) {
        console.error('更新轮播图错误:', error);
        return { success: false, error: '更新轮播图失败' };
      }
    }

    // 广告位相关端点
    // 获取广告位 (GET /ads)
    if (path === '/ads' && method === 'GET') {
      try {
        await ensureCollection('ads');
        const result = await db.collection('ads').orderBy('sort_order', 'asc').get();
        return { success: true, ads: result.data };
      } catch (error) {
        console.error('获取广告位错误:', error);
        return { success: false, error: '获取广告位失败' };
      }
    }

    // 更新广告位 (PUT /ads)
    if (path === '/ads' && method === 'PUT') {
      try {
        await ensureCollection('ads');
        const adsData = body || [];
        await db.collection('ads').remove();
        for (const ad of adsData) {
          await db.collection('ads').add({
            data: {
              ...ad,
              sort_order: ad.sort_order || 0,
              updated_at: new Date()
            }
          });
        }
        return { success: true, message: '广告位更新成功' };
      } catch (error) {
        console.error('更新广告位错误:', error);
        return { success: false, error: '更新广告位失败' };
      }
    }

    // 购物车相关端点
    // 获取购物车 (GET /cart)
    if (path === '/cart' && method === 'GET') {
      try {
        await ensureCollection('carts');
        const { userId } = body || query || {};
        if (!userId) {
          return { success: false, error: '用户ID不能为空' };
        }
        const result = await db.collection('carts').where({ user_id: userId }).orderBy('created_at', 'desc').get();
        return { success: true, items: result.data };
      } catch (error) {
        console.error('获取购物车错误:', error);
        return { success: false, error: '获取购物车失败' };
      }
    }

    // 添加到购物车 (POST /cart/add)
    if (path === '/cart/add' && method === 'POST') {
      try {
        await ensureCollection('carts');
        const { user_id, product_id, quantity = 1, sku_id } = body || {};
        if (!user_id || !product_id) {
          return { success: false, error: '用户ID和产品ID不能为空' };
        }
        // 检查是否已存在
        const existing = await db.collection('carts').where({ user_id, product_id }).get();
        if (existing.data.length > 0) {
          await db.collection('carts').doc(existing.data[0]._id).update({
            data: { quantity: db.command.inc(quantity) }
          });
        } else {
          await db.collection('carts').add({
            data: { user_id, product_id, quantity, sku_id, created_at: new Date() }
          });
        }
        return { success: true, message: '添加购物车成功' };
      } catch (error) {
        console.error('添加购物车错误:', error);
        return { success: false, error: '添加购物车失败' };
      }
    }

    // 更新购物车项 (PUT /cart/{id})
    if (path.startsWith('/cart/') && method === 'PUT' && path.split('/').length === 2) {
      try {
        await ensureCollection('carts');
        const cartId = path.split('/')[1];
        const { quantity } = body || {};
        if (!quantity) {
          return { success: false, error: '数量不能为空' };
        }
        await db.collection('carts').doc(cartId).update({
          data: { quantity, updated_at: new Date() }
        });
        return { success: true, message: '更新购物车成功' };
      } catch (error) {
        console.error('更新购物车错误:', error);
        return { success: false, error: '更新购物车失败' };
      }
    }

    // 添加到购物车 (POST /cart/items)
    if (path === '/cart/items' && method === 'POST') {
      try {
        await ensureCollection('carts');
        const { userId, productId, quantity = 1, skuId } = body || {};
        if (!userId || !productId) {
          return { success: false, error: '用户ID和产品ID不能为空' };
        }
        // 检查是否已存在 (匹配 userId, productId, skuId)
        const whereClause = { user_id: userId, product_id: productId };
        if (skuId) whereClause.sku_id = skuId;
        const existing = await db.collection('carts').where(whereClause).get();
        if (existing.data.length > 0) {
          const existingItem = existing.data[0];
          await db.collection('carts').doc(existingItem._id).update({
            data: {
              quantity: db.command.inc(quantity),
              updated_at: new Date()
            }
          });
        } else {
          await db.collection('carts').add({
            data: {
              user_id: userId,
              product_id: productId,
              quantity,
              sku_id: skuId,
              selected: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
        return { success: true, message: '添加购物车成功' };
      } catch (error) {
        console.error('添加购物车错误:', error);
        return { success: false, error: '添加购物车失败' };
      }
    }

    // 删除购物车项 (DELETE /cart/{id})
    if (path.startsWith('/cart/') && method === 'DELETE' && path.split('/').length === 2) {
      try {
        await ensureCollection('carts');
        const cartId = path.split('/')[1];
        await db.collection('carts').doc(cartId).remove();
        return { success: true, message: '删除购物车项成功' };
      } catch (error) {
        console.error('删除购物车项错误:', error);
        return { success: false, error: '删除购物车项失败' };
      }
    }

    // 首页配置相关API
    if (path === '/admin/home-sections' && method === 'GET') {
      try {
        // 返回默认首页配置
        return {
          success: true,
          config: {
            sections: [
              { type: 'banner', title: '轮播图' },
              { type: 'products', title: '推荐商品', limit: 6 },
              { type: 'categories', title: '商品分类' }
            ]
          }
        };
      } catch (error) {
        console.error('获取首页配置错误:', error);
        return { success: false, error: '获取首页配置失败' };
      }
    }

    // 种子数据初始化 (仅用于开发，GET /seed)
    if (path === '/seed' && method === 'GET') {
      try {
        await ensureCollection('admins');
        // 初始化管理员
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // plain
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        const existingAdmin = await db.collection('admins').where({ username: adminUsername }).get();
        if (existingAdmin.data.length === 0) {
          await db.collection('admins').add({
            data: {
              username: adminUsername,
              password: hashedPassword,
              role: 'super_admin',
              created_at: new Date()
            }
          });
          console.log('管理员用户创建成功');
        }

        // 初始化分类
        const categories = [
          { name: '手机数码', sort_order: 1, created_at: new Date() },
          { name: '家用电器', sort_order: 2, created_at: new Date() },
          { name: '服装鞋帽', sort_order: 3, created_at: new Date() }
        ];
        for (const cat of categories) {
          const existing = await db.collection('categories').where({ name: cat.name }).get();
          if (existing.data.length === 0) {
            await db.collection('categories').add({ data: cat });
          }
        }

        // 初始化产品
        const products = [
          {
            name: 'iPhone 15 Pro',
            description: '最新苹果旗舰手机',
            price: 7999,
            original_price: 8999,
            stock: 100,
            main_image: 'https://via.placeholder.com/300x300/ff6b35/ffffff?text=iPhone+15', // 使用占位图
                        images: ['https://via.placeholder.com/300x300/ff6b35/ffffff?text=iPhone+15+1', 'https://via.placeholder.com/300x300/ff6b35/ffffff?text=iPhone+15+2'],
            category_id: 'temp_cat_id', // 将被替换
            status: 'published',
            sales_count: 0,
            is_featured: true,
            is_new: true,
            created_at: new Date(),
            updated_at: new Date(),
            skus: [
              { id: 'sku1', name: '64GB', price: 7999, stock: 50 },
              { id: 'sku2', name: '128GB', price: 8499, stock: 30 }
            ]
          },
          {
            name: '小米空气净化器',
            description: '高效空气净化设备',
            price: 1299,
            original_price: 1499,
            stock: 50,
            main_image: 'https://via.placeholder.com/300x300/4ecdc4/ffffff?text=Air+Purifier', // 使用占位图
                        images: ['https://via.placeholder.com/300x300/4ecdc4/ffffff?text=Air+Purifier+1'],
            category_id: 'temp_cat_id',
            status: 'published',
            sales_count: 0,
            is_featured: false,
            is_new: true,
            created_at: new Date(),
            updated_at: new Date(),
            skus: []
          }
        ];

        // 先获取分类ID
        const catResult = await db.collection('categories').where({ name: '手机数码' }).get();
        let phoneCatId = '';
        if (catResult.data && catResult.data.length > 0) {
          phoneCatId = catResult.data[0]._id;
        }

        products[0].category_id = phoneCatId;

        for (const product of products) {
          const existing = await db.collection('products').where({ name: product.name }).get();
          if (existing.data.length === 0) {
            await db.collection('products').add({ data: product });
          }
        }

        // 初始化轮播图
        const banners = [
          { image: 'https://via.placeholder.com/750x300/ff6b35/ffffff?text=Banner+1', link: '/pages/product/list?type=hot', sort_order: 1, updated_at: new Date() },
                    { image: 'https://via.placeholder.com/750x300/4ecdc4/ffffff?text=Banner+2', link: '/pages/product/list?type=new', sort_order: 2, updated_at: new Date() }
        ];
        await db.collection('banners').remove();
        for (const banner of banners) {
          await db.collection('banners').add({ data: banner });
        }

        // 初始化广告
        const ads = [
          { image: 'https://via.placeholder.com/300x150/45b7d1/ffffff?text=限时特惠', title: '限时特惠', link: '/pages/product/list?type=discount', sort_order: 1, updated_at: new Date() }
        ];
        await db.collection('ads').remove();
        for (const ad of ads) {
          await db.collection('ads').add({ data: ad });
        }

        return { success: true, message: '种子数据初始化成功' };
      } catch (error) {
        console.error('种子数据初始化错误:', error);
        return { success: false, error: '初始化失败' };
      }
    }

    // 获取订单列表 (GET /orders)
        if (path === '/orders' && method === 'GET') {
          try {
            await ensureCollection('orders');
    
            const { page = 1, limit = 10, user_id, status, start_date, end_date } = query || body || {};
            const actualLimit = parseInt(limit) || 10;
            const actualPage = parseInt(page) || 1;
    
            let whereCondition = {};
            if (user_id) whereCondition.user_id = user_id;
            if (status) whereCondition.status = status;
            if (start_date || end_date) {
              whereCondition.created_at = db.command.and(
                ...(start_date ? [{ '>=': new Date(start_date) }] : []),
                ...(end_date ? [{ '<=': new Date(end_date + 'T23:59:59') }] : [])
              );
            }
    
            const skip = (actualPage - 1) * actualLimit;
    
            // 获取总数
            const totalResult = await db.collection('orders')
              .where(whereCondition)
              .count();
    
            // 获取数据
            const dataResult = await db.collection('orders')
              .where(whereCondition)
              .skip(skip)
              .limit(actualLimit)
              .orderBy('created_at', 'desc')
              .get();
    
            return {
              success: true,
              orders: dataResult.data,
              pagination: {
                page: actualPage,
                limit: actualLimit,
                total: totalResult.total,
                pages: Math.ceil(totalResult.total / actualLimit)
              }
            };
          } catch (error) {
            console.error('获取订单列表错误:', error);
            if (error.errCode === -502005) {
              return { success: false, error: '数据库集合不存在，请先初始化数据库' };
            }
            return { success: false, error: '获取订单列表失败' };
          }
        }
    
        // 获取订单列表 (GET /orders)
            if (path === '/orders' && method === 'GET') {
              try {
                await ensureCollection('orders');
        
                const { page = 1, limit = 10, user_id, status, start_date, end_date } = query || body || {};
                const actualLimit = parseInt(limit) || 10;
                const actualPage = parseInt(page) || 1;
        
                let whereCondition = {};
                if (user_id) whereCondition.user_id = user_id;
                if (status) whereCondition.status = status;
                if (start_date || end_date) {
                  whereCondition.created_at = db.command.and(
                            ...(start_date ? [{ '>=': new Date(start_date) }] : []),
                            ...(end_date ? [{ '<=': new Date(end_date + 'T23:59:59') }] : [])
                  );
                }
        
                const skip = (actualPage - 1) * actualLimit;
        
                // 获取总数
                const totalResult = await db.collection('orders')
                  .where(whereCondition)
                  .count();
        
                // 获取数据
                const dataResult = await db.collection('orders')
                  .where(whereCondition)
                  .skip(skip)
                  .limit(actualLimit)
                  .orderBy('created_at', 'desc')
                  .get();
        
                return {
                  success: true,
                  orders: dataResult.data,
                  pagination: {
                    page: actualPage,
                    limit: actualLimit,
                    total: totalResult.total,
                    pages: Math.ceil(totalResult.total / actualLimit)
                  }
                };
              } catch (error) {
                console.error('获取订单列表错误:', error);
                if (error.errCode === -502005) {
                  return { success: false, error: '数据库集合不存在，请先初始化数据库' };
                }
                return { success: false, error: '获取订单列表失败' };
              }
            }
        
        // 如果没有匹配的路由
    return { success: false, error: '接口不存在' };

  } catch (error) {
    console.error('云函数执行错误:', error);
    return { success: false, error: '服务器内部错误' };
  }
};
