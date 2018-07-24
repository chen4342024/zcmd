const path = require('path');
const postCDN = require('zzc-post-cdn');
const config = require('./config');
const cdnConfig = config.cdn;

postCDN({
    cwd: path.join(process.cwd(), 'dist'),
    remotePath: cdnConfig.remotePath,
    remoteAuth: cdnConfig.remoteAuth,
    uploadError: function(err, response, body) {
        console.dir(err);
        console.dir(body);
    },
    uploadSuccess: function(err, response, body) {
        console.log('/***** 提交CDN完成 *****/');
        let assetsMap = body.data.assetsMap;
        if (!assetsMap) {
            return;
        }
        for (let key in assetsMap) {
            console.log('============');
            console.log('上传文件：%s', key);
            console.log('cdn文件硬盘地址：%s', assetsMap[key]['path']);
            console.log('cdn文件http地址：%s', assetsMap[key]['url']);
            console.log('============');
        }
    }
});
