import { View, Text, Image } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';
import './index.scss';

/**
 * 游记列表项组件
 * @param {Object} props 
 * @param {Object} props.post 游记数据
 * @param {string} props.post.postId 游记ID
 * @param {string} props.post.title 标题
 * @param {string} props.post.author 作者
 * @param {string} props.post.createTime 创建时间
 * @param {string} props.post.summary 摘要
 * @param {string} props.post.coverImage 封面图片
 * @param {string} props.post.status 状态
 */
const PostItem = ({ post }) => {
  const {
    postId,
    title,
    author = '匿名用户',
    createTime,
    summary = '',
    coverImage,
    status = 'approved'
  } = post;

  // 格式化日期，如 "2024-05-20"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 处理点击游记
  const handlePostClick = () => {
    navigateTo({
      url: `/pages/post/detail?id=${postId}`
    });
  };

  return (
    <View className="post-item" onClick={handlePostClick}>
      {coverImage && (
        <View className="post-cover">
          <Image 
            src={coverImage} 
            mode="aspectFill" 
            className="cover-image" 
          />
        </View>
      )}
      <View className="post-content">
        <View className="post-header">
          <Text className="post-title">{title}</Text>
          {status !== 'approved' && (
            <Text className="post-status">
              {status === 'pending' ? '审核中' : status === 'rejected' ? '已拒绝' : ''}
            </Text>
          )}
        </View>
        <Text className="post-summary">{summary}</Text>
        <View className="post-footer">
          <Text className="post-author">{author}</Text>
          {createTime && <Text className="post-time">{formatDate(createTime)}</Text>}
        </View>
      </View>
    </View>
  );
};

export default PostItem; 