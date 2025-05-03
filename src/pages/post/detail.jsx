import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getUserInfo, get } from '../../utils/request';
import { POST_URLS } from '../../constants/api';
import './detail.scss';

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
        const response = await get(POST_URLS.DETAIL(id));
        
        if (response) {
          // 将API返回的数据转换为组件需要的格式
          const formattedDetail = {
            postId: response.id,
            title: response.title,
            content: response.content,
            author: response.author.nickname,
            authorId: response.author.id,
            authorAvatar: response.author.avatarUrl,
            createTime: response.createdAt,
            images: response.images,
            videoUrl: response.videoUrl,
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

  const { title, content, author, createTime, images, status } = postDetail;

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
              />
            ))}
          </View>
        )}
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