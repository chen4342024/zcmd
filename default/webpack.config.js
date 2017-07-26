"use strict";
// node 模块
const path = require('path');

// 依赖模块
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 全局变量
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');


module.exports = {
	//入口
	entry: {
		index: path.resolve(APP_PATH, 'js/index.js')
	},
	// 输出
	output: {
		path: BUILD_PATH,
		publicPath:"../",
		filename: 'js/[name].js'
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {}
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel-loader'
		}, {
			test: /\.(handlebars|hbs)$/,
			use: [{
				loader: 'handlebars-loader',
				options: {
					runtime: 'handlebars/dist/handlebars.runtime'
				}
			}]
		}, {
			test: /\.css$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [{
					loader: 'css-loader',
					options: {modules: false}
				}]
			})
		}, {
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: ["css-loader", "postcss-loader", "sass-loader"]
			})
		}, {
			test: /\.(jpg?g|png|gif|svg)$/,
			use: [{
				loader: "url-loader",
				options: {
					limit: '6080',
					name: 'img/[name].[ext]'
				}
			}]
		}, {
			test: /\.(htm|html)$/i,
			use: {
				loader: 'html-loader'
			}
		}, {
			test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
			loader: "file-loader",
			options: {
				name: 'fonts/[name].[ext]?[hash]'
			}
		}]
	},
	devServer: {
		historyApiFallback: true, //不跳转
		hot: true,
		inline: true, //实时刷新
		stats: 'errors-only'
	},


	devtool: 'eval-source-map',//配置生成Source Maps，选择合适的选项


	plugins: [
		new webpack.LoaderOptionsPlugin({
			test: /\.(htm|html)$/i,
			options: {
				htmlLoader: {
					ignoreCustomFragments: [/\{\{.*?}}/],
					root: path.resolve(__dirname, 'img'),
					attrs: [
						'img:src',
						'div:data-lazyload-src',
						'ul:data-lazyload-src',
						'li:data-lazyload-src',
						'img:data-lazyload-src',
					],
					minimize: false
				}
			}
		}),

		new ExtractTextPlugin({
			filename: 'css/[name].css',
			allChunks: false
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(APP_PATH, `pages/index.tpl.htm`),
			filename: `html/index.tpl.html`,
			chunks: ["index"],
			inject: 'body'
		})
	]
};
