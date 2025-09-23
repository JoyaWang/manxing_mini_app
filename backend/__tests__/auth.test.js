const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('认证接口测试', () => {
  let testUser;

  beforeAll(async () => {
    // 创建测试用户
    testUser = new User({
      username: '测试用户',
      email: 'test@example.com',
      password: await User.hashPassword('test123'),
    });
    await testUser.save();
  });

  afterAll(async () => {
    // 清理测试数据
    await User.deleteMany({ email: 'test@example.com' });
  });

  test('POST /api/auth/register - 用户注册', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: '新用户',
        email: 'newuser@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
  });

  test('POST /api/auth/login - 用户登录', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('POST /api/auth/login - 密码错误', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', '邮箱或密码错误');
  });

  test('GET /api/auth/profile - 获取用户信息', async () => {
    // 先登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123',
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).not.toHaveProperty('password');
  });
});