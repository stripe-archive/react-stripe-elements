// @noflow
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  mode: 'development',
  module: {
    rules: [{test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/}],
  },
  entry: {
    demo: ['./demo/demo/index.js'],
    async: ['./demo/async/main.js'],
    paymentIntents: ['./demo/paymentIntents/index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'index.html',
      template: './demo/demo/index.html',
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'async/index.html',
      template: './demo/async/index.html',
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'paymentIntents/index.html',
      template: './demo/paymentIntents/index.html',
    }),
  ],
};

module.exports = config;
