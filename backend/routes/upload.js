const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// 配置multer用于通用文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据上传类型创建不同的目录
    const uploadType = req.params.type || 'general';
    const uploadPath = path.join('uploads', uploadType);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 允许所有文件类型，但可以在这里添加限制
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 单文件上传
router.post('/single/:type?', authenticate, upload.single('file'), (req, res) => {
  console.log('[BACKEND UPLOAD] 单文件上传请求开始, type:', req.params.type);
  console.log('[BACKEND UPLOAD] 接收到文件:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    filename: req.file.filename
  } : '无文件');

  try {
    if (!req.file) {
      console.log('[BACKEND UPLOAD] 错误: 未接收到文件');
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const uploadType = req.params.type || 'general';
    const fileUrl = `/uploads/${uploadType}/${req.file.filename}`;
    console.log('[BACKEND UPLOAD] 生成文件URL:', fileUrl);
    console.log('[BACKEND UPLOAD] 文件保存路径:', path.join('uploads', uploadType, req.file.filename));

    res.json({
      message: '文件上传成功',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
    console.log('[BACKEND UPLOAD] 上传成功响应发送');
  } catch (error) {
    console.error('[BACKEND UPLOAD] 上传处理错误:', error);
    res.status(500).json({ message: error.message });
  }
});

// 多文件上传
router.post('/multiple/:type?', authenticate, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const files = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${req.params.type || 'general'}/${file.filename}`
    }));

    res.json({
      message: '文件上传成功',
      files: files
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取上传的文件列表（管理员）
router.get('/list/:type?', authenticate, requireAdmin, (req, res) => {
  try {
    const fs = require('fs');
    const uploadType = req.params.type || 'general';
    const uploadPath = path.join(__dirname, '..', 'uploads', uploadType);
    
    if (!fs.existsSync(uploadPath)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(uploadPath).map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        uploadedAt: stats.mtime,
        url: `/uploads/${uploadType}/${filename}`
      };
    });
    
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除文件（管理员）
router.delete('/:filename', authenticate, requireAdmin, (req, res) => {
  try {
    const fs = require('fs');
    const { filename } = req.params;
    const uploadType = req.query.type || 'general';
    const filePath = path.join(__dirname, '..', 'uploads', uploadType, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
