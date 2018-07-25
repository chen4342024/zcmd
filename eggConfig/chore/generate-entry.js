/**
 * 生成webpack.config.js入口配置
 * 本项目为“多页应用”
 */
const fs = require('fs');
const path = require('path');
const constants = require('constants');
const glob = require('glob');
const PROJECT_PATH = process.cwd();
const SRC_PATH = path.join(PROJECT_PATH, 'src');
const REG_VIEW_HANDLEBARS_NAME_RULE = /(\.view)$/;
const REG_INDEX_NAME_RULE = /(\.index)$/;
const useHBS = true;

module.exports = function() {
    let entry = {};
    let pagePath = path.resolve(PROJECT_PATH, './src/pages');

    let pagesName = glob.sync('**/*.view.js', {
        cwd: pagePath,
        nodir: true,
        matchBase: true,
        realpath: true
    });
    pagesName.map(function(pageName) {
        //由于有时候会出现路径不是完全路径的情况，故加上这局
        pageName = path.resolve(pagePath, pageName);

        // 过来不是page的目录，例如：components/
        if (!checkPage(pageName)) {
            return;
        }

        let outputName = path.basename(pageName, '.js');
        outputName = outputName.replace(REG_VIEW_HANDLEBARS_NAME_RULE, '');

        let groupName = path.relative(pagePath, path.dirname(pageName));
        outputName = groupName + '.' + outputName;
        outputName = outputName.replace(REG_INDEX_NAME_RULE, '');
        entry[outputName] = jsEntryPath(pageName);
        console.log("entry ---> " + outputName + ", " + jsEntryPath(pageName));
    });


    // 判断是否有效页面
    function checkPage(pageName) {
        let js = jsEntryPath(pageName);
        let html = htmlEntryPath(pageName);

        // 同时存在 $page/index.js 和 $page/$page.view.handlebars 才是有效页面
        return exist(js) && exist(html);
    }

    function jsEntryPath(pageName) {
        return path.resolve(pagePath, pageName);
    }

    function htmlEntryPath(pageName) {
        let extname = path.extname(pageName);
        let hbsPath = pageName.replace(extname, '');
        let extension = useHBS ? 'hbs' : 'handlebars';
        return path.resolve(pagePath, `${hbsPath}.${extension}`);
    }

    return entry;
};


function exist(file) {
    let result = true;

    try {
        fs.accessSync(file, constants.F_OK);
    } catch (err) {
        result = false;
    }

    return result;
}
