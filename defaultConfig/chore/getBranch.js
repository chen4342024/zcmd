const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

/**
 * 获取当前项目对应的分支
 * @returns {string}
 */
function getCurrBranch() {
    let rootProjectPath = getRootPath(__dirname, 30);
    if (!rootProjectPath) {
        console.log(chalk.red("找不到当前项目.git目录，无法读取分支名，请手动配置分支名"));
        return '';
    }
    let gitHeadPath = path.join(rootProjectPath, '.git/HEAD');
    let branch = '';
    if (fs.existsSync(gitHeadPath)) {
        let file = fs.readFileSync(gitHeadPath, 'utf8');
        let arr = file.split('/');
        branch = arr[arr.length - 1].replace(/\s+/g, '').split('\\')[0];
    } else {
        console.log(chalk.red("找不到分支名"));
    }
    return branch;
}

/**
 * 向上递归找到 .git 目录
 * @param currentPath 当前目录
 * @param level 递归级数，防止死循环
 * @returns {*}
 */
function getRootPath(currentPath, level) {
    let gitPath = path.join(currentPath, '.git');
    if (fs.existsSync(gitPath)) {
        return currentPath;
    } else {
        level--;
        currentPath = path.join(currentPath, '../');
        if (level > 0) {
            return getRootPath(currentPath, level);
        }
    }
}

module.exports = getCurrBranch;
