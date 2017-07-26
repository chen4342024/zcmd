#! /usr/bin/env node

var program = require('commander'),
	chalk = require('chalk'),
	Copy = require('./copy.js');

/**
 * sass编译执行及监听
 */
program
	.version('0.1.0')
	.command('init_config')
	.alias('icg')
	.description('创建配置文件')
	.action(function (option) {
		console.log(chalk.green('创建配置文件'));
		Copy.copy();
	});

program.parse(process.argv);



