import { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getUserInfo, clearToken, clearUserInfo, isLoggedIn } from '../../utils/request';
import './index.scss';

const My = () => {
  const [userInfo, setUserInfo] = useState(null);

  // 页面加载时获取用户信息
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 检查登录状态
  const checkLoginStatus = () => {
    if (isLoggedIn()) {
      const user = getUserInfo();
      setUserInfo(user);
    } else {
      Taro.navigateTo({
        url: '/pages/login/index',
      });
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息和令牌
          clearToken();
          clearUserInfo();
          setUserInfo(null);

          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
          });

          // 跳转到登录页
          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/login/index',
            });
          }, 1500);
        }
      },
    });
  };

  // 跳转到我的游记列表
  const navigateToMyPosts = () => {
    Taro.navigateTo({
      url: '/pages/my/posts',
    });
  };

  if (!userInfo) {
    return (
      <View className="loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className="my-container">
      <View className="user-info-section">
        <Image
          className="avatar"
          src={userInfo.avatar || 'https://joeschmoe.io/api/v1/random'}
        />
        <Text className="username">{userInfo.username || '用户'}</Text>
      </View>

      <View className="menu-section">
        <View className="menu-item" onClick={navigateToMyPosts}>
          <Text className="menu-icon">📝</Text>
          <Text className="menu-text">我的游记</Text>
          <Text className="menu-arrow">›</Text>
        </View>

        {/* 可以添加更多菜单项，比如个人资料设置、关于我们等 */}
      </View>

      <Button className="logout-button" onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  );
};

export default My; 