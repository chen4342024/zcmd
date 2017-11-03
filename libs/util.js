var path = require("path");
var fs = require("fs");
var chalk = require('chalk');


module.exports = {
	/**
	 * 读取文件
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

	/**
	 * 写入文件
	 * @param filePath
	 * @param content
	 */
	writeFile: function (filePath, content) {
		fs.writeFileSync(filePath, content, {
			encoding: 'utf8',
			mode: 438
		});
	},

	copy: function (filePath, dist, contentHandler) {
		console.log(chalk.green("  正在复制 .. "));
		console.log(chalk.cyan(filePath) + " ------> " + chalk.yellow(dist));
		var self = this;
		this.readFile(filePath, function (content) {
			if (contentHandler) {
				content = contentHandler(content);
			}
			self.writeFile(dist, content);
			console.log(chalk.green("  复制完成 ..."));
		})
	},

	copyFiles: function (fileList, from, to) {
		var self = this;
		fileList.forEach(function (fileName) {
			var configPath = path.join(from, fileName);
			self.copy(configPath, path.join(to, fileName));
		});
	},

	strTemplate: function (str, object) {
		return str.replace(/\{[^}]+\}/g, function (value) {
			var key = value.replace("{", "").replace("}", "");
			return typeof object[key] !== "undefined" ? object[key] : value;
		});
	},

	createDir: function (currentPath, dirArray) {
		dirArray.forEach((dir) => {
			if (isString(dir)) {
				let targetPath = path.join(currentPath, dir);
				if (!fs.existsSync(targetPath)) {
					console.log(chalk.green('create dir --> ' + targetPath));
					fs.mkdirSync(targetPath);
				}
			}
		});
	}
};

function isObject(obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
}

function isString(obj) {
	return Object.prototype.toString.call(obj) === '[object String]';
}