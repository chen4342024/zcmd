'use strict';
const path = require('path');
const webpack = require('guido').webpack;
const setup = require('./chore/server');
const generateEntry = require('./chore/generate-entry');
const cfg = require('./chore/config');

const ROOT_PATH = process.cwd();
const SRC_PATH = path.join(ROOT_PATH, 'src');
const PAGE_PATH = path.join(ROOT_PATH, 'src/pages');

let entry = generateEntry();
let commonChunks = []; //获取当前的模块，用于CommonsChunkPlugin
for (let key in entry) {
    commonChunks.push(entry[key]);
}

const NODE_ENV = process.env.NODE_ENV;
let publicPath = '';
let useCdn = NODE_ENV == 'cdn';
if (useCdn) {
    publicPath = cfg.cdn.publicPath;
} else {
    //默认路径
    publicPath = "";
}


let webpackConfig = {

    entry: entry,

    output: {
        publicPath: publicPath
    },

    html: {
        beforeInitialization: function (HtmlWebpackPluginConfig) {
            let groupNameSplit = path.relative(PAGE_PATH, HtmlWebpackPluginConfig.template).split('/');
            let groupName = groupNameSplit[0] ? groupNameSplit[0] : '';

            let info = path.parse(HtmlWebpackPluginConfig.filename);
            let baseName = info.name !== 'index' ? `.${info.name}` : '';
            let newFileName = `${groupName}${baseName}.tpl.htm`;
            HtmlWebpackPluginConfig.filename = path.join(info.dir, newFileName);
        }
    },

    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'common',
        //     chunks: commonChunks,
        //     minChunks: 2,
        // })
    ],

    devServer: {
        // https: true,
        disableHostCheck: true,
        publicPath: publicPath,
        before: setup(publicPath),
        port: 9001
    },

    resolve: {
        alias: {
            'root': path.join(__dirname, 'src')
        }
    },

    stats: {
        children: false // 增加子级的信息
    }
};
if (process.env.GUIDO_ENV === 'production') {
    webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    webpackConfig.devtool = false;
}

module.exports = webpackConfig;

