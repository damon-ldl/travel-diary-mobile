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
  
  // 处理在使用相对路径API的情况
  if (!RESOURCE_URL) {
    // 如果RESOURCE_URL为空，说明我们使用的是相对路径
    return normalizedUrl; // 直接返回相对路径
  }
  
  return `${RESOURCE_URL}${normalizedUrl}`;
};

const Index = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8); // 减小每页加载数量，使分页更明显
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loadError, setLoadError] = useState(false);
  const isFirstLoad = useRef(true);

  // 计算总页数
  const calculateTotalPages = useCallback((totalItems, size) => {
    return Math.ceil(totalItems / size);
  }, []);

  // 获取游记列表
  const fetchDiaries = useCallback(async (refresh = false) => {
    try {
      setLoadError(false);
      
      // 如果正在加载，直接返回
      if (loading || refreshing) {
        return;
      }
      
      // 如果刷新，重置页码
      const currentPage = refresh ? 1 : page;
      
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

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
          
          // 计算总页数
          const calculatedTotalPages = calculateTotalPages(totalCount, pageSize);
          setTotalPages(calculatedTotalPages);
          
          // 转换为组件需要的格式，并处理图片URL确保完整路径
          const formattedDiaries = newDiaries.map(diary => {
            // 使用服务器返回的头像，包括默认头像
            const avatarUrl = getFullResourceUrl(diary.author.avatarUrl);
            
            return {
              postId: diary.id,
              title: diary.title,
              brief: diary.content ? diary.content.substring(0, 60) + '...' : null,
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
          setHasMore(currentPage < calculatedTotalPages);
          setPage(currentPage + 1);
        }
      } catch (apiError) {
        console.error('API请求失败，使用模拟数据', apiError);
        
        // 使用模拟数据
        // 生成更多样化的模拟数据
        const getRandomMockDiaries = (count, startId) => {
          const locations = ['东京', '巴黎', '纽约', '曼谷', '伦敦', '悉尼', '罗马', '北京', '香港', '迪拜'];
          const topics = ['旅行记忆', '印象', '文化之旅', '美食记', '建筑巡礼', '艺术探访', '历史寻踪', '自然风光', '购物体验', '摄影集'];
          const authorList = ['旅行爱好者', '摄影师小明', '城市探索者', '美食家', '建筑师', '艺术家', '历史学家', '自然爱好者', '购物达人', '专业摄影师'];
          
          return Array.from({ length: count }, (_, i) => {
            const locationIndex = Math.floor(Math.random() * locations.length);
            const topicIndex = Math.floor(Math.random() * topics.length);
            const authorIndex = Math.floor(Math.random() * authorList.length);
            const id = startId + i;
            
            return {
              postId: id,
              title: `${locations[locationIndex]}${topics[topicIndex]}`,
              brief: `这是一篇关于${locations[locationIndex]}的${topics[topicIndex]}，包含了许多精彩内容和图片...`,
              author: authorList[authorIndex],
              authorId: 100 + authorIndex,
              coverImage: `https://source.unsplash.com/random/400x${200 + (id % 4) * 20}?travel,${locations[locationIndex].toLowerCase()}`,
              status: 'approved',
              authorAvatar: `https://randomuser.me/api/portraits/${id % 2 ? 'men' : 'women'}/${id % 10 + 1}.jpg`,
              viewCount: Math.floor(Math.random() * 1000)
            };
          });
        };
        
        const totalCount = 24; // 模拟总数
        const mockCount = Math.min(pageSize, totalCount - (currentPage - 1) * pageSize);
        const startId = (currentPage - 1) * pageSize + 1;
        
        const mockDiaries = getRandomMockDiaries(mockCount, startId);
        const calculatedTotalPages = calculateTotalPages(totalCount, pageSize);
        setTotalPages(calculatedTotalPages);
        
        if (refresh) {
          setDiaries(mockDiaries);
        } else {
          setDiaries(prev => [...prev, ...mockDiaries]);
        }
        
        setTotal(totalCount);
        setHasMore(currentPage < calculatedTotalPages);
        setPage(currentPage + 1);
        
        Taro.showToast({
          title: '使用模拟数据(开发模式)',
          icon: 'none',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('获取游记列表失败', error);
      setLoadError(true);
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
  }, [page, pageSize, searchKeyword, loading, refreshing, calculateTotalPages]);

  // 页面加载时获取游记列表
  useEffect(() => {
    fetchDiaries(true);
  }, []); // 移除 fetchDiaries 依赖，只在组件挂载时执行一次

  // 当搜索关键词改变时重新获取数据
  useEffect(() => {
    if (searchKeyword !== undefined) {
      fetchDiaries(true);
    }
  }, [searchKeyword]); // 只依赖 searchKeyword

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

  // 手动加载更多
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchDiaries();
    }
  };

  // 处理搜索输入
  const handleKeywordChange = (e) => {
    setKeyword(e.detail.value);
  };

  // 执行搜索
  const handleSearch = () => {
    setSearchKeyword(keyword);
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

  // 重试加载
  const handleRetry = () => {
    setLoadError(false);
    fetchDiaries(true);
  };

  // 生成两列布局的数据
  const getColumnData = () => {
    const leftColumn = [];
    const rightColumn = [];
    
    // 将游记数据按照交错方式分配到左右两列，实现瀑布流
    diaries.forEach((diary, index) => {
      // 根据游记标题长度和图片来分配，以形成更好的瀑布流效果
      // 这里我们使用简单的策略：按索引交错分配
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
        lazyLoad
      />
      <View className="card-content">
        <Text className="card-title">{diary.title}</Text>
        
        {/* 添加简短描述，如果有的话 */}
        {diary.brief && (
          <Text className="card-brief">{diary.brief}</Text>
        )}
        
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
        
        {/* 加载错误状态 */}
        {loadError && (
          <View className="loading-more" onClick={handleRetry}>
            加载失败，点击重试
          </View>
        )}
        
        {/* 加载中状态 */}
        {loading && !refreshing && (
          <View className="loading-container">
            <View className="loading-spinner"></View>
            <Text>正在加载更多...</Text>
          </View>
        )}
        
        {/* 加载更多按钮 */}
        {hasMore && !loading && diaries.length > 0 && !loadError && (
          <View className="load-more-btn" onClick={handleLoadMore}>
            点击加载更多
          </View>
        )}
        
        {/* 没有更多数据 */}
        {!hasMore && diaries.length > 0 && (
          <View className="no-more">已经到底啦~</View>
        )}
        
        {/* 空数据状态 */}
        {!loading && diaries.length === 0 && !loadError && (
          <View className="empty-list">暂无游记，快来发布第一篇吧</View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
