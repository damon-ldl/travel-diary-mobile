module.exports = {
  mini: {
    // 解决antd-mobile的样式引入问题
    webpackChain(chain) {
      chain.merge({
        module: {
          rule: {
            styleLoader: {
              test: /\.css$/i,
              use: [
                {
                  loader: 'style-loader',
                },
                {
                  loader: 'css-loader',
                },
              ],
            },
          },
        },
      })
    },
    // 增加prebundle配置
    prebundle: {
      enable: false // 禁用prebundle以解决模块加载问题
    }
  }
} 