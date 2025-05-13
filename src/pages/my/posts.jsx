import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, navigateTo } from '@tarojs/taro';
import { get, del, getUserInfo, isLoggedIn } from '../../utils/request';
import { POST_URLS, RESOURCE_URL } from '../../constants/api';
import PostItem from '../../components/PostItem';
import './posts.scss';

// 处理资源URL，确保完整路径
const getFullResourceUrl = (url) => {
  if (!url) return '';
  
  // 如果是完整URL则直接返回
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
  
  // 正常情况下拼接完整URL
  return `${RESOURCE_URL}${normalizedUrl}`;
};

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [hasMore, setHasMore] = useState(true);

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 跳转到游记发布页面
  const handlePublish = () => {
    navigateTo({
      url: '/pages/post/create'
    });
  };

  // 获取当前用户的游记列表
  const fetchMyPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        // 重置分页
        setPagination(prev => ({
          ...prev,
          page: 1
        }));
      } else {
        setLoading(true);
      }

      // 获取当前登录用户
      const userInfo = getUserInfo();
      if (!userInfo) {
        Taro.showToast({
          title: '请先登录',
          icon: 'none',
        });
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/login/index',
          });
        }, 1500);
        return;
      }

      console.log('正在获取用户游记列表...');
      // 请求我的游记列表，使用专门的我的游记接口
      const res = await get(`${POST_URLS.MY_POSTS}?page=${pagination.page}&pageSize=${pagination.pageSize}`);
      console.log('获取用户游记响应:', res);

      if (res && res.diaries) {
        // 处理返回的游记列表，添加完整的图片URL
        const processedDiaries = res.diaries.map(diary => ({
          ...diary,
          // 处理封面图片URL
          coverImage: diary.coverImage ? getFullResourceUrl(diary.coverImage) : null
        }));
        
        // 更新分页信息
        setPagination({
          page: res.page,
          pageSize: res.pageSize,
          total: res.total
        });

        // 判断是否还有更多数据
        setHasMore(res.total > res.page * res.pageSize);
        
        // 如果是刷新，直接替换数据
        if (refresh) {
          setPosts(processedDiaries);
        } else {
          // 否则追加数据
          setPosts(prev => [...prev, ...processedDiaries]);
        }
      } else {
        console.warn('返回的响应中没有diaries字段或为空');
        if (refresh) {
          setPosts([]);
        }
      }
    } catch (error) {
      console.log('获取游记列表:', error);
      if (refresh) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // 停止下拉刷新状态
      if (refresh) {
        Taro.stopPullDownRefresh();
      }
    }
  }, [pagination.page, pagination.pageSize]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  }, [loading, hasMore]);

  // 处理删除游记
  const handleDelete = useCallback(async (post) => {
    try {
      setLoading(true);
      // 获取实际ID
      const actualId = post.id;
      
      // 调用删除接口
      await del(POST_URLS.DETAIL(actualId));
      
      Taro.showToast({
        title: '删除成功',
        icon: 'success',
      });
      
      // 从列表中移除已删除的游记
      setPosts(prevPosts => prevPosts.filter(item => item.id !== actualId));
      // 更新总数
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('删除游记失败:', error);
      Taro.showToast({
        title: '删除失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理编辑游记
  const handleEdit = useCallback((post) => {
    // 只有待审核或未通过的游记可以编辑
    if (post.status === 'pending' || post.status === 'rejected') {
      navigateTo({
        url: `/pages/post/create?id=${post.id}`
      });
    } else {
      Taro.showToast({
        title: '已通过审核的游记不可编辑',
        icon: 'none',
      });
    }
  }, []);

  // 页面加载时检查登录状态并获取游记列表
  useEffect(() => {
    if (!isLoggedIn()) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    fetchMyPosts();
  }, [fetchMyPosts]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchMyPosts(true);
  });

  // 统计不同状态的游记数量
  const statusCounts = {
    total: pagination.total,
    pending: posts.filter(post => post.status === 'pending').length,
    approved: posts.filter(post => post.status === 'approved').length,
    rejected: posts.filter(post => post.status === 'rejected').length
  };

  return (
    <View className="my-posts-container">
      {/* 顶部导航栏 */}
      <View className="header">
        <View className="back-button" onClick={handleBack}>
          <Text className="back-icon">←</Text>
        </View>
        <Text className="header-title">我的游记</Text>
        <View className="header-placeholder"></View>
      </View>

      {/* 状态统计栏 */}
      <View className="status-summary">
        <View className="status-item">
          <Text className="status-count">{statusCounts.total}</Text>
          <Text className="status-label">全部</Text>
        </View>
        <View className="status-item">
          <Text className="status-count status-pending-text">{statusCounts.pending}</Text>
          <Text className="status-label">待审核</Text>
        </View>
        <View className="status-item">
          <Text className="status-count status-approved-text">{statusCounts.approved}</Text>
          <Text className="status-label">已通过</Text>
        </View>
        <View className="status-item">
          <Text className="status-count status-rejected-text">{statusCounts.rejected}</Text>
          <Text className="status-label">未通过</Text>
        </View>
      </View>

      <ScrollView
        className="post-list"
        scrollY
        enableBackToTop
        onScrollToLower={loadMore}
      >
        {posts.length > 0 ? (
          posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <View className="empty-list">
            <Text className="empty-text">您还没有发布过游记</Text>
          </View>
        )}
        
        {loading && !refreshing && (
          <View className="loading">加载中...</View>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <View className="no-more">没有更多了</View>
        )}
      </ScrollView>

      {/* 发布按钮 */}
      <View className="publish-button" onClick={handlePublish}>
        <Text className="publish-icon">+</Text>
        <Text className="publish-text">发布游记</Text>
      </View>
    </View>
  );
};

export default MyPosts; 