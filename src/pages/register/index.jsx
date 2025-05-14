import { useState } from 'react';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { post } from '../../utils/request';
import { AUTH_URLS } from '../../constants/api';
import defaultAvatar from '../../assets/images/default-avatar.png';
import './index.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 处理用户名变化
  const handleUsernameChange = (e) => {
    setUsername(e.detail.value);
    // 清除错误提示
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: null }));
    }
  };

  // 处理昵称变化
  const handleNicknameChange = (e) => {
    setNickname(e.detail.value);
    // 清除错误提示
    if (errors.nickname) {
      setErrors(prev => ({ ...prev, nickname: null }));
    }
  };

  // 处理密码变化
  const handlePasswordChange = (e) => {
    setPassword(e.detail.value);
    // 清除错误提示
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };

  // 处理确认密码变化
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.detail.value);
    // 清除错误提示
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: null }));
    }
  };

  // 选择头像
  const chooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        setAvatar(res.tempFilePaths[0]);
      }
    });
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    if (!nickname.trim()) {
      newErrors.nickname = '请输入昵称';
    }

    if (!password.trim()) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 执行注册
  const handleRegister = async () => {
    if (!validateForm()) {
      // 表单验证失败，显示第一个错误信息
      const firstError = Object.values(errors)[0];
      if (firstError) {
        Taro.showToast({
          title: firstError,
          icon: 'none',
        });
      }
      return;
    }

    try {
      setLoading(true);
      
      // 准备基本参数
      const params = {
        username,
        nickname,
        password
      };
      
      console.log('开始注册请求:', {
        url: AUTH_URLS.REGISTER,
        params: {
          ...params,
          password: '***' // 隐藏密码
        },
        hasAvatar: !!avatar
      });
      
      let response;
      
      // 如果用户选择了头像
      if (avatar) {
        console.log('上传头像和注册信息');
        
        // 使用 Taro.uploadFile 进行注册
        const uploadRes = await Taro.uploadFile({
          url: AUTH_URLS.REGISTER,
          filePath: avatar,
          name: 'avatar',
          formData: params,
          header: {
            //'content-type': 'multipart/form-data'
          }
        });
        
        console.log('上传响应状态:', uploadRes.statusCode);
        
        if (uploadRes.statusCode === 200) {
          response = JSON.parse(uploadRes.data);
          console.log('注册成功，响应数据:', {
            success: true,
            hasId: !!response?.id,
            hasAvatar: !!response?.avatarUrl
          });
        } else {
          throw new Error('注册失败');
        }
      } else {
        // 没有头像，直接发送注册请求
        response = await post(AUTH_URLS.REGISTER, params);
        console.log('注册成功，响应数据:', {
          success: true,
          hasId: !!response?.id,
          hasAvatar: !!response?.avatarUrl
        });
      }
      
      if (response && response.id) {
        Taro.showToast({
          title: '注册成功，请登录',
          icon: 'success',
        });
  
        // 注册成功后跳转到登录页
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        throw new Error('注册失败，请稍后再试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      
      // 处理特定的错误消息
      let errorMsg = error?.error || '注册失败，请稍后再试';
      
      // 处理特定的错误类型
      if (error.statusCode === 413) {
        errorMsg = '头像文件太大，请选择小于2MB的图片';
      } else if (error.statusCode === 415) {
        errorMsg = '不支持的图片格式，请选择jpg、png或gif格式';
      }
      
      Taro.showToast({
        title: errorMsg,
        icon: 'none',
      });
      
      // 处理特定的错误
      if (errorMsg.includes('用户名已被使用')) {
        setErrors(prev => ({ ...prev, username: '用户名已被使用' }));
      } else if (errorMsg.includes('昵称已被占用')) {
        setErrors(prev => ({ ...prev, nickname: '昵称已被占用' }));
      }
    } finally {
      setLoading(false);
    }
  };

  // 返回登录页
  const goToLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    });
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
            className={`form-input ${errors.username ? 'input-error' : ''}`}
            placeholder="请输入用户名"
            value={username}
            onInput={handleUsernameChange}
          />
          {errors.username && (
            <Text className="error-text">{errors.username}</Text>
          )}
        </View>

        <View className="form-item">
          <Text className="form-label">昵称</Text>
          <Input
            className={`form-input ${errors.nickname ? 'input-error' : ''}`}
            placeholder="请输入昵称"
            value={nickname}
            onInput={handleNicknameChange}
          />
          {errors.nickname && (
            <Text className="error-text">{errors.nickname}</Text>
          )}
        </View>

        <View className="form-item">
          <Text className="form-label">密码</Text>
          <Input
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            type="password"
            placeholder="请输入密码"
            value={password}
            onInput={handlePasswordChange}
          />
          {errors.password && (
            <Text className="error-text">{errors.password}</Text>
          )}
        </View>

        <View className="form-item">
          <Text className="form-label">确认密码</Text>
          <Input
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onInput={handleConfirmPasswordChange}
          />
          {errors.confirmPassword && (
            <Text className="error-text">{errors.confirmPassword}</Text>
          )}
        </View>

        <View className="form-item avatar-item">
          <Text className="form-label">头像（可选）</Text>
          <View className="avatar-options">
            <View className="avatar-preview-container">
              <Image 
                className="avatar-preview" 
                src={avatar || defaultAvatar}
                mode="aspectFill"
              />
            </View>
            <View className="avatar-actions">
              <Button 
                className="avatar-action-btn"
                onClick={chooseAvatar}
              >
                {avatar ? '重新选择' : '上传头像'}
              </Button>
            </View>
          </View>
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