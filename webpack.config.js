const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const env = process.env.NODE_ENV;

const config = {
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
    ],
  },
  entry: {
    demo: ['./demo/index.js'],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'demo.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './demo/index.html',
    }),
  ],
};

module.exports = config;
