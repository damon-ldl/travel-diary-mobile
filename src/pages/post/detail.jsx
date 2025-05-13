import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button, Video } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getUserInfo, get } from '../../utils/request';
import { POST_URLS, RESOURCE_URL } from '../../constants/api';
import './detail.scss';

// 处理资源URL，确保完整路径
const getFullResourceUrl = (url) => {
  if (!url) return '';
  
  console.log('处理图片URL:', url);
  
  // 如果是完整URL则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('完整URL，直接返回:', url);
    return url;
  }
  
  // 获取travel-diary-server与本文件的相对路径
  const serverRelativePath = '../../..'; // 从当前文件到项目根目录，再到travel-diary-server
  
  // 确保url格式正确
  let normalizedUrl = url;
  if (url.startsWith('./')) {
    normalizedUrl = url.substring(2);
  } else if (url.startsWith('/')) {
    normalizedUrl = url.substring(1);
  }
  
  // 如果URL以uploads开头，使用特殊处理
  if (normalizedUrl.startsWith('uploads/') || normalizedUrl.startsWith('/uploads/')) {
    console.log('检测到uploads路径，特殊处理:', normalizedUrl);
    const cleanPath = normalizedUrl.replace(/^\/+/, '');
    return `${serverRelativePath}/${cleanPath}`;
  }
  
  // 处理在使用相对路径API的情况
  if (!RESOURCE_URL) {
    // 如果RESOURCE_URL为空，使用服务器相对路径
    console.log('RESOURCE_URL为空，使用服务器相对路径:', normalizedUrl);
    return `${serverRelativePath}/${normalizedUrl}`;
  }
  
  const fullUrl = `${RESOURCE_URL}${normalizedUrl}`;
  console.log('生成完整URL:', fullUrl);
  return fullUrl;
};

const PostDetail = () => {
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();

  // 获取游记详情
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const { id } = router.params;
        
        if (!id) {
          Taro.showToast({
            title: '参数错误',
            icon: 'none',
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
          return;
        }

        // 调用真实API获取游记详情
        console.log('获取游记详情, ID:', id);
        const response = await get(POST_URLS.DETAIL(id));
        console.log('获取到游记详情:', response);
        
        if (response) {
          // 处理图片URL确保完整路径
          const processedImages = response.images ? 
            response.images.map(img => getFullResourceUrl(img)) : [];
            
          console.log('处理后的图片列表:', processedImages);
            
          // 将API返回的数据转换为组件需要的格式
          const formattedDetail = {
            postId: response.id,
            title: response.title,
            content: response.content,
            author: response.author.nickname,
            authorId: response.author.id,
            authorAvatar: getFullResourceUrl(response.author.avatarUrl),
            createTime: response.createdAt,
            images: processedImages,
            videoUrl: response.videoUrl ? getFullResourceUrl(response.videoUrl) : null,
            status: response.status
          };
          
          setPostDetail(formattedDetail);
          
          // 判断是否是作者本人
          const currentUser = getUserInfo();
          if (currentUser && response.author.id === currentUser.id) {
            setIsOwner(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取游记详情失败', error);
        Taro.showToast({
          title: '获取游记详情失败',
          icon: 'none',
        });
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [router.params]);

  // 处理点赞
  const handleLike = async () => {
    try {
      // TODO: 调用真实的点赞API
      // const response = await post(POST_URLS.LIKE(postDetail.postId));
      
      // 暂时模拟点赞操作
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      
      Taro.showToast({
        title: liked ? '取消点赞成功' : '点赞成功',
        icon: 'success',
      });
    } catch (error) {
      Taro.showToast({
        title: '操作失败，请稍后再试',
        icon: 'none',
      });
    }
  };

  // 日期格式化
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View className="loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!postDetail) {
    return (
      <View className="error">
        <Text>获取游记详情失败</Text>
        <Button onClick={() => Taro.navigateBack()}>返回</Button>
      </View>
    );
  }

  const { title, content, author, createTime, images, videoUrl, status } = postDetail;

  return (
    <ScrollView className="post-detail-container" scrollY>
      <View className="post-header">
        <Text className="post-title">{title}</Text>
        {status !== 'approved' && (
          <Text className="post-status">
            {status === 'pending' ? '审核中' : status === 'rejected' ? '已拒绝' : ''}
          </Text>
        )}
      </View>

      <View className="post-info">
        <Text className="post-author">{author || '匿名用户'}</Text>
        <Text className="post-time">{formatDate(createTime)}</Text>
      </View>

      <View className="post-content">
        <Text className="content-text">{content}</Text>
        
        {/* 显示视频和图片 */}
        <View className="media-content">
          {/* 如果有视频，显示视频作为第一项 */}
          {videoUrl && (
            <View className="video-container">
              <Video
                src={videoUrl}
                className="content-video"
                showFullscreenBtn
                showPlayBtn
                controls
                poster={images && images.length > 0 ? images[0] : ''}
                id="diary-video"
              />
            </View>
          )}
          
          {/* 显示图片列表 */}
          {images && images.length > 0 && (
            <View className="image-list">
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  mode="widthFix"
                  className="content-image"
                  onClick={() => {
                    Taro.previewImage({
                      current: image,
                      urls: images,
                    });
                  }}
                  onError={(e) => {console.error('图片加载失败:', image, e)}}
                  showMenuByLongpress
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="post-actions">
        <Button
          className={`like-button ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '已点赞' : '点赞'} ({likeCount})
        </Button>
        
        {isOwner && (
          <Button
            className="edit-button"
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/post/create?id=${router.params.id}`,
              });
            }}
          >
            编辑
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default PostDetail; 