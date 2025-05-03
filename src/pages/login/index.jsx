import { useState, useEffect } from 'react';
import { View, Text, Input, Button, Checkbox, Label } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { setToken, setUserInfo, post } from '../../utils/request';
import { AUTH_URLS } from '../../constants/api';
import './index.scss';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // 页面加载时检查是否有保存的登录信息
  useEffect(() => {
    const savedCredentials = Taro.getStorageSync('savedCredentials');
    if (savedCredentials) {
      setUsername(savedCredentials.username || '');
      setPassword(savedCredentials.password || '');
      setRememberMe(true);
      setIsAutoFilled(true);
    }
  }, []);

  // 处理用户名变化
  const handleUsernameChange = (e) => {
    setUsername(e.detail.value);
    if (isAutoFilled) setIsAutoFilled(false);
  };

  // 处理密码变化
  const handlePasswordChange = (e) => {
    setPassword(e.detail.value);
    if (isAutoFilled) setIsAutoFilled(false);
  };

  // 处理记住我复选框变化
  const handleRememberMeChange = (e) => {
    setRememberMe(e.detail.value);
  };

  // 执行登录
  const handleLogin = async () => {
    // 表单验证
    if (!username.trim()) {
      Taro.showToast({
        title: '请输入用户名',
        icon: 'none',
      });
      return;
    }

    if (!password.trim()) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none',
      });
      return;
    }

    try {
      setLoading(true);
      
      // 调用实际后端API
      const response = await post(AUTH_URLS.LOGIN, {
        username,
        password
      });
      
      console.log('登录响应:', response); // 添加日志，查看响应格式
      
      // 检查不同可能的token字段位置（适应不同API格式）
      let token = null;
      let userData = {};
      
      if (response) {
        // 尝试不同的token位置
        if (response.token) {
          token = response.token;
          userData = response;
        } else if (response.data && response.data.token) {
          token = response.data.token;
          userData = response.data;
        } else if (response.access_token) {
          token = response.access_token;
          userData = response;
        }
      }
      
      if (token) {
        console.log('成功获取到token:', token);
        
        // 如果用户选择记住密码，保存登录信息
        if (rememberMe) {
          Taro.setStorageSync('savedCredentials', {
            username,
            password
          });
        } else {
          // 如果不记住密码，清除之前可能保存的信息
          Taro.removeStorageSync('savedCredentials');
        }
        
        // 保存令牌和用户信息
        setToken(token);
        
        // 保存用户信息（字段名可能因后端API而异）
        setUserInfo({
          id: userData.id || userData.userId || '',
          username: userData.username || username,
          nickname: userData.nickname || userData.name || username,
          avatarUrl: userData.avatarUrl || userData.avatar || ''
        });

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        });

        // 登录成功后跳转到首页
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index',
          });
        }, 1500);
      } else {
        console.error('登录响应中没有找到token:', response);
        Taro.showToast({
          title: '登录失败，请检查用户名和密码',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({
        title: error.message || '登录失败，请稍后再试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  // 跳转到注册页
  const goToRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/index',
    });
  };

  return (
    <View className="login-container">
      <View className="login-header">
        <Text className="login-title">登录</Text>
        <Text className="login-subtitle">登录您的账号以继续使用</Text>
      </View>

      <View className="login-form">
        <View className="form-item">
          <Text className="form-label">用户名</Text>
          <Input
            className="form-input"
            placeholder="请输入用户名"
            value={username}
            onInput={handleUsernameChange}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">密码</Text>
          <Input
            className="form-input"
            type="password"
            placeholder="请输入密码"
            value={password}
            onInput={handlePasswordChange}
          />
        </View>

        <View className="form-options">
          <Label className="remember-me-label">
            <Checkbox 
              className="remember-me-checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            <Text className="remember-me-text">记住密码</Text>
          </Label>
          <Text className="forgot-password">忘记密码?</Text>
        </View>

        <Button
          className="login-button"
          loading={loading}
          onClick={handleLogin}
        >
          登录
        </Button>

        <View className="login-footer">
          <Text className="register-link" onClick={goToRegister}>
            没有账号？点击注册
          </Text>
        </View>
      </View>
      
      <View className="demo-account">
        <Text className="demo-tip">演示账号：admin</Text>
        <Text className="demo-tip">演示密码：admin</Text>
      </View>
    </View>
  );
};

export default Login; 