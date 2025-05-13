import { View, Text, Image } from '@tarojs/components';
import { navigateTo, showModal } from '@tarojs/taro';
import { RESOURCE_URL } from '../../constants/api';
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
 * @param {string} props.post.status 状态 (pending|approved|rejected)
 * @param {string} props.post.rejectReason 拒绝原因
 * @param {Function} props.onDelete 删除回调
 * @param {Function} props.onEdit 编辑回调
 */
const PostItem = ({ post, onDelete, onEdit }) => {
  const {
    postId,
    id,
    title,
    author = '匿名用户',
    createTime,
    createdAt,
    summary = '',
    coverImage,
    status = 'approved',
    reason,
    rejectReason
  } = post;

  const actualId = postId || id;
  const actualCreatedAt = createTime || createdAt;
  const actualRejectReason = rejectReason || reason;

  // 处理图片URL - 如果是相对路径，添加服务器基础URL
  const getFullImageUrl = (url) => {
    if (!url) return null;
    
    // 如果已经是完整URL（以http开头），则不做处理
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 确保url以/开头
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // 处理在使用相对路径API的情况
    if (!RESOURCE_URL) {
      // 如果RESOURCE_URL为空，说明我们使用的是相对路径
      return normalizedUrl; // 直接返回相对路径
    }
    
    // 如果是以/开头的相对路径，添加RESOURCE_URL前缀
    return `${RESOURCE_URL}${normalizedUrl}`;
  };

  // 获取完整的封面图片URL
  const fullCoverImage = getFullImageUrl(coverImage);

  // 格式化日期，如 "2024-05-20"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 获取状态对应的文本和样式类名
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { text: '审核中', className: 'status-pending' };
      case 'rejected':
        return { text: '未通过', className: 'status-rejected' };
      case 'approved':
        return { text: '已通过', className: 'status-approved' };
      default:
        return { text: '', className: '' };
    }
  };

  // 处理点击游记
  const handlePostClick = () => {
    navigateTo({
      url: `/pages/post/detail?id=${actualId}`
    });
  };

  // 处理编辑游记
  const handleEdit = (e) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发整个Item的点击事件
    if (typeof onEdit === 'function') {
      onEdit(post);
    } else {
      navigateTo({
        url: `/pages/post/create?id=${actualId}`
      });
    }
  };

  // 处理删除游记
  const handleDelete = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    showModal({
      title: '确认删除',
      content: '确定要删除该游记吗？操作无法撤销。',
      confirmColor: '#FF4949',
      success: (res) => {
        if (res.confirm && typeof onDelete === 'function') {
          onDelete(post);
        }
      }
    });
  };

  const { text: statusText, className: statusClassName } = getStatusInfo();

  return (
    <View className="post-item">
      <View className="post-content" onClick={handlePostClick}>
        {fullCoverImage && (
          <View className="post-cover">
            <Image 
              src={fullCoverImage} 
              mode="aspectFill" 
              className="cover-image" 
            />
          </View>
        )}
        <View className="post-info">
          <View className="post-header">
            <Text className="post-title">{title}</Text>
            {status !== 'approved' && (
              <Text className={`post-status ${statusClassName}`}>
                {statusText}
              </Text>
            )}
          </View>
          <Text className="post-summary">{summary}</Text>
          {status === 'rejected' && actualRejectReason && (
            <View className="reject-reason">
              <Text className="reason-label">拒绝原因: </Text>
              <Text className="reason-text">{actualRejectReason}</Text>
            </View>
          )}
          <View className="post-footer">
            <Text className="post-time">{formatDate(actualCreatedAt)}</Text>
          </View>
        </View>
      </View>

      <View className="post-actions">
        {(status === 'pending' || status === 'rejected') && (
          <View className="action-btn edit-btn" onClick={handleEdit}>
            编辑
          </View>
        )}
        <View className="action-btn delete-btn" onClick={handleDelete}>
          删除
        </View>
      </View>
    </View>
  );
};

export default PostItem; 