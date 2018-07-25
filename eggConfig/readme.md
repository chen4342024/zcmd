# 配置
### 如何开始
``` znpm install ```  安装依赖
``` npm run server ```  成功启动后，路径为  http://0.0.0.0:9001/telegram/index
> /telegram/index 为config.js的路径，只是测试使用。请更改



### 命令使用
``` npm run build   ``` 用于测试配置是否正确

#### 开发时候
``` npm run server  ``` 用于开发，启动node服务器热加载，

#### 发布
``` npm run publish ``` 直接打包发布版本（不使用cdn）
``` npm run cdnpublish ``` 发布的时候使用，会先打包并将静态资源post到cdn，

#### 其他
``` npm run clean  ``` 删除dist目录




### 目录结构介绍
- chore  构建文件目录
- dist 打包后的目录
- .eslintrc  : eslint配置文件
- dev.log  node服务器日志文件
- webpack.config.js webpack配置文件
- src  源码目录

##### src目录详解
- pages 放置页面
- service 封装ajax请求

##### chore目录详解
- generate-entry.js  生成入口
- server.js  处理nodeJS 本地开发
- postcdn  处理nodeJS 本地开发



### 约定
1. 字体
- 将字体放在src/fonts 下，build之后会生成字体文件在dist/fonts下
- 字体对应的class与svg文件名一致
2. 图片要放在images目录下
3. 要生成模板html的，命名必须为*.view.hbs,生成的html文件，默认为 XXX.index.html


	

		
