// pages/admin/user-manage/index.js
const app = getApp();
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    users: [],
    loading: false,
    searchKeyword: '',
    currentPage: 1,
    totalPages: 1,
    roleFilter: 'all'
  },

  onLoad() {
    this.checkAdminAccess();
    this.loadUsers();
  },

  onShow() {
    this.loadUsers();
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

  // 加载用户列表
  async loadUsers() {
    this.setData({ loading: true });
    
    try {
      const params = {
        page: this.data.currentPage,
        limit: 20,
        keyword: this.data.searchKeyword,
        role: this.data.roleFilter === 'all' ? '' : this.data.roleFilter
      };

      const response = await api.getUsers(params);
      this.setData({
        users: response.users,
        totalPages: response.totalPages,
        loading: false
      });
    } catch (error) {
      console.error('加载用户失败:', error);
      util.showError('加载用户失败');
      this.setData({ loading: false });
    }
  },

  // 搜索用户
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearchConfirm() {
    this.setData({ currentPage: 1 });
    this.loadUsers();
  },

  // 切换角色筛选
  onRoleChange(e) {
    this.setData({ 
      roleFilter: e.detail.value,
      currentPage: 1 
    });
    this.loadUsers();
  },

  // 切换用户角色
  async onToggleUserRole(e) {
    const userId = e.currentTarget.dataset.id;
    const user = this.data.users.find(u => u.id === userId);
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await api.updateUserRole(userId, newRole);
      util.showSuccess(`用户角色已${newRole === 'admin' ? '提升为管理员' : '降为普通用户'}`);
      this.loadUsers();
    } catch (error) {
      console.error('更新用户角色失败:', error);
      util.showError('操作失败');
    }
  },

  // 重置用户密码
  async onResetPassword(e) {
    const userId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认重置',
      content: '确定要重置该用户的密码吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.resetUserPassword(userId);
            util.showSuccess('密码重置成功');
          } catch (error) {
            console.error('重置密码失败:', error);
            util.showError('重置失败');
          }
        }
      }
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 翻页
  onPageChange(e) {
    const page = e.currentTarget.dataset.page;
    if (page >= 1 && page <= this.data.totalPages && page !== this.data.currentPage) {
      this.setData({ currentPage: page });
      this.loadUsers();
    }
  }
});
