// API 基础URL配置
const getBaseUrl = () => {
  // 判断当前环境
  const env = process.env.NODE_ENV;
  const isWechatMiniProgram = process.env.TARO_ENV === 'weapp';
  const isH5 = process.env.TARO_ENV === 'h5';
  
  // 开发环境下的API地址
  let devUrl = 'http://localhost:5000/api';
  
  // 在H5环境运行时，根据host确定API地址
  if (isH5) {
    // 尝试通过主机名推断API地址
    const host = window.location.hostname;
    const port = window.location.port;
    
    // 如果是在开发服务器上运行
    if (port === '10086') {
      // 使用相对路径，依赖开发服务器的代理配置
      return '/api';
    }
    
    // 尝试连接同一主机上的后端（不同端口）
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // 如果是在局域网内的其他设备上运行
    return `http://${host}:5000/api`;
  }
  // 微信开发工具中使用IP地址替代localhost
  else if (isWechatMiniProgram) {
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

// 获取资源服务器基础URL
const getResourceBaseUrl = () => {
  const apiUrl = getBaseUrl();
  
  // 如果是相对路径（如/api），则资源URL也使用相对路径
  if (apiUrl.startsWith('/')) {
    return '';  // 返回空字符串，表示使用相对于当前域的路径
  }
  
  // 否则从API URL中提取基础URL（去掉/api部分）
  return apiUrl.replace('/api', '');
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
  MY_POSTS: `${BASE_URL}/diaries/my`, // 获取我的游记列表
  LIST: `${BASE_URL}/diaries`, // 获取游记列表
  DETAIL: (id) => `${BASE_URL}/diaries/${id}`, // 获取游记详情
  CREATE: `${BASE_URL}/diaries`, // 创建游记
  UPDATE: (id) => `${BASE_URL}/diaries/${id}`, // 更新游记
  DELETE: (id) => `${BASE_URL}/diaries/${id}`, // 删除游记
  LIKE: (id) => `${BASE_URL}/diaries/${id}/like`, // 点赞/取消点赞
  COMMENT: (id) => `${BASE_URL}/diaries/${id}/comments`, // 评论
};

// 资源URL前缀，用于图片等静态资源
export const RESOURCE_URL = getResourceBaseUrl(); 