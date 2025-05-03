// API 基础URL
export const BASE_URL = 'http://localhost:3000/api';

// 认证相关接口
export const AUTH_URLS = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
};

// 游记相关接口
export const POST_URLS = {
  LIST: `${BASE_URL}/posts`,
  DETAIL: (id) => `${BASE_URL}/posts/${id}`,
  CREATE: `${BASE_URL}/posts`,
  UPDATE: (id) => `${BASE_URL}/posts/${id}`,
  LIKE: (id) => `${BASE_URL}/posts/${id}/like`,
  COMMENT: (id) => `${BASE_URL}/posts/${id}/comments`,
}; 