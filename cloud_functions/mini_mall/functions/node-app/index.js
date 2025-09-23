const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取数据库引用
const db = cloud.database();

// 集合初始化函数
async function ensureCollection(collectionName) {
  try {
    // 尝试获取集合中的文档来检查集合是否存在
    await db.collection(collectionName).limit(1).get();
    console.log(`集合 ${collectionName} 已存在`);
    return true;
  } catch (error) {
    if (error.errCode === -502005) {
      // 集合不存在，尝试创建（通过添加一个临时文档然后删除）
      console.log(`集合 ${collectionName} 不存在，尝试初始化...`);
      try {
        // 添加一个临时文档来创建集合
        const tempDoc = await db.collection(collectionName).add({
          data: {
            _temp_init: true,
            created_at: new Date()
          }
        });
        // 删除临时文档
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

  try {
    // 管理员登录
    if (path === '/auth/admin-login' && method === 'POST') {
      const { username, password } = body || {};
      if (!username || !password) {
        return { success: false, error: '用户名和密码不能为空' };
      }

      // 简单的管理员验证（实际项目中应该使用数据库）
      if (username === 'admin' && password === 'admin123') {
        return {
          success: true,
          token: `admin-token-${Date.now()}`,
          user: {
            id: 'admin_' + Date.now(),
            username: 'admin',
            isAdmin: true
          }
        };
      } else {
        return { success: false, error: '用户名或密码错误' };
      }
    }

    // 获取商品列表
    if (path === '/products' && method === 'GET') {
      try {
        // 确保products和categories集合存在
        await ensureCollection('products');
        await ensureCollection('categories');

        const { page = 1, limit = 10, category_id, search, status = 'published', is_featured, is_new } = query || {};

        let whereCondition = {};
        if (category_id) whereCondition.category_id = category_id;
        if (status) whereCondition.status = status;
        if (is_featured === 'true') whereCondition.is_featured = true;
        if (is_new === 'true') whereCondition.is_new = true;
        if (search) {
          // 简单的搜索条件
          whereCondition.name = db.RegExp({
            regexp: search,
            options: 'i'
          });
        }

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

        // 映射数据以兼容前端期望的字段
        const products = dataResult.data.map(product => ({
          ...product,
          image: product.main_image, // 添加 image 字段指向 main_image
          mainImage: product.main_image, // 添加 mainImage 字段用于管理页面
          id: product._id // 添加 id 字段
        }));

        return {
          products,
          totalPages: Math.ceil(totalResult.total / parseInt(limit)),
          currentPage: parseInt(page),
          total: totalResult.total
        };
      } catch (error) {
        console.error('获取商品列表错误:', error);
        if (error.errCode === -502005) {
          return { success: false, error: '数据库集合不存在，请先初始化数据库' };
        }
        return { success: false, error: '获取商品列表失败' };
      }
    }

    // 获取单个商品详情
    if (path.startsWith('/products/') && method === 'GET' && path !== '/products') {
      try {
        // 确保products集合存在
        await ensureCollection('products');

        const productId = path.split('/').pop();
        const result = await db.collection('products').doc(productId).get();

        if (!result.data) {
          return { success: false, error: '商品不存在' };
        }

        const product = result.data;
        // 添加兼容字段
        product.image = product.main_image;
        product.mainImage = product.main_image;
        product.id = product._id;

        return product;
      } catch (error) {
        console.error('获取商品详情错误:', error);
        return { success: false, error: '获取商品详情失败' };
      }
    }

    // 创建商品
    if (path === '/products' && method === 'POST') {
      try {
        // 确保products集合存在
        const collectionExists = await ensureCollection('products');
        if (!collectionExists) {
          return { success: false, error: '数据库集合初始化失败' };
        }

        const { name, price, original_price, stock, description, category_id, detail, specs, is_featured, is_new, main_image, images } = body || {};

        if (!name || !price) {
          return { success: false, error: '商品名称和价格不能为空' };
        }

        if (!main_image) {
          return { success: false, error: '商品主图不能为空' };
        }

        // 验证图片数组
        let validatedImages = [];
        if (images) {
          if (Array.isArray(images)) {
            validatedImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
          } else if (typeof images === 'string') {
            try {
              validatedImages = JSON.parse(images);
              if (!Array.isArray(validatedImages)) {
                validatedImages = [];
              }
            } catch (e) {
              validatedImages = [];
            }
          }
        }

        const productData = {
          name,
          price: parseFloat(price),
          original_price: original_price ? parseFloat(original_price) : null,
          stock: parseInt(stock) || 0,
          description: description || '',
          detail: detail || '',
          category_id: category_id || '',
          main_image: main_image || '',
          images: Array.isArray(images) ? images : [],
          status: 'published',
          is_featured: Boolean(is_featured),
          is_new: Boolean(is_new),
          skus: specs ? JSON.parse(specs) : [],
          created_at: new Date(),
          updated_at: new Date()
        };

        const result = await db.collection('products').add({
          data: productData
        });

        return {
          success: true,
          message: '商品创建成功',
          product: {
            id: result._id,
            ...productData
          }
        };
      } catch (error) {
        console.error('创建商品错误:', error);
        return { success: false, error: '创建商品失败' };
      }
    }

    // 更新商品状态
        if (path.startsWith('/products/') && method === 'PATCH' && path !== '/products') {
          try {
            // 确保products集合存在
            await ensureCollection('products');
    
            const productId = path.split('/').pop();
            const { status } = body || {};
    
            if (!status) {
              return { success: false, error: '状态不能为空' };
            }
    
            // 验证状态值
            const validStatuses = ['published', 'draft'];
            if (!validStatuses.includes(status)) {
              return { success: false, error: '无效的状态值' };
            }
    
            const updateResult = await db.collection('products').doc(productId).update({
              data: {
                status,
                updated_at: new Date()
              }
            });
    
            if (updateResult.stats.updated === 0) {
              return { success: false, error: '商品不存在或更新失败' };
            }
    
            return {
              success: true,
              message: `商品状态已更新为 ${status === 'published' ? '上架' : '下架'}`
            };
          } catch (error) {
            console.error('更新商品状态错误:', error);
            return { success: false, error: '更新商品状态失败' };
          }
        }
    
        // 获取分类列表
    if (path === '/categories' && method === 'GET') {
      try {
        // 确保categories集合存在
        await ensureCollection('categories');

        const result = await db.collection('categories')
          .where({
            is_active: true
          })
          .orderBy('sort_order', 'asc')
          .get();

        return result.data;
      } catch (error) {
        console.error('获取分类列表错误:', error);
        if (error.errCode === -502005) {
          return { success: false, error: '数据库集合不存在，请先初始化数据库' };
        }
        return { success: false, error: '获取分类列表失败' };
      }
    }

    // 获取订单列表
    if (path === '/orders' && method === 'GET') {
      try {
        // 确保orders集合存在
        await ensureCollection('orders');

        const { page = 1, limit = 10, status } = query || {};

        let whereCondition = {};
        if (status) whereCondition.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 获取总数
        const totalResult = await db.collection('orders')
          .where(whereCondition)
          .count();

        // 获取数据
        const dataResult = await db.collection('orders')
          .where(whereCondition)
          .skip(skip)
          .limit(parseInt(limit))
          .orderBy('created_at', 'desc')
          .get();

        return {
          orders: dataResult.data,
          totalPages: Math.ceil(totalResult.total / parseInt(limit)),
          currentPage: parseInt(page),
          total: totalResult.total
        };
      } catch (error) {
        console.error('获取订单列表错误:', error);
        if (error.errCode === -502005) {
          return { success: false, error: '数据库集合不存在，请先初始化数据库' };
        }
        return { success: false, error: '获取订单列表失败' };
      }
    }

    // 创建订单
    if (path === '/orders' && method === 'POST') {
      try {
        // 确保orders集合存在
        const collectionExists = await ensureCollection('orders');
        if (!collectionExists) {
          return { success: false, error: '数据库集合初始化失败' };
        }

        const { user_id, items, total_amount, shipping_address, payment_method, notes } = body || {};

        if (!user_id || !items || !total_amount) {
          return { success: false, error: '用户ID、商品列表和总金额不能为空' };
        }

        const orderData = {
          order_no: `O${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          user_id,
          total_amount: parseFloat(total_amount),
          actual_amount: parseFloat(total_amount),
          status: 'pending',
          payment_method: payment_method || 'wechat',
          payment_status: 'pending',
          shipping_address: shipping_address || {},
          items: Array.isArray(items) ? items : [],
          remark: notes || '',
          created_at: new Date(),
          updated_at: new Date()
        };

        const result = await db.collection('orders').add({
          data: orderData
        });

        return {
          success: true,
          message: '订单创建成功',
          order: {
            id: result._id,
            ...orderData
          }
        };
      } catch (error) {
        console.error('创建订单错误:', error);
        return { success: false, error: '创建订单失败' };
      }
    }

    // 获取单个订单
    if (path.startsWith('/orders/') && method === 'GET' && path !== '/orders') {
      try {
        // 确保orders集合存在
        await ensureCollection('orders');

        const orderId = path.split('/').pop();
        const result = await db.collection('orders').doc(orderId).get();

        if (!result.data) {
          return { success: false, error: '订单不存在' };
        }

        return result.data;
      } catch (error) {
        console.error('获取订单详情错误:', error);
        return { success: false, error: '获取订单详情失败' };
      }
    }

    // 首页配置相关API
    if (path === '/admin/home-sections' && method === 'GET') {
      try {
        // 确保home_sections集合存在
        await ensureCollection('home_sections');

        const result = await db.collection('home_sections')
          .orderBy('sort_order', 'asc')
          .get();

        // 如果没有数据，返回默认配置
        if (!result.data || result.data.length === 0) {
          return [
            { id: 'banners', name: '轮播图', enabled: true, sort_order: 1 },
            { id: 'categories', name: '分类导航', enabled: true, sort_order: 2 },
            { id: 'featured', name: '精选推荐', enabled: true, sort_order: 3 },
            { id: 'new', name: '新品上市', enabled: true, sort_order: 4 },
            { id: 'hot', name: '热卖商品', enabled: true, sort_order: 5 },
            { id: 'ads', name: '广告位', enabled: true, sort_order: 6 }
          ];
        }

        // 映射数据以返回正确的字段名
        return result.data.map(item => ({
          id: item.section_id,
          name: item.name,
          enabled: item.enabled,
          sort_order: item.sort_order
        }));
      } catch (error) {
        console.error('获取首页配置错误:', error);
        if (error.errCode === -502005) {
          return { success: false, error: '数据库集合不存在，请先初始化数据库' };
        }
        return { success: false, error: '获取首页配置失败' };
      }
    }

    if (path === '/admin/home-sections' && method === 'PUT') {
      try {
        const collectionExists = await ensureCollection('home_sections');
        if (!collectionExists) {
          return { success: false, error: '数据库集合初始化失败' };
        }

        const sectionsObj = body || {};
        const sectionsArray = Object.entries(sectionsObj).map(([id, config]) => ({ section_id: id, ...config }));

        // 删除所有现有数据 - 获取所有文档然后逐个删除
        const existingDocs = await db.collection('home_sections').get();
        for (const doc of existingDocs.data) {
          await db.collection('home_sections').doc(doc._id).remove();
        }

        // 添加新数据
        for (const section of sectionsArray) {
          await db.collection('home_sections').add({ data: section });
        }
        return { success: true };
      } catch (error) {
        console.error('更新首页配置错误:', error);
        return { success: false, error: '更新失败' };
      }
    }

    // 轮播图相关API
    if (path === '/banners' && method === 'GET') {
      try {
        await ensureCollection('banners');
        const result = await db.collection('banners').get();
        return result.data;
      } catch (error) {
        console.error('获取轮播图错误:', error);
        return [];
      }
    }

    if (path === '/banners' && method === 'PUT') {
      try {
        await ensureCollection('banners');
        const banners = body || [];
        // 删除所有现有数据
        await db.collection('banners').where({}).remove();
        // 添加新数据
        for (const banner of banners) {
          await db.collection('banners').add({ data: banner });
        }
        return { success: true };
      } catch (error) {
        console.error('更新轮播图错误:', error);
        return { success: false, error: '更新失败' };
      }
    }

    // 广告位相关API
    if (path === '/ads' && method === 'GET') {
      try {
        await ensureCollection('ads');
        const result = await db.collection('ads').get();
        return result.data;
      } catch (error) {
        console.error('获取广告位错误:', error);
        return [];
      }
    }

    if (path === '/ads' && method === 'PUT') {
      try {
        await ensureCollection('ads');
        const ads = body || [];
        // 删除所有现有数据
        await db.collection('ads').where({}).remove();
        // 添加新数据
        for (const ad of ads) {
          await db.collection('ads').add({ data: ad });
        }
        return { success: true };
      } catch (error) {
        console.error('更新广告位错误:', error);
        return { success: false, error: '更新失败' };
      }
    }

    // 如果没有匹配的路由
    return { success: false, error: '接口不存在' };

  } catch (error) {
    console.error('云函数执行错误:', error);
    return { success: false, error: '服务器内部错误' };
  }
};
