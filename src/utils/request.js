import Taro from '@tarojs/taro';
import { BASE_URL } from '../constants/api';

// 获取存储的令牌
export const getToken = () => {
  const token = Taro.getStorageSync('token');
  console.log('获取存储的token:', token ? '存在' : '不存在');
  return token;
};

// 设置令牌到本地存储
export const setToken = (token) => {
  console.log('设置token到存储:', token);
  Taro.setStorageSync('token', token);
};

// 清除令牌
export const clearToken = () => {
  Taro.removeStorageSync('token');
};

// 保存用户信息
export const setUserInfo = (userInfo) => {
  Taro.setStorageSync('userInfo', userInfo);
};

// 获取用户信息
export const getUserInfo = () => {
  return Taro.getStorageSync('userInfo');
};

// 清除用户信息
export const clearUserInfo = () => {
  Taro.removeStorageSync('userInfo');
};

// 判断是否已登录
export const isLoggedIn = () => {
  return !!getToken();
};

// 统一请求方法
export const request = (url, options = {}) => {
  // 检查 URL 是否已经是绝对 URL
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // 如果是相对路径，并且以 / 开头，则直接拼接到 BASE_URL 上
    // 否则，则是相对于 BASE_URL 的路径
    if (url.startsWith('/')) {
      // 确保不会重复 /api
      const apiIndex = url.indexOf('/api');
      if (apiIndex === 0) {
        // 如果 url 以 /api 开头，使用 BASE_URL 的基础部分
        const baseUrlWithoutApi = BASE_URL.substring(0, BASE_URL.lastIndexOf('/api'));
        fullUrl = `${baseUrlWithoutApi}${url}`;
      } else {
        fullUrl = `${BASE_URL}${url}`;
      }
    } else {
      fullUrl = `${BASE_URL}/${url}`;
    }
  }
  
  // 默认配置
  const defaultOptions = {
    url: fullUrl,
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // 携带凭证
  };

  // 合并配置
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // 检测是否为FormData类型
  if (options.data instanceof FormData) {
    // FormData需要使用multipart/form-data格式
    mergedOptions.header['Content-Type'] = 'multipart/form-data';
  }

  // 如果有令牌，添加到请求头
  const token = getToken();
  if (token) {
    mergedOptions.header.Authorization = `Bearer ${token}`;
    console.log('请求头包含token:', fullUrl);
  } else {
    console.log('请求头不包含token:', fullUrl);
  }

  console.log('发起请求:', {
    url: fullUrl,
    method: options.method || 'GET',
    hasToken: !!token
  });

  // 发起请求
  return new Promise((resolve, reject) => {
    Taro.request({
      ...mergedOptions,
      success: (res) => {
        console.log('请求响应:', {
          url: fullUrl, 
          statusCode: res.statusCode,
          hasData: !!res.data
        });
        
        // 请求成功(HTTP状态码为200)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 添加空响应检查
          if (!res.data) {
            resolve({});
            return;
          }
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，需要重新登录
          console.error('401未授权错误:', fullUrl);
          Taro.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
          });
          // 清除用户状态
          clearToken();
          clearUserInfo();
          // 跳转到登录页
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/login/index' });
          }, 1500);
          reject(new Error('登录已过期'));
        } else {
          // 其他错误
          const errorMsg = res.data && res.data.message ? res.data.message : '请求失败';
          console.error('请求错误:', {url: fullUrl, statusCode: res.statusCode, errorMsg});
          Taro.showToast({
            title: errorMsg,
            icon: 'none',
          });
          reject(res.data || {error: '请求失败'});
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', {url: fullUrl, error: err});
        Taro.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
};

// 封装常用的请求方法
export const get = (url, params = {}) => {
  return request(url, { method: 'GET', data: params });
};

export const post = (url, data = {}) => {
  return request(url, { method: 'POST', data });
};

export const put = (url, data = {}) => {
  return request(url, { method: 'PUT', data });
};

export const del = (url) => {
  return request(url, { method: 'DELETE' });
}; 