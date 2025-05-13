import { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { getUserInfo, clearToken, clearUserInfo, isLoggedIn } from '../../utils/request';
import { AUTH_URLS } from '../../constants/api';
import defaultAvatar from '../../assets/images/default-avatar.png';
import './index.scss';

const My = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查登录状态和获取用户信息
  const checkLoginStatus = async () => {
    console.log('开始检查登录状态和获取用户信息');
    try {
      setLoading(true);
      
      // 检查登录状态
      if (!isLoggedIn()) {
        console.log('用户未登录，准备跳转到登录页');
        redirectToLogin();
        return;
      }

      // 获取用户信息
      const user = getUserInfo();
      console.log('获取到的用户信息:', user);
      
      if (!user || !user.id) {
        console.log('用户信息无效，准备跳转到登录页');
        // 清除可能存在的无效数据
        clearToken();
        clearUserInfo();
        redirectToLogin();
        return;
      }

      // 确保头像URL是完整的
      const fullAvatarUrl = user.avatarUrl?.startsWith('http') 
        ? user.avatarUrl 
        : `${AUTH_URLS.BASE_URL}${user.avatarUrl}`;
      
      const updatedUserInfo = {
        ...user,
        avatarUrl: fullAvatarUrl || defaultAvatar
      };

      console.log('更新用户信息:', {
        id: updatedUserInfo.id,
        username: updatedUserInfo.username,
        hasAvatar: !!updatedUserInfo.avatarUrl
      });

      setUserInfo(updatedUserInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Taro.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  // 页面显示时检查登录状态
  useDidShow(() => {
    console.log('页面显示，开始检查登录状态');
    checkLoginStatus();
  });

  // 重定向到登录页
  const redirectToLogin = () => {
    console.log('准备跳转到登录页');
    // 使用 reLaunch 确保清除导航栈
    Taro.reLaunch({
      url: '/pages/login/index'
    });
  };

  // 处理退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认退出登录');
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
            Taro.reLaunch({
              url: '/pages/login/index'
            });
          }, 1500);
        }
      },
    });
  };

  // 跳转到我的游记列表
  const navigateToMyPosts = () => {
    if (!userInfo?.id) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    Taro.navigateTo({
      url: '/pages/my/posts',
    });
  };

  // 显示加载中状态
  if (loading) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  // 如果没有用户信息，显示一个提示
  if (!userInfo) {
    return (
      <View className="no-login-container">
        <Text className="no-login-text">请先登录</Text>
        <Button className="login-button" onClick={redirectToLogin}>
          去登录
        </Button>
      </View>
    );
  }

  return (
    <View className="my-container">
      <View className="user-info-section">
        <Image
          className="avatar"
          src={userInfo.avatarUrl || defaultAvatar}
          mode="aspectFill"
          onError={() => {
            console.log('头像加载失败，使用默认头像');
            setUserInfo(prev => ({
              ...prev,
              avatarUrl: defaultAvatar
            }));
          }}
        />
        <Text className="username">{userInfo.nickname || userInfo.username}</Text>
      </View>

      <View className="menu-section">
        <View className="menu-item" onClick={navigateToMyPosts}>
          <Text className="menu-icon">📝</Text>
          <Text className="menu-text">我的游记</Text>
          <Text className="menu-arrow">{'>'}</Text>
        </View>
      </View>

      <Button className="logout-button" onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  );
};

export default My; 