const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Category = require('../models/Category');
const router = express.Router();

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取分类树
router.get('/tree', async (req, res) => {
  try {
    const tree = await Category.getTree();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 根据ID获取分类
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建分类（需要管理员权限）
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, parent_id, sort_order, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      parent_id: parent_id || null,
      sort_order: sort_order || 0,
      image: image || null
    };

    const newCategory = await Category.create(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新分类（需要管理员权限）
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    const updatedCategory = await Category.update(req.params.id, req.body);
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除分类（需要管理员权限）
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    await Category.delete(req.params.id);
    res.json({ message: '分类删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;