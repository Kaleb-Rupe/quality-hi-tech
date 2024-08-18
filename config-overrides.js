const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = function override(config, env) {
  if (env === 'production') {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
      }),
      new ImageminPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        pngquant: {
          quality: '95-100'
        }
      })
    );
  }
  
  return config;
};