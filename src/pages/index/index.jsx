import { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, Input, Image, Text } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { get } from '../../utils/request';
import { POST_URLS, RESOURCE_URL } from '../../constants/api';
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

      try {
        // 尝试调用真实API获取数据
        const response = await get(POST_URLS.LIST, params);
        
        // 处理响应数据
        if (response) {
          const { diaries: newDiaries, total: totalCount } = response;
          
          // 转换为组件需要的格式，并处理图片URL确保完整路径
          const formattedDiaries = newDiaries.map(diary => {
            // 使用服务器返回的头像，包括默认头像
            const avatarUrl = getFullResourceUrl(diary.author.avatarUrl);
            
            return {
              postId: diary.id,
              title: diary.title,
              author: diary.author.nickname,
              authorId: diary.author.id,
              coverImage: getFullResourceUrl(diary.coverImage),
              status: 'approved', // 此API只返回已审核通过的
              authorAvatar: avatarUrl,
              viewCount: diary.viewCount || Math.floor(Math.random() * 1000)
            };
          });
          
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
      } catch (apiError) {
        console.error('API请求失败，使用模拟数据', apiError);
        
        // 使用模拟数据
        const mockDiaries = [
          {
            postId: 1,
            title: '东京旅行记忆',
            author: '旅行爱好者',
            authorId: 101,
            coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
            viewCount: 328
          },
          {
            postId: 2,
            title: '巴黎印象',
            author: '摄影师小明',
            authorId: 102,
            coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            viewCount: 207
          },
          {
            postId: 3,
            title: '纽约文化之旅',
            author: '城市探索者',
            authorId: 103,
            coverImage: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
            viewCount: 156
          },
          {
            postId: 4,
            title: '泰国美食记',
            author: '美食家',
            authorId: 104,
            coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            viewCount: 432
          }
        ];
        
        const totalCount = 10; // 模拟总数
        
        if (refresh) {
          setDiaries(mockDiaries);
        } else {
          // 避免重复数据
          const newMockDiaries = mockDiaries.map(diary => ({
            ...diary,
            postId: diary.postId + (currentPage - 1) * pageSize
          }));
          setDiaries(prev => [...prev, ...newMockDiaries]);
        }
        
        setTotal(totalCount);
        setHasMore(currentPage * pageSize < totalCount);
        setPage(currentPage + 1);
        
        Taro.showToast({
          title: '使用模拟数据(开发模式)',
          icon: 'none',
          duration: 1500
        });
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

  // 处理点击游记
  const handlePostClick = (postId) => {
    Taro.navigateTo({
      url: `/pages/post/detail?id=${postId}`
    });
  };

  // 生成两列布局的数据
  const getColumnData = () => {
    const leftColumn = [];
    const rightColumn = [];
    
    diaries.forEach((diary, index) => {
      if (index % 2 === 0) {
        leftColumn.push(diary);
      } else {
        rightColumn.push(diary);
      }
    });
    
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = getColumnData();

  // 渲染单个卡片
  const renderCard = (diary) => (
    <View 
      className="card-item" 
      key={diary.postId} 
      onClick={() => handlePostClick(diary.postId)}
    >
      <Image 
        className="card-image" 
        mode="aspectFill"
        src={diary.coverImage || 'https://example.com/placeholder.jpg'} 
      />
      <View className="card-content">
        <Text className="card-title">{diary.title}</Text>
        <View className="card-footer">
          <View className="card-author">
            <Image 
              className="author-avatar" 
              src={diary.authorAvatar} 
              mode="aspectFill"
            />
            <Text className="author-name">{diary.author}</Text>
          </View>
          <View className="view-count">
            <Text className="view-icon">👁️</Text>
            <Text>{diary.viewCount || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="index-container">
      <View className="search-container">
        <View className="search-bar">
          <View className="search-icon">🔍</View>
          <Input
            className="search-input"
            placeholder="搜索目的地、游记、攻略"
            value={keyword}
            onInput={handleKeywordChange}
            onConfirm={handleKeywordConfirm}
            confirmType="search"
          />
        </View>
      </View>

      <ScrollView
        className="content-container"
        scrollY
        enableBackToTop
      >
        <View className="featured-section">
          <View className="section-title">热门推荐</View>
        </View>
        
        <View className="cards-container">
          <View className="cards-column">
            {leftColumn.map(renderCard)}
          </View>
          <View className="cards-column">
            {rightColumn.map(renderCard)}
          </View>
        </View>
        
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
