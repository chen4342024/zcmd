// 开发服务器
const getCurrBranch = require('./getBranch');
const branch = getCurrBranch();
// const HOST = `m_${branch}.zuzuche.net`;
const HOST = `dolphin_mkdev.zuzuche.net`;

let config = {

    cdn: {
        //配置
        remotePath: 'm/xxx',
        //权限
        remoteAuth: 'TWgNZ=wbiQK,&X9XMLZif@8,tZd728',
        //路径
        publicPath: '//imgcdn50.zuzuche.com/assets/value_added_service/m/xxx/'
    },

    // 路由与后端的配置
    router: {
        '/telegram/index': {
            phpPath: '/m/telegram/index.blade.php', //php路径
            tplPath: 'index.tpl.htm' //模板名
        }
    },

    host: HOST, //后端项目访问的路径, npm run server 中需要用到

    url: `${HOST}/frontend_dev/tpl/save`, //请求获取模板渲染后的内容的URL

    // 配置后端的信息
    backend: {
        // 后端项目路径，默认用egg，既后端路径与前端项目在本地电脑为同层级的时候使用
        projectPath: {
            egg: '../../dolphin/resources/views/m/telegram/'
        }
    },

    FLINFO: {
        id: 8,
    }
};

module.exports = config;
