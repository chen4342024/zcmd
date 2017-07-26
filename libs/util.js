var path = require("path");
var fs = require("fs");
var chalk = require('chalk');


module.exports = {
	/**
	 * 获取cain config文件
	 */
	readFile: function (filePath, callback) {
		var config = {};
		if (fs.existsSync(filePath)) {
			try {
				config = fs.readFileSync(filePath, {
					encoding: 'utf8'
				});
				callback && callback(config);
			} catch (e) {
				console.log(chalk.red("读取文件失败 ---> " + filePath));
				console.log(chalk.red(e));
			}
		} else {
			console.log(chalk.red("文件不存在，请检查后再试.. , 路径为：--> " + filePath));
		}
	},

	writeFile: function (filePath, content) {
		fs.writeFileSync(filePath, content, {
			encoding: 'utf8',
			mode: 438
		});
	},

	copy: function (filePath, dist) {
		console.log(chalk.green("  正在复制 .. "));
		console.log(chalk.cyan(filePath) + " ------> " + chalk.yellow(dist));
		var self = this;
		this.readFile(filePath, function (content) {
			const cwd = process.cwd();
			self.writeFile(dist, content);
			console.log(chalk.green("  复制完成 ..."));
		})
	}
};