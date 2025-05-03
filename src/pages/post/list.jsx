import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { get, isLoggedIn } from '../../utils/request';
import { POST_URLS } from '../../constants/api';
import PostItem from '../../components/PostItem';
import './list.scss';

const PAGE_SIZE = 10;

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 获取游记列表
  const fetchPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await get(POST_URLS.LIST, {
        page: pageNum,
        limit: PAGE_SIZE,
      });

      if (res && res.data) {
        if (refresh) {
          setPosts(res.data);
        } else {
          setPosts(prev => [...prev, ...res.data]);
        }
        
        // 判断是否还有更多数据
        setHasMore(res.data.length === PAGE_SIZE);
        setPage(pageNum);
      }
    } catch (error) {
      Taro.showToast({
        title: '获取游记列表失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // 停止下拉刷新状态
      if (refresh) {
        Taro.stopPullDownRefresh();
      }
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
    
    fetchPosts(1, true);
  }, [fetchPosts]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchPosts(1, true);
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  });

  return (
    <View className="post-list-container">
      <ScrollView
        className="post-list"
        scrollY
        enableBackToTop
      >
        {posts.map(post => (
          <PostItem key={post.postId} post={post} />
        ))}
        
        {loading && !refreshing && (
          <View className="loading-more">加载更多...</View>
        )}
        
        {!hasMore && posts.length > 0 && (
          <View className="no-more">没有更多游记了</View>
        )}
        
        {!loading && posts.length === 0 && (
          <View className="empty-list">暂无游记，快来发布第一篇吧</View>
        )}
      </ScrollView>
    </View>
  );
};

export default PostList; 