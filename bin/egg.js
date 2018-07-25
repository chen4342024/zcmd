'use strict';

var chalk = require('chalk');
var Util = require('../libs/util');
var path = require('path');
var fs = require('fs');
const prompt = require('prompt');


var egg = {
    init: function() {
        var self = this;
        const toPath = process.cwd();
        if (!Util.isEmptyDir(toPath)) {
            console.log(chalk.red("当前文件夹不为空，请使用空目录执行此命令"));
            return;
        };
        prompt.message = "开始输入相关信息";
        prompt.start();
        prompt.get({
            properties: {
                name: {
                    type: 'string',
                    pattern: /^\w{0,1}[\w-]+$/,
                    required: true,
                    description: '项目名称',
                    message: '请填写项目名称'
                },
                version: {
                    description: '项目版本',
                    message: '请填写项目版本',
                    type: 'string',
                    pattern: /(\d\.)+/,
                    default: '1.0.0'
                },
                description: {
                    description: '项目简介',
                    message: '请填写项目简介',
                    type: 'string',
                    default: ""
                }
            }
        }, function(err, result) {
            self.copy(result);
        })
    },

    copy: function(options) {
        const toPath = process.cwd();
        const fromPath = path.resolve(__dirname, '../eggConfig');

        let fileList = [".editorconfig", "readme.md", "webpack.config.js"];
        Util.copyFiles(fileList, fromPath, toPath);

        //处理package.json
        handlePackageJson(fromPath, toPath, options);

        // 处理npmrc
        handleNpmrc(fromPath, toPath);

        // 创建目录
        Util.createDir(toPath, [
            'chore',
            'src',
            'src/pages',
            'src/pages/index',
            'src/pages/index/components',
            'src/pages/index/images',
        ]);

        //复制chore
        let chorePathFrom = path.resolve(fromPath, 'chore');
        let chorePathTo = path.join(toPath, "chore");
        Util.copyFiles(["config.js", "copydir.js", "generate-entry.js", "getBranch.js", "postcdn.js", "server.js"], chorePathFrom, chorePathTo);
    }
};

function handleNpmrc(fromPath, toPath) {
    var fromFile = path.join(fromPath, "npmrc.config.txt");
    Util.copy(fromFile, path.join(toPath, ".npmrc"));
}


function handlePackageJson(fromPath, toPath, options) {
    var packageJson = "package.json";
    var configFromPath = path.join(fromPath, packageJson);
    var configToPath = path.join(toPath, packageJson);
    var replaceValue = function(content, key, value) {
        var keyStr = Util.strTemplate('"{key}": ""', { key: key });
        var valueStr = Util.strTemplate('"{key}": "{value}"', { key: key, value: value });
        return content.replace(keyStr, valueStr)
    };

    Util.copy(configFromPath, configToPath, function(fileContent) {
        // var name = options.name;
        // var version = options.version;
        // var description = options.description || "";
        // fileContent = replaceValue(fileContent, "name", name);
        // fileContent = replaceValue(fileContent, "version", version);
        // fileContent = replaceValue(fileContent, "description", description);
        let fileContentObj = JSON.parse(fileContent);
        fileContentObj.name = options.name;
        fileContentObj.version = options.version;
        fileContentObj.description = options.description || '';
        return JSON.stringify(fileContentObj, undefined, '\t\t');
    });
}

module.exports = egg;