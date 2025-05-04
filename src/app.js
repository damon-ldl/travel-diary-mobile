import { useLaunch } from '@tarojs/taro'
// 移除直接导入antd-mobile全局样式
import './app.scss'

function App({ children }) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}
  
export default App
