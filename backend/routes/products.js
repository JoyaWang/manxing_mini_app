const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    // 确保数据库表存在
    console.log('[BACKEND PRODUCT GET] 确保数据库表存在...');
    await Product.createTable();
    await Product.createCategoryTable();
    console.log('[BACKEND PRODUCT GET] 数据库表检查完成');
    const { page = 1, limit = 10, category_id, search, status = 'published', is_featured, is_new } = req.query;

    const filters = { status };
    if (category_id) filters.category_id = category_id;
    if (search) filters.search = search;
    if (is_featured !== undefined) filters.is_featured = is_featured === 'true';
    if (is_new !== undefined) filters.is_new = is_new === 'true';

    const result = await Product.getProducts(filters, parseInt(page), parseInt(limit));
    
    res.json({
      products: result && result.products ? result.products : [],
      totalPages: result && result.pagination ? result.pagination.pages : 0,
      currentPage: result && result.pagination ? result.pagination.page : 1,
      total: result && result.pagination ? result.pagination.total : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建商品（需要管理员权限）
router.post('/', authenticate, requireAdmin, async (req, res) => {
  console.log('[BACKEND PRODUCT CREATE] 创建商品请求开始');
  console.log('[BACKEND PRODUCT CREATE] 接收到的请求体:', req.body);
  console.log('[BACKEND PRODUCT CREATE] 接收到的文件:', req.files ? req.files.length : 0);

  try {
    // 确保数据库表存在
    console.log('[BACKEND PRODUCT CREATE] 确保数据库表存在...');
    await Product.createTable();
    await Product.createCategoryTable();
    console.log('[BACKEND PRODUCT CREATE] 数据库表检查完成');
    const { name, price, original_price, stock, description, category_id, detail, specs, is_featured, is_new, main_image_url, images_urls, images } = req.body;

    console.log('[BACKEND PRODUCT CREATE] 解析参数:');
    console.log('- name:', name);
    console.log('- price:', price);
    console.log('- original_price:', original_price);
    console.log('- stock:', stock);
    console.log('- category_id:', category_id);
    console.log('- main_image_url:', main_image_url);
    console.log('- images_urls:', images_urls);
    console.log('- images (array):', images);

    let imageUrls = [];

    // 如果提供了images数组（前端单独上传图片返回的URL），优先使用
    if (images && Array.isArray(images)) {
      imageUrls = images;
      console.log('[BACKEND PRODUCT CREATE] 使用提供的images数组:', imageUrls);
    } else if (images_urls) {
      // 如果提供了URL字符串，解析并使用
      try {
        imageUrls = JSON.parse(images_urls);
        console.log('[BACKEND PRODUCT CREATE] 解析images_urls成功:', imageUrls);
      } catch (e) {
        imageUrls = images_urls.split(',').map(url => url.trim());
        console.log('[BACKEND PRODUCT CREATE] 字符串分割images_urls:', imageUrls);
      }
    }

    // 如果有上传的文件，使用文件（兼容直接文件上传）
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      console.log('[BACKEND PRODUCT CREATE] 使用上传文件生成URL:', imageUrls);
    }

    console.log('[BACKEND PRODUCT CREATE] 最终imageUrls:', imageUrls);

    // 如果提供了主图URL，使用它
    const mainImage = main_image_url || (imageUrls.length > 0 ? imageUrls[0] : null);
    console.log('[BACKEND PRODUCT CREATE] 设置main_image:', mainImage);

    const productData = {
      name,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      stock: parseInt(stock),
      description,
      detail,
      category_id,
      main_image: mainImage,
      images: imageUrls,
      status: 'published',
      is_featured: Boolean(is_featured),
      is_new: Boolean(is_new),
      skus: specs ? JSON.parse(specs) : []
    };

    console.log('[BACKEND PRODUCT CREATE] 最终productData:');
    console.log('- main_image:', productData.main_image);
    console.log('- images:', productData.images);
    console.log('- 全数据:', productData);

    const product = await Product.create(productData, req.user.id);
    console.log('[BACKEND PRODUCT CREATE] 商品创建成功, ID:', product.id);
    console.log('[BACKEND PRODUCT CREATE] 返回的product数据:', product);

    res.status(201).json(product);
  } catch (error) {
    console.error('[BACKEND PRODUCT CREATE] 创建商品错误:', error);
    res.status(400).json({ message: error.message });
  }
});

// 更新商品（需要管理员权限）
router.put('/:id', authenticate, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, original_price, stock, description, category_id, detail, specs, status, is_featured, is_new } = req.body;

    // 调试日志：记录接收到的数据
    console.log('📝 更新商品请求数据:', {
      name,
      price,
      original_price,
      stock,
      description,
      category_id,
      detail,
      specs,
      status,
      is_featured,
      is_new,
      is_featured_type: typeof is_featured,
      is_new_type: typeof is_new
    });

    const updates = {};
    if (name) updates.name = name;
    if (price) updates.price = parseFloat(price);
    if (original_price !== undefined) updates.original_price = original_price ? parseFloat(original_price) : null;
    if (stock) updates.stock = parseInt(stock);
    if (description) updates.description = description;
    if (detail) updates.detail = detail;
    if (category_id) updates.category_id = category_id;
    if (status) updates.status = status;
    if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
    if (is_new !== undefined) updates.is_new = Boolean(is_new);
    if (specs) updates.skus = JSON.parse(specs);

    // 调试日志：记录将要更新的字段
    console.log('📝 将要更新的字段:', updates);

    // 处理新上传的图片
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      updates.images = newImageUrls;
    }

    const product = await Product.update(req.params.id, updates, req.user.id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新商品状态（需要管理员权限）
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: '状态参数不能为空' });
    }

    const product = await Product.update(req.params.id, { status }, req.user.id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除商品（需要管理员权限）
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await Product.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json({ message: '商品已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取商品分类
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
