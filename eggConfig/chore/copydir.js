/**
 * 拷贝模块
 */
const copydir = require('directory-copy');
const path = require('path');
const fs = require('fs');
const cfg = require('./config');
const PROJECT_PATH = process.cwd();
const DIST_PATH = path.join(PROJECT_PATH, 'dist');
const backendConfig = cfg.backend;


process.stdin.resume();
process.stdin.setEncoding('utf8');

const copySourceUrl = path.resolve(DIST_PATH, 'html');

console.log('请输入拷贝用户名称：');
process.stdin.on('data', function(text) {
    text = text.trim();
    if (backendConfig.projectPath[text]) {
        done(text);
    } else {
        console.error('!! 不存在该用户，请重新输入 or 请前往 chore/config.js 进行配置');
    }
});

function done(userName = 'egg') {
    let dest = backendConfig.projectPath[userName];
    let realPath = path.join(PROJECT_PATH, dest);
    if (exist(realPath)) {
        console.log('***** 目录拷贝开始... *****');
        console.log(`source -> ${copySourceUrl}`);
        console.log(`dest -> ${realPath}`);
        copydir({
            src: copySourceUrl,
            dest: dest
        }, function() {
            console.log('***** 目录拷贝完成 *****');
            process.exit();
        });
    } else {
        console.error('!! 路径不对，请检查路径是否真实存在 or 请前往 chore/config.js 修改');
        console.error(`错误路径为：${realPath} `);
        process.exit();
    }
}

function exist(path) {
    let result = true;
    try {
        return fs.existsSync(path);
    } catch (e) {
        result = false;
    }

    return result;
}
