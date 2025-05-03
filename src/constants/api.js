// API 基础URL配置
const getBaseUrl = () => {
  // 开发环境下的API地址
  const devUrl = 'http://localhost:5000/api';
  
  // 小程序环境下可能需要使用IP而非localhost
  // const devWxUrl = 'http://192.168.1.100:5000/api'; // 使用你的本机局域网IP
  
  // 生产环境下的API地址
  // const prodUrl = 'https://your-production-server.com/api';
  
  // 根据环境返回对应的URL
  return devUrl;
};

export const BASE_URL = getBaseUrl();

// 认证相关接口
export const AUTH_URLS = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
};

// 游记相关接口
export const POST_URLS = {
  LIST: `${BASE_URL}/diaries`,
  DETAIL: (id) => `${BASE_URL}/diaries/${id}`,
  CREATE: `${BASE_URL}/diaries`,
  UPDATE: (id) => `${BASE_URL}/diaries/${id}`,
  LIKE: (id) => `${BASE_URL}/diaries/${id}/like`,
  COMMENT: (id) => `${BASE_URL}/diaries/${id}/comments`,
};

// 资源URL前缀，用于图片等静态资源
export const RESOURCE_URL = 'http://localhost:5000'; 