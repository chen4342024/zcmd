'use strict';

var chalk = require('chalk');
var Util = require('../libs/util');
var path = require('path');
var fs = require('fs');


var replace = {
	replace: function () {
		const cwd = process.cwd();
		var self = this;
		fs.readdir(cwd, function (err, files) {
			if (err) {
				return console.error(err);
			}
			files.forEach(function (fileName) {
				var filePath = path.join(cwd, fileName);
				if (/(\s\S)*\.scss$/.test(fileName)) {
					console.log(chalk.green('fileName--->' + fileName));
					Util.readFile(filePath, function (content) {
						content = self.repalceRem(content);
						// Util.writeFile(path.join(cwd, path.basename(fileName, ".scss") + "-rem" + path.extname(fileName)), content);
						Util.writeFile(path.join(cwd, fileName), content);
					})
				}
			});
		});
	},
	repalceRem(content){
		content = content.replace(/(\d*\.)?\d+rem/g, function (rem) {
			var floatRem = parseFloat(rem);
			var result = floatRem * 2;
			var finalRem = "" + parseFloat(result.toFixed(2)) + "rem";
			console.log(chalk.green(rem + "  --->   " + finalRem));
			return finalRem;
		});
		return content;
	}
};

module.exports = replace;
