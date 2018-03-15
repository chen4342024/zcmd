'use strict';

var chalk = require('chalk');
var Util = require('../libs/util');
var path = require('path');
var fs = require('fs');
const prompt = require('prompt');


var copy = {
	initConfig: function () {
		var self = this;
		prompt.message = "开始输入相关信息";
		prompt.start();
		prompt.get({
			properties: {
				name: {
					description: '项目名称',
					type: 'string',
					pattern: /^\w{0,1}[\w-]+$/,
					required: true,
					message: '请填写项目名称'
				},
				version: {
					description: '项目版本',
					type: 'string',
					pattern: /(\d\.)+/,
					default: '1.0.0'
				},
				description: {
					description: '项目简介',
					type: 'string',
					default: ""
				}
			}
		}, function (err, result) {
			self.copy(result);
		})
	},
	copy: function (options) {
		var fromPath = path.resolve(__dirname, '../defaultConfig');
		const toPath = process.cwd();
		var fileList = [".editorconfig", ".npmrc", "readme.md", "webpack.config.js"];
		Util.copyFiles(fileList, fromPath, toPath);


		//处理package.json
		var packageJson = "package.json";
		var configPath = path.join(fromPath, packageJson);

		var replaceValue = function (content, key, value) {
			var keyStr = Util.strTemplate('"{key}": ""', {key: key});
			var valueStr = Util.strTemplate('"{key}": "{value}"', {key: key, value: value});
			return content.replace(keyStr, valueStr)
		};

		Util.copy(configPath, path.join(toPath, packageJson), function (fileContent) {
			var name = options.name;
			var version = options.version;
			var description = options.description || "";
			fileContent = replaceValue(fileContent, "name", name);
			fileContent = replaceValue(fileContent, "version", version);
			fileContent = replaceValue(fileContent, "description", description);
			return fileContent;
		});

		//复制chore
		let chorePathFrom = path.resolve(__dirname, '../defaultConfig/chore');
		Util.createDir(toPath,['chore']);
		let chorePathTo = path.join(toPath, "chore");
		Util.copyFiles(["generate-entry.js", "postcdn.js", "server.js","getBranch.js"], chorePathFrom, chorePathTo);

		// 创建目录
		Util.createDir(toPath, [
			'src',
			'src/pages',
			'src/pages/index',
			'src/pages/index/components',
			'src/pages/index/images',
		]);
	}
};

module.exports = copy;
