// @noflow
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
    ],
  },
  entry: {
    demo: ['./demo/demo/index.js'],
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
  ],
};

module.exports = config;
