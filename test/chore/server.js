const superagent = require('superagent');
const path = require('path');
const fs = require('fs');
// 开发服务器
const HOST = 'm_tidl.zuzuche.net';

// const HOST = 'http://172.16.70.30:8989/';
const PROJECT_PATH = process.cwd();
const TEMPLATE_PATH = path.join(PROJECT_PATH, 'dist', 'html');
const LOG_FILE = path.join(PROJECT_PATH, 'dev.log');

fs.writeFile(LOG_FILE, '', {
    encoding: 'utf8'
});

module.exports = function setup(app, Server) {
    app.get('/static/images/s-325472601571f31e1bf00674c368d335.gif', function (req, res) {
        let fs = Server.middleware.fileSystem;
        let filePath = path.join(PROJECT_PATH, 'dist', `images/s.gif`);

        let fileContent = '404 from webpack-dev-server';
        if (fs.existsSync(filePath)) {
            fileContent = fs.readFileSync(filePath);
            res.writeHead(200, {'Content-Type': 'image/gif' });
        }
        res.end(fileContent);
    });

    app.get('/', function (req, res) {
        return proxy(req, res);
    });

    app.get(/\.(?:html|php)/, function (req, res) {
        return proxy(req, res);
    });

    function proxy(req, res) {
        let url = req.url;

        fetchTemplateName(url).then(function (data) {
            let templateName = data.route;
            let templateString = readTemplateString(Server, templateName);

            return renderTemplateByServer(url, templateString).then(function (
                html) {
                res.send(html);
            });
        }).catch(function (err) {
            res.status(500);
            res.send(
                `<pre>status: ${err.status}\nmessage: ${err.message}\nstack: ${err.stack}</pre>`
            );
        });
    }
};

// 从服务器获取模板名
// url 域名后面的 path 和 query
function fetchTemplateName(url) {
    if (!fetchTemplateName._cache) {
        fetchTemplateName._cache = {};
    }

    if (fetchTemplateName._cache[url]) {
        return Promise.resolve(fetchTemplateName._cache[url]);
    }

    let api = `${HOST}${url}`;
    let query = {
        __is_dev_template:1,
        p_file:1
    };

    log(`request url:${api} query:${JSON.stringify(query)}`);

    return superagent
        .get(api)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', '_cpan=chenjiajia')
        .buffer(true)
        .query(query).then(function (res) {
            let body = res.body;

            log(`response url:${api} `);
            log(`res --> :${JSON.stringify(res)}`);
            log(`res.status --> :${JSON.stringify(res.status)}`);
            log(`res.text --> :${JSON.stringify(res.text)}`);
            log(`res.body---> :${JSON.stringify(body)}`);

            if (body.code) {
                throw new Error(body.msg);
            }

            // cache
            fetchTemplateName._cache[url] = body.data;
            return body.data;
        }).catch(function (err) {
            log(`response url:${api} status:${err.status} error:${err.message}`);
            throw err;
        });
}


// 请求服务端 渲染模板
// url 域名后面的 path 和 query
// templateString  前端 handlebars 渲染后生成的内容作为后端模板
function renderTemplateByServer(url, templateString) {
    url = `${HOST}/v2${url}`;

    let requestBody = {};

    // URL 中存在 _debug_arr 则直接打印数据，不渲染
    if (url.indexOf('_debug_arr') !== -1) {
        requestBody = {
            '_debug_arr': 1
        };
    } else {
        templateString = encodeURIComponent(templateString);
        requestBody = {
            'template_html': templateString
        };
    }

    log(`request url:${url} template_html:${templateString.length}`);
    // log(`\n\nrequest\n\n${templateString}\n\n`);

    return superagent
        .post(url)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Cookie', 'allow_test_ip=1')
        .send(requestBody)
        .then(function (response) {
            // superagent 不需要解析 text/html 数据，且放在 .text 属性
            let body = response.text;
            log(`response url:${url} body:${body.length}`);
            // log(`\n\nresponse\n\n${body}\n\n`);
            return body;
        }).catch(function (err) {
            log(`response url:${url} status:${err.status} error:${err.message}`);
            throw err;
        });
}


// 从webpack-dev-server读取模板内容
function readTemplateString(Server, name) {
    let fs = Server.middleware.fileSystem;
    let filePath = path.join(TEMPLATE_PATH, `${name}.html`);

    let fileContent = '404 from webpack-dev-server';
    if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
    }

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
