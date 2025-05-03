import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { isLoggedIn } from '../../utils/request';
import { MOCK_POSTS } from '../../utils/mockData';
import PostItem from '../../components/PostItem';
import './index.scss';

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 获取游记列表
  const fetchPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 使用模拟数据
      setTimeout(() => {
        setPosts(MOCK_POSTS);
        setLoading(false);
        setRefreshing(false);
        
        // 停止下拉刷新状态
        if (refresh) {
          Taro.stopPullDownRefresh();
        }
      }, 1000); // 模拟网络延迟
    } catch (error) {
      Taro.showToast({
        title: '获取游记列表失败',
        icon: 'none',
      });
      setLoading(false);
      setRefreshing(false);
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
    
    fetchPosts(true);
  }, [fetchPosts]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchPosts(true);
  });

  return (
    <View className="index-container">
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
        
        {!loading && posts.length === 0 && (
          <View className="empty-list">暂无游记，快来发布第一篇吧</View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
