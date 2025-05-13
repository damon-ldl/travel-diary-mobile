export default {
   logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
      open: true,
      port: 10086,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          pathRewrite: {
            '^/api': '/api'
          },
          onProxyReq: function(proxyReq, req, res) {
            console.log('代理请求:', req.method, req.url);
          },
          onError: function(err, req, res) {
            console.error('代理错误:', err);
          }
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          onProxyReq: function(proxyReq, req, res) {
            console.log('静态资源请求:', req.method, req.url);
          },
          onError: function(err, req, res) {
            console.error('静态资源请求错误:', err);
          }
        }
      }
    }
  }
}
