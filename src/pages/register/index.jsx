import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MOCK_USERS } from '../../utils/mockData';
import './index.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理用户名变化
  const handleUsernameChange = (e) => {
    setUsername(e.detail.value);
  };

  // 处理密码变化
  const handlePasswordChange = (e) => {
    setPassword(e.detail.value);
  };

  // 处理确认密码变化
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.detail.value);
  };

  // 执行注册
  const handleRegister = async () => {
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

    if (password !== confirmPassword) {
      Taro.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
      });
      return;
    }

    // 检查用户名是否已存在
    if (MOCK_USERS.some(user => user.username === username)) {
      Taro.showToast({
        title: '用户名已存在',
        icon: 'none',
      });
      return;
    }

    try {
      setLoading(true);
      
      // 模拟注册
      setTimeout(() => {
        // 实际项目中这里应该发送请求到后端注册
        console.log('注册新用户:', {username, password});
        
        Taro.showToast({
          title: '注册成功，请登录',
          icon: 'success',
        });
  
        // 注册成功后跳转到登录页
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: error.message || '注册失败，请稍后再试',
        icon: 'none',
      });
      setLoading(false);
    }
  };

  // 返回登录页
  const goToLogin = () => {
    Taro.navigateBack();
  };

  return (
    <View className="register-container">
      <View className="register-header">
        <Text className="register-title">注册账号</Text>
        <Text className="register-subtitle">创建一个新账号开始您的旅行</Text>
      </View>

      <View className="register-form">
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

        <View className="form-item">
          <Text className="form-label">确认密码</Text>
          <Input
            className="form-input"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onInput={handleConfirmPasswordChange}
          />
        </View>

        <Button
          className="register-button"
          loading={loading}
          onClick={handleRegister}
        >
          注册
        </Button>

        <View className="register-footer">
          <Text className="login-link" onClick={goToLogin}>
            已有账号？返回登录
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

export default Register; 