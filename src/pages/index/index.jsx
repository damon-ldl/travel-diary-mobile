import { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, Input } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { get } from '../../utils/request';
import { POST_URLS, RESOURCE_URL } from '../../constants/api';
import PostItem from '../../components/PostItem';
import './index.scss';

// 处理资源URL，确保完整路径
const getFullResourceUrl = (url) => {
  if (!url) return '';
  
  // 如果是完整URL则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 确保url以/开头
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${RESOURCE_URL}${normalizedUrl}`;
};

const Index = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const isFirstLoad = useRef(true);

  // 获取游记列表
  const fetchDiaries = useCallback(async (refresh = false) => {
    try {
      // 如果刷新，重置页码
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const currentPage = refresh ? 1 : page;
      const params = {
        page: currentPage,
        pageSize,
        keyword: searchKeyword
      };

      console.log('正在获取游记列表', params);

      // 调用真实API获取数据
      const response = await get(POST_URLS.LIST, params);
      
      // 处理响应数据
      if (response) {
        const { diaries: newDiaries, total: totalCount } = response;
        
        // 转换为组件需要的格式，并处理图片URL确保完整路径
        const formattedDiaries = newDiaries.map(diary => ({
          postId: diary.id,
          title: diary.title,
          author: diary.author.nickname,
          authorId: diary.author.id,
          coverImage: getFullResourceUrl(diary.coverImage),
          status: 'approved', // 此API只返回已审核通过的
          authorAvatar: getFullResourceUrl(diary.author.avatarUrl)
        }));
        
        // 如果是刷新，直接替换数据
        if (refresh) {
          setDiaries(formattedDiaries);
        } else {
          // 否则追加数据
          setDiaries(prev => [...prev, ...formattedDiaries]);
        }
        
        setTotal(totalCount);
        setHasMore(currentPage * pageSize < totalCount);
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('获取游记列表失败', error);
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
  }, [page, pageSize, searchKeyword]);

  // 页面加载时获取游记列表
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchDiaries(true);
      isFirstLoad.current = false;
    }
  }, []);  // 移除fetchDiaries依赖，避免无限循环

  // 当搜索关键词改变时重新获取数据
  useEffect(() => {
    if (!isFirstLoad.current) {
      fetchDiaries(true);
    }
  }, [searchKeyword]);

  // 下拉刷新
  usePullDownRefresh(() => {
    fetchDiaries(true);
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading) {
      fetchDiaries();
    }
  });

  // 处理搜索输入
  const handleKeywordChange = (e) => {
    setKeyword(e.detail.value);
  };

  // 执行搜索
  const handleSearch = () => {
    setSearchKeyword(keyword);
    fetchDiaries(true);
  };

  // 处理搜索框回车事件
  const handleKeywordConfirm = () => {
    handleSearch();
  };

  return (
    <View className="index-container">
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索游记标题或作者"
          value={keyword}
          onInput={handleKeywordChange}
          onConfirm={handleKeywordConfirm}
          confirmType="search"
        />
        <View className="search-btn" onClick={handleSearch}>搜索</View>
      </View>

      <ScrollView
        className="diary-list"
        scrollY
        enableBackToTop
      >
        {diaries.map(diary => (
          <PostItem key={diary.postId} post={diary} />
        ))}
        
        {loading && !refreshing && (
          <View className="loading-more">正在加载更多...</View>
        )}
        
        {!hasMore && diaries.length > 0 && (
          <View className="no-more">已经到底啦~</View>
        )}
        
        {!loading && diaries.length === 0 && (
          <View className="empty-list">暂无游记，快来发布第一篇吧</View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
