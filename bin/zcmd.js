#! /usr/bin/env node
//第一行表示这个执行文件使用node来执行

var program = require('commander'),
	chalk = require('chalk'),
	Copy = require('./copy.js'),
	ReplaceRem = require('./replace_rem');

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

/**
 * sass替换中的rem
 */
program
	.version('0.1.0')
	.command('replace_rem')
	.description('替换rem')
	.action(function (option) {
		console.log(chalk.green('替换rem'));
		ReplaceRem.replace();
	});



program.parse(process.argv);



