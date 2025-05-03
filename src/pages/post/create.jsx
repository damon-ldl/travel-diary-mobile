import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { post, get, put, isLoggedIn } from '../../utils/request';
import { POST_URLS } from '../../constants/api';
import './create.scss';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [postId, setPostId] = useState('');
  const router = useRouter();

  // 检查登录状态和是否是编辑模式
  useEffect(() => {
    if (!isLoggedIn()) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }

    // 如果有ID参数，说明是编辑模式
    const { id } = router.params;
    if (id) {
      setIsEdit(true);
      setPostId(id);
      fetchPostDetail(id);
    }
  }, [router.params]);

  // 获取游记详情
  const fetchPostDetail = async (id) => {
    try {
      setLoading(true);
      const res = await get(POST_URLS.DETAIL(id));
      if (res) {
        setTitle(res.title || '');
        setContent(res.content || '');
        setImages(res.images || []);
      }
    } catch (error) {
      Taro.showToast({
        title: '获取游记详情失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理标题变化
  const handleTitleChange = (e) => {
    setTitle(e.detail.value);
  };

  // 处理内容变化
  const handleContentChange = (e) => {
    setContent(e.detail.value);
  };

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setImages([...images, ...res.tempFilePaths]);
      },
    });
  };

  // 移除图片
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 预览图片
  const handlePreviewImage = (current) => {
    Taro.previewImage({
      current,
      urls: images,
    });
  };

  // 提交游记
  const handleSubmit = async () => {
    // 表单验证
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入标题',
        icon: 'none',
      });
      return;
    }

    if (!content.trim()) {
      Taro.showToast({
        title: '请输入游记内容',
        icon: 'none',
      });
      return;
    }

    try {
      setLoading(true);

      // 准备上传的数据
      // 注意：实际上传图片应该先上传到服务器，获取URL后再提交
      // 这里简化处理，假设直接提交图片路径
      const postData = {
        title,
        content,
        images,
      };

      let res;
      if (isEdit) {
        // 更新游记
        res = await put(POST_URLS.UPDATE(postId), postData);
        Taro.showToast({
          title: '游记更新成功',
          icon: 'success',
        });
      } else {
        // 发布新游记
        res = await post(POST_URLS.CREATE, postData);
        Taro.showToast({
          title: '游记发布成功，等待审核',
          icon: 'success',
        });
      }

      setTimeout(() => {
        if (isEdit) {
          // 编辑完成后返回详情页
          Taro.navigateBack();
        } else {
          // 发布新游记后跳转到我的游记列表
          Taro.switchTab({
            url: '/pages/my/index',
          });
        }
      }, 1500);
    } catch (error) {
      Taro.showToast({
        title: error.message || '操作失败，请稍后再试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="create-post-container">
      <View className="form-item">
        <Text className="form-label">标题</Text>
        <Input
          className="title-input"
          placeholder="请输入游记标题"
          value={title}
          onInput={handleTitleChange}
          maxlength={50}
        />
      </View>

      <View className="form-item">
        <Text className="form-label">内容</Text>
        <Textarea
          className="content-textarea"
          placeholder="请输入游记内容..."
          value={content}
          onInput={handleContentChange}
          maxlength={5000}
        />
      </View>

      <View className="form-item">
        <Text className="form-label">图片</Text>
        <View className="image-picker">
          {images.map((image, index) => (
            <View key={index} className="image-item">
              <Image
                src={image}
                mode="aspectFill"
                className="picked-image"
                onClick={() => handlePreviewImage(image)}
              />
              <View 
                className="remove-image" 
                onClick={() => handleRemoveImage(index)}
              >
                ×
              </View>
            </View>
          ))}
          
          {images.length < 9 && (
            <View className="add-image" onClick={handleChooseImage}>
              <Text className="add-icon">+</Text>
            </View>
          )}
        </View>
      </View>

      <Button
        className="submit-button"
        loading={loading}
        onClick={handleSubmit}
      >
        {isEdit ? '更新游记' : '发布游记'}
      </Button>

      <Text className="tips">提示：游记发布后需要审核通过才能公开显示</Text>
    </View>
  );
};

export default CreatePost; 