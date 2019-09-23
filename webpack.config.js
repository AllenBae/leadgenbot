const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const commonWebpackSetting = {
  output: {
    filename: '[name].js',
    path: __dirname + '/bundle'
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-env'],
              ignore: [/node_modules/]
            },
          }
        ],
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/[hash].[ext]'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=./assets/[hash].[ext]'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=./assets/[hash].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=./assets/[hash].[ext]'
      }
    ],
  }
};

const managerWebpackSetting = Object.assign({}, commonWebpackSetting, {
  target: 'web',
  entry: {
    manager: './manager/index.jsx'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'FB_APP_ID': JSON.stringify(process.env.FB_APP_ID),
        'FB_APP_SECRET': JSON.stringify(process.env.FB_APP_SECRET),
        'HEROKU_APP_NAME': JSON.stringify(process.env.HEROKU_APP_NAME),
        'HEROKU_LOCAL_URL': JSON.stringify(process.env.HEROKU_LOCAL_URL),
        'REDISCLOUD_URL': JSON.stringify(process.env.REDISCLOUD_URL)
      }
    }),
  ],
  optimization: {
    splitChunks: {
      name: 'manager-static',
      filename: 'manager-static.js',
      cacheGroups: {
        node_vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
        }
      }
    }
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
});

if (process.env.NODE_ENV == 'production') {
  managerWebpackSetting.plugins.push(new UglifyJsPlugin());
} else {
  managerWebpackSetting.plugins.push(
    new WebpackShellPlugin({
      onBuildEnd: ['./tools/start-dev-server.sh']
    })
  );
}

module.exports = managerWebpackSetting;
