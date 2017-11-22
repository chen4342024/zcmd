const superagent = require('superagent');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const cookie = require('cookie-parser');
const httpProxy = require('express-http-proxy');
const getCurrBranch = require('./getBranch');

// 开发服务器
const branch = getCurrBranch();
const HOST = `m_${branch}.zuzuche.net`;

console.log(chalk.green("当前分支名 ----> " + HOST));

// const HOST = 'http://172.16.70.30:8989/';
const PROJECT_PATH = process.cwd();
const TEMPLATE_PATH = path.join(PROJECT_PATH, 'dist', 'html');
const LOG_FILE = path.join(PROJECT_PATH, 'dev.log');

fs.writeFile(LOG_FILE, '', {
    encoding: 'utf8'
});

module.exports = function setup(publicPath) {

    return function (app, Server) {
        app.use(cookie());

        //处理图片问题
        app.get(/\.(?:js|css|png|jpg|gif|jpeg)/, httpProxy(HOST, {
            filter: function (req, res) {
                return req.url.indexOf(publicPath) === -1;
            }
        }));

        app.get(/io_js\.php/, (req, res) => {
            return httpProxy(HOST, {})
        });

        //拦截url中带php,html的请求
        app.get(/\.(?:html|php)/, function (req, res, next) {
            if (req.xhr) {
                //处理ajax请求
                return reWriteProxy(req, res);
            } else {
                return proxy(req, res);
            }
        });

        //拦截url中post类ajax请求
        app.post(/\.(?:html|php)/, function (req, res, next) {
            if (req.xhr) {
                //处理ajax请求
                return reWriteProxy(req, res);
            }
        });

        //处理模板返回问题
        function proxy(req, res) {
            getTemplateName(req)
                .then(function (templateName) {
                    let templateString = readTemplateString(Server, templateName);

                    return renderTemplateByServer(req, templateString).then(function (html) {
                        res.send(html);
                    });
                })
                .catch(function (err) {
                    res.status(500);
                    res.send(
                        `
                            <p>获取模板名的时候出错了</p>
                            <pre>status: ${err.status}\nmessage: ${err.message}\nstack: ${err.stack}</pre>
                        `
                    );
                });
        }

        //重定向请求
        function reWriteProxy(req, res) {
            let httpProxyFunc = httpProxy(HOST, {
                filter: function (req, res) {
                    return req.url.indexOf(publicPath) === -1;
                }
            });
            return httpProxyFunc(req, res);
        }
    }
};

// 从服务器获取模板名
// url 域名后面的 path 和 query
function getTemplateName(req) {
    let url = req.url;
    if (!fetchTemplateName._cache) {
        fetchTemplateName._cache = {};
    }

    if (fetchTemplateName._cache[url]) {
        return Promise.resolve(fetchTemplateName._cache[url]);
    } else {
        return fetchTemplateName(req)
            .then((data) => {
                let templateName = extractTemplateName(data);
                fetchTemplateName._cache[url] = templateName;
                return templateName;
            });
    }
}


//发起获取模板名字的请求
function fetchTemplateName(req) {
    let url = req.url;
    let api = `${HOST}${url}`;
    let query = {
        __is_dev_template: 1,
        p_file: 1
    };
    log(`request url:${api} query:${JSON.stringify(query)}`);
    let cookies = cookieToString(req.cookies);
    return superagent
        .get(api)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', cookies)
        .set('User-Agent', req.get('user-agent'))
        .buffer(true)
        .query(query)
        .then(function (res) {
            log(`response url:${api} query:${res.text}`);
            try {
                let data = JSON.parse(res.text);
                return data;
            } catch (e) {
                throw e;
            }
        }).catch((err) => {
            log(`response url:${api} status:${err.status} error:${err.message}`);
            throw err;
        });
}

// 请求服务端 渲染模板
// url 域名后面的 path 和 query
// templateString  前端 handlebars 渲染后生成的内容作为后端模板
function renderTemplateByServer(req, templateString) {

    let url = `${HOST}${req.url}`;

    let requestBody = {};

    // URL 中存在 _debug_arr 则直接打印数据，不渲染
    if (url.indexOf('_debug_arr') !== -1) {
        requestBody = {
            '_debug_arr': 1
        };
    } else {
        // templateString = encodeURIComponent(templateString);
        requestBody = {
            '__template_html': templateString,
            '__is_dev_template': 1
        };
    }

    log(`request url:${url} template_html:${templateString.length}`);

    let cookies = cookieToString(req.cookies);
    return superagent
        .post(url)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Cookie', cookies)
        .set('User-Agent', req.get('user-agent'))
        .send(requestBody)
        .then(function (response) {
            // superagent 不需要解析 text/html 数据，且放在 .text 属性
            let body = response.text;
            log(`response url:${url}  body:${body.length}`);
            return body;
        }).catch(function (err) {
            log(`response url:${url} status:${err.status} error:${err.message}`);
            throw err;
        });
}


// 从webpack-dev-server读取模板内容
function readTemplateString(Server, name) {
    let fs = Server.middleware.fileSystem;
    let filePath = path.join(TEMPLATE_PATH, `${name}`);

    let fileContent = `从webpack-dev-server找不到对应的模板内容，模板路径：${filePath}`;
    if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
    }
    log(`readTemplateString ---> ${filePath} ; length ---> ${fileContent.length}`);
    return fileContent;
}


// 简单实现日志 日志文件为 LOG_FILE
function log(message) {
    message = message + "\n";
    fs.appendFile(LOG_FILE, message, 'utf8', function (err) {
        if (err) {
            console.log(`插入日志出错 ./chore/server.js log(message)`, err.message);
        }
    });
}

//从返回的file中提取模板名称
function extractTemplateName(data) {
    let file = data.file;
    log(`extractTemplateName ---> ${file}`);
    let paths = file.split('dist/html/');
    return paths[1] || '';
}

// 将cookie序列化为字符串
function cookieToString(cookies = {}) {
    let cookieStr = "_cpan=limingchang;";
    let keys = Object.keys(cookies);
    keys.forEach((key) => {
        cookieStr += `${key}=${cookies[key]};`
    });
    return cookieStr;
}
