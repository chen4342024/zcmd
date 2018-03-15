const path = require('path');
const postCDN = require('zzc-post-cdn');

postCDN({
    cwd: path.join(process.cwd(), 'dist'),
    remotePath: 'm/项目名',
    remoteAuth: 'TWgNZ=wbiQK,&X9XMLZif@8,tZd728',
    uploadError: function (err, response, body) {
        console.dir(err);
        console.dir(body);
    },
    uploadSuccess: function (err, response, body) {
        console.dir(err);
        console.dir(body);
    }
});
