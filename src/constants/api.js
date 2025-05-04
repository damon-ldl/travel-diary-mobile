// API 基础URL配置
const getBaseUrl = () => {
  // 判断当前环境
  const env = process.env.NODE_ENV;
  const isWechatMiniProgram = process.env.TARO_ENV === 'weapp';
  
  // 开发环境下的API地址
  let devUrl = 'http://localhost:5000/api';
  
  // 微信开发工具中使用IP地址替代localhost
  if (isWechatMiniProgram) {
    // 本地局域网IP地址，请根据实际情况修改
    devUrl = 'http://192.168.44.1:5000/api'; 
    // 也可以使用内网穿透工具提供的URL，例如：
    // devUrl = 'https://your-ngrok-url.ngrok.io/api';
  }
  
  // 生产环境下的API地址
  // const prodUrl = 'https://your-production-server.com/api';
  
  // 根据环境返回对应的URL
  return devUrl;
};

export const BASE_URL = getBaseUrl();

// 认证相关接口
export const AUTH_URLS = {
  BASE_URL: BASE_URL.replace('/api', ''), // 用于上传头像等场景
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
};

// 游记相关接口
export const POST_URLS = {
  LIST: `${BASE_URL}/diaries`,
  MY_DIARIES: `${BASE_URL}/diaries/my`,
  DETAIL: (id) => `${BASE_URL}/diaries/${id}`,
  CREATE: `${BASE_URL}/diaries`,
  UPDATE: (id) => `${BASE_URL}/diaries/${id}`,
  LIKE: (id) => `${BASE_URL}/diaries/${id}/like`,
  COMMENT: (id) => `${BASE_URL}/diaries/${id}/comments`,
};

// 资源URL前缀，用于图片等静态资源
export const RESOURCE_URL = BASE_URL.replace('/api', ''); 