import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { get, getUserInfo, isLoggedIn } from '../../utils/request';
import { POST_URLS } from '../../constants/api';
import PostItem from '../../components/PostItem';
import './posts.scss';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 获取当前用户的游记列表
  const fetchMyPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
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

      // 请求我的游记列表
      const res = await get(POST_URLS.LIST, {
        author: userInfo.id,
      });

      if (res && res.data) {
        setPosts(res.data);
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
    
    fetchMyPosts();
  }, [fetchMyPosts]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchMyPosts(true);
  });

  return (
    <View className="my-posts-container">
      <ScrollView
        className="post-list"
        scrollY
        enableBackToTop
      >
        {posts.length > 0 ? (
          posts.map(post => (
            <PostItem key={post.postId} post={post} />
          ))
        ) : (
          <View className="empty-list">
            <Text className="empty-text">您还没有发布过游记</Text>
          </View>
        )}
        
        {loading && !refreshing && (
          <View className="loading">加载中...</View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyPosts; 