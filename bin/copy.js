'use strict';

var chalk = require('chalk');
var Util = require('../libs/util');
var path = require('path');
var fs = require('fs');


function writeFile(path, content) {
	fs.writeFileSync(path, content, {
		encoding: 'utf8',
		mode: 438
	});
}

var copy = {
	copy: function () {
		var defaultPath = path.resolve(__dirname, '../default');
		var fileList = [".babelrc", "package.json", "postcss.config.js", "webpack.config.js", "webpack.config.pro.js"];
		const cwd = process.cwd();
		fileList.forEach(function (fileName) {
			var configPath = path.join(defaultPath, fileName);
			Util.copy(configPath, path.join(cwd, fileName));
		});
	}
};

module.exports = copy;
