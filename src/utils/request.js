import Taro from '@tarojs/taro';

// 获取存储的令牌
export const getToken = () => {
  return Taro.getStorageSync('token');
};

// 设置令牌到本地存储
export const setToken = (token) => {
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
  // 默认配置
  const defaultOptions = {
    url,
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
    },
  };

  // 合并配置
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // 如果有令牌，添加到请求头
  const token = getToken();
  if (token) {
    mergedOptions.header.Authorization = `Bearer ${token}`;
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    Taro.request({
      ...mergedOptions,
      success: (res) => {
        // 请求成功(HTTP状态码为200)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，需要重新登录
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
          Taro.showToast({
            title: res.data.message || '请求失败',
            icon: 'none',
          });
          reject(res.data);
        }
      },
      fail: (err) => {
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