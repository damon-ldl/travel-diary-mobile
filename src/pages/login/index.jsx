import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { setToken, setUserInfo } from '../../utils/request';
import { MOCK_USERS } from '../../utils/mockData';
import './index.scss';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理用户名变化
  const handleUsernameChange = (e) => {
    setUsername(e.detail.value);
  };

  // 处理密码变化
  const handlePasswordChange = (e) => {
    setPassword(e.detail.value);
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
      
      // 使用模拟数据验证登录
      const user = MOCK_USERS.find(
        user => user.username === username && user.password === password
      );
      
      if (user) {
        // 生成模拟token
        const token = `mock_token_${user.id}_${Date.now()}`;
        
        // 保存令牌和用户信息
        setToken(token);
        setUserInfo(user);

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
        Taro.showToast({
          title: '用户名或密码错误',
          icon: 'none',
        });
      }
    } catch (error) {
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