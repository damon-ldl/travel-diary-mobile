export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/register/index',
    'pages/post/list',
    'pages/post/detail',
    'pages/post/create',
    'pages/my/index',
    'pages/my/posts'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '旅游日记',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1677ff',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/post/create',
        text: '发布',
        iconPath: 'assets/icons/publish.png',
        selectedIconPath: 'assets/icons/publish-active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/icons/user.png',
        selectedIconPath: 'assets/icons/user-active.png'
      }
    ]
  }
})
