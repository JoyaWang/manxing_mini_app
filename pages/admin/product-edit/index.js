// pages/admin/product-edit/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    productId: null,
    isEdit: false,
    loading: false,
    submitting: false,

    // 表单数据
    formData: {
      name: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      stock: '',
      description: '',
      isFeatured: false,
      isNew: false,
      detail: '',
      status: 'published',
      images: [],
      mainImage: '',
      skus: []  // SKU数组
    },

    // 分类选项
    categories: [],
    categoryIndex: -1,

    // 新分类模态框
    showCategoryModal: false,
    newCategory: {
      name: '',
      description: ''
    },

    // SKU管理
    currentSku: { name: '', price: '', stock: '' },
    skuIndex: -1,  // -1表示新增，否则是编辑索引

    // 图片上传
    uploading: false,
    uploadProgress: 0
  },

  onLoad(options) {
    this.checkAdminAccess();
    this.loadCategories();

    if (options.id) {
      this.setData({ productId: options.id, isEdit: true });
      this.loadProductDetail(options.id);
    }
  },

  // 检查管理员权限
  checkAdminAccess() {
    const userInfo = app.globalData.userInfo;
    const isAdmin = userInfo && userInfo.isAdmin === true;

    if (!isAdmin) {
      util.showError('无权限访问');
      wx.navigateBack();
      return false;
    }
    return true;
  },

  // 加载分类
  async loadCategories() {
    try {
      const categories = await api.getCategories();
      console.log('[CATEGORIES API] Raw response:', categories);
      console.log('[CATEGORIES API] Categories data:', categories.categories);
      this.setData({ categories: categories.categories || [] });
      console.log('[CATEGORIES API] After setData:', this.data.categories);
    } catch (error) {
      console.error('加载分类失败:', error);
      util.showError('加载分类失败');
    }
  },

  // 打开创建新分类模态框
  onCreateCategory() {
    this.setData({
      showCategoryModal: true,
      'newCategory.name': '',
      'newCategory.description': ''
    });
  },

  // 新分类输入处理
  onNewCategoryInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`newCategory.${field}`]: value
    });
  },

  // 提交新分类
  async onSubmitNewCategory() {
    const { name, description } = this.data.newCategory;
    if (!name.trim()) {
      util.showError('分类名称不能为空');
      return;
    }

    try {
      const result = await api.createCategory({ name, description });
      if (result.success) {
        // 刷新分类列表
        await this.loadCategories();

        // 自动选择新分类
        const newCatIndex = this.data.categories.findIndex(cat => cat.id === result.category.id);
        if (newCatIndex >= 0) {
          this.setData({
            'formData.categoryId': result.category.id,
            categoryIndex: newCatIndex
          });
        }

        this.setData({ showCategoryModal: false });
        util.showSuccess('分类创建成功');
      } else {
        util.showError('创建分类失败');
      }
    } catch (error) {
      console.error('创建分类错误:', error);
      util.showError('创建分类失败');
    }
  },

  // 关闭模态框
  onCloseCategoryModal() {
    this.setData({ showCategoryModal: false });
  },

  // 加载商品详情
  async loadProductDetail(id) {
    this.setData({ loading: true });

    try {
      const product = await api.getProductDetail(id);
      this.setData({
        'formData.name': product.name,
        'formData.price': product.price,
        'formData.originalPrice': product.originalPrice || '',
        'formData.categoryId': product.categoryId || '',
        'formData.stock': product.stock,
        'formData.description': product.description,
        'formData.detail': product.detail || '',
        'formData.status': product.status,
        'formData.isFeatured': product.is_featured || false,
        'formData.isNew': product.is_new || false,
        'formData.images': product.images || [],
        'formData.mainImage': product.image || '',
        'formData.skus': product.skus || []  // 加载SKU
      });

      // 更新分类索引
      if (product.categoryId) {
        const catIndex = this.data.categories.findIndex(cat => cat.id === product.categoryId);
        if (catIndex >= 0) {
          this.setData({ categoryIndex: catIndex });
        }
      }
    } catch (error) {
      console.error('加载商品详情失败:', error);
      util.showError('加载商品详情失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 表单输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // SKU输入处理
  onSkuInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`currentSku.${field}`]: value
    });
  },

  // 选择分类
  onCategoryChange(e) {
    const index = e.detail.value;
    if (index >= 0 && this.data.categories[index]) {
      const category = this.data.categories[index];
      this.setData({
        'formData.categoryId': category.id,
        categoryIndex: index
      });
    }
  },

  // 选择状态
  onStatusChange(e) {
    this.setData({
      'formData.status': e.detail.value ? 'published' : 'unpublished'
    });
  },

  // 推荐商品切换
  onFeaturedChange(e) {
    this.setData({
      'formData.isFeatured': e.detail.value
    });
  },

  // 新品上市切换
  onNewChange(e) {
    this.setData({
      'formData.isNew': e.detail.value
    });
  },

  // 获取选中分类名称
  get selectedCategoryName() {
    const category = this.data.categories.find(
      c => c.id === this.data.formData.categoryId
    );
    return category ? category.name : '';
  },

  // 添加SKU
  onAddSku() {
    const { currentSku } = this.data;
    if (!currentSku.name || !currentSku.price || !currentSku.stock) {
      util.showError('请填写完整SKU信息');
      return;
    }

    const skus = [...this.data.formData.skus];
    if (this.data.skuIndex >= 0) {
      // 编辑现有SKU
      skus[this.data.skuIndex] = { ...currentSku, id: skus[this.data.skuIndex].id };
      this.setData({ skuIndex: -1 });
    } else {
      // 新增SKU
      skus.push({ ...currentSku, id: Date.now().toString() });
    }

    this.setData({
      'formData.skus': skus,
      currentSku: { name: '', price: '', stock: '' }
    });

    util.showSuccess(this.data.skuIndex >= 0 ? 'SKU更新成功' : 'SKU添加成功');
  },

  // 编辑SKU
  onEditSku(e) {
    const { index } = e.currentTarget.dataset;
    const sku = this.data.formData.skus[index];
    this.setData({
      currentSku: { ...sku },
      skuIndex: index
    });
  },

  // 删除SKU
  onDeleteSku(e) {
    const { index } = e.currentTarget.dataset;
    const skus = [...this.data.formData.skus];
    skus.splice(index, 1);
    this.setData({
      'formData.skus': skus,
      skuIndex: -1,
      currentSku: { name: '', price: '', stock: '' }
    });
    util.showSuccess('SKU删除成功');
  },

  // 取消SKU编辑
  onCancelSku() {
    this.setData({
      skuIndex: -1,
      currentSku: { name: '', price: '', stock: '' }
    });
  },

  // 上传图片
  async onUploadImage() {
    if (this.data.uploading) return;

    console.log('[FRONTEND] 开始选择图片...');
    this.setData({ uploading: true, uploadProgress: 0 });

    try {
      const res = await wx.chooseMedia({
        count: 9,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed']
      });

      console.log('[FRONTEND] 图片选择完成:', res.tempFiles);
      if (res.tempFiles && res.tempFiles.length > 0) {
        for (const file of res.tempFiles) {
          console.log('[FRONTEND] 准备上传图片:', file.tempFilePath, file.size);
          this.setData({ uploadProgress: 30 });

          // 模拟上传过程
          await new Promise(resolve => setTimeout(resolve, 500));
          this.setData({ uploadProgress: 70 });

          // 调用API上传图片
          console.log('[FRONTEND] 调用 uploadImage API, filePath:', file.tempFilePath);
          const uploadRes = await api.uploadImage(file.tempFilePath);

          console.log('[FRONTEND] 上传响应:', uploadRes);

          if (uploadRes.file && uploadRes.file.url) {
            const images = [...this.data.formData.images, uploadRes.file.url];
            this.setData({
              'formData.images': images,
              uploadProgress: 100
            });

            // 如果没有主图，设置第一张为主图
            if (!this.data.formData.mainImage && images.length > 0) {
              this.setData({
                'formData.mainImage': images[0]
              });
            }
          } else {
            console.error('[FRONTEND] 上传响应格式错误:', uploadRes);
            util.showError('上传响应格式错误');
          }
        }

        util.showSuccess('图片上传成功');
      }
    } catch (error) {
      console.error('[FRONTEND] 上传图片失败:', error);
      util.showError('上传图片失败');
    } finally {
      this.setData({ uploading: false, uploadProgress: 0 });
    }
  },

  // 删除图片
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = [...this.data.formData.images];
    images.splice(index, 1);

    this.setData({
      'formData.images': images
    });
  },

  // 设置主图
  onSetMainImage(e) {
    const { index } = e.currentTarget.dataset;
    const mainImage = this.data.formData.images[index];

    this.setData({
      'formData.mainImage': mainImage
    });

    util.showSuccess('已设置为主图');
  },

  // 表单验证
  validateForm() {
    const { name, price, categoryId, stock } = this.data.formData;

    if (!name.trim()) {
      util.showError('请输入商品名称');
      return false;
    }

    if (!price || parseFloat(price) <= 0) {
      util.showError('请输入正确的价格');
      return false;
    }

    // 分类现在是可选的，不再强制要求
    // if (!categoryId) {
    //   util.showError('请选择商品分类');
    //   return false;
    // }

    if (!stock || parseInt(stock) < 0) {
      util.showError('请输入正确的库存数量');
      return false;
    }

    // SKU验证（如果有SKU，验证完整性）
    const skus = this.data.formData.skus;
    if (skus.length > 0) {
      for (const sku of skus) {
        if (!sku.name || !sku.price || !sku.stock) {
          util.showError('请完善所有SKU信息');
          return false;
        }
      }
    }

    return true;
  },

  // 提交表单
  async onSubmit() {
    if (!this.validateForm()) return;
    if (this.data.submitting) return;

    this.setData({ submitting: true });

    try {
      const formData = {
        ...this.data.formData,
        price: parseFloat(this.data.formData.price),
        original_price: this.data.formData.originalPrice ? parseFloat(this.data.formData.originalPrice) : null,
        stock: parseInt(this.data.formData.stock),
        main_image: this.data.formData.mainImage || this.data.formData.images[0] || null,
        images: this.data.formData.images || [],
        is_featured: this.data.formData.isFeatured || false,
        is_new: this.data.formData.isNew || false,
        skus: this.data.formData.skus || []  // 发送SKU数组
      };

      console.log('[FRONTEND PRODUCT SUBMIT] 准备提交的formData:', formData);
      console.log('[FRONTEND PRODUCT SUBMIT] images array:', formData.images);
      console.log('[FRONTEND PRODUCT SUBMIT] main_image:', formData.main_image);
      console.log('[FRONTEND PRODUCT SUBMIT] skus:', formData.skus);

      let result;

      if (this.data.isEdit) {
        result = await api.updateProduct(this.data.productId, formData);
        util.showSuccess('商品更新成功');
      } else {
        result = await api.createProduct(formData);
        util.showSuccess('商品创建成功');
      }

      console.log('[FRONTEND PRODUCT SUBMIT] API响应:', result);

      // 返回商品管理页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存商品失败:', error);
      util.showError('保存商品失败');
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
