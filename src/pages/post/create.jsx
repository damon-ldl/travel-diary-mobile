import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, Video } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { post, get, put, isLoggedIn, getToken } from '../../utils/request';
import { POST_URLS, BASE_URL } from '../../constants/api';
import './create.scss';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
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
        setVideoUrl(res.videoUrl || '');
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
        console.log('选择图片成功:', res.tempFilePaths);
        // 不再过滤图片格式，接受所有选择的图片
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
  
  // 选择视频
  const handleChooseVideo = () => {
    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        console.log('选择视频成功:', res.tempFilePath);
        // 不再检查视频格式，直接接受
        setVideoUrl(res.tempFilePath);
      }
    });
  };
  
  // 移除视频
  const handleRemoveVideo = () => {
    setVideoUrl('');
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
    
    if (images.length === 0) {
      Taro.showToast({
        title: '请至少上传一张图片',
        icon: 'none',
      });
      return;
    }
    
    // 检查登录状态
    if (!isLoggedIn()) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
      });
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }

    try {
      setLoading(true);

      // 改为实际上传图片，不使用测试模式
      const isTestMode = false; 
      
      // 准备图片数据
      let uploadedImages = [];
      
      if (isTestMode) {
        // 测试模式：为每张本地图片生成模拟URL
        uploadedImages = images.map((img, index) => 
          `https://example.com/mock-image-${index}.jpg`);
        console.log('测试模式：使用模拟图片URL', uploadedImages);
      } else {
        // 生产模式：实际上传图片
        for (let i = 0; i < images.length; i++) {
          try {
            console.log(`开始上传第${i+1}张图片...`, images[i]);
            const uploadRes = await Taro.uploadFile({
              url: `${BASE_URL}/upload`,
              filePath: images[i],
              name: 'files',
              header: {
                'Authorization': `Bearer ${getToken()}`
              },
              formData: {
                type: 'image'
              }
            });
            
            console.log('图片上传响应:', uploadRes);
            
            if (uploadRes.statusCode === 200) {
              const data = JSON.parse(uploadRes.data);
              console.log('解析上传响应:', data);
              // 服务器返回的是filePaths数组，我们取第一个
              if (data.filePaths && data.filePaths.length > 0) {
                uploadedImages.push(data.filePaths[0]);
              }
            } else {
              throw new Error(`图片上传失败: ${uploadRes.statusCode}`);
            }
          } catch (error) {
            console.error('上传图片失败:', error);
            Taro.showToast({
              title: '图片上传失败，请重试',
              icon: 'none',
            });
            setLoading(false);
            return;
          }
        }
        console.log('所有图片上传完成:', uploadedImages);
      }
      
      // 确保有图片数据
      if (uploadedImages.length === 0) {
        Taro.showToast({
          title: '无法处理图片，请重试',
          icon: 'none',
        });
        setLoading(false);
        return;
      }
      
      // 处理视频（测试模式使用模拟URL）
      let videoUrlOnServer = null;
      if (videoUrl) {
        if (isTestMode) {
          videoUrlOnServer = 'https://example.com/mock-video.mp4';
          console.log('测试模式：使用模拟视频URL', videoUrlOnServer);
        } else {
          try {
            console.log('开始上传视频...', videoUrl);
            const uploadRes = await Taro.uploadFile({
              url: `${BASE_URL}/upload`,
              filePath: videoUrl,
              name: 'files',
              header: {
                'Authorization': `Bearer ${getToken()}`
              },
              formData: {
                type: 'video'
              }
            });
            
            console.log('视频上传响应:', uploadRes);
            
            if (uploadRes.statusCode === 200) {
              const data = JSON.parse(uploadRes.data);
              console.log('解析视频上传响应:', data);
              // 服务器返回的是filePaths数组，我们取第一个
              if (data.filePaths && data.filePaths.length > 0) {
                videoUrlOnServer = data.filePaths[0];
              }
            } else {
              console.error('视频上传失败:', uploadRes);
              // 视频上传失败不阻止整个过程，只是不包含视频
              Taro.showToast({
                title: '视频上传失败，将不包含视频',
                icon: 'none',
                duration: 2000
              });
            }
          } catch (error) {
            console.error('上传视频失败:', error);
            // 视频上传失败不阻止整个过程
            Taro.showToast({
              title: '视频上传失败，将不包含视频',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
      
      // 准备提交的数据
      const postData = {
        title,
        content,
        images: uploadedImages,
        video: videoUrlOnServer
      };

      console.log('准备提交的游记数据:', postData);

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
      console.error('提交游记失败:', error);
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
      
      <View className="form-item">
        <Text className="form-label">视频(可选)</Text>
        <View className="video-picker">
          {videoUrl ? (
            <View className="video-item">
              <Video
                src={videoUrl}
                controls
                className="picked-video"
              />
              <View 
                className="remove-video" 
                onClick={handleRemoveVideo}
              >
                ×
              </View>
            </View>
          ) : (
            <View className="add-video" onClick={handleChooseVideo}>
              <Text className="add-icon">+</Text>
              <Text className="add-text">添加视频</Text>
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