/**
 * Created by Nealyang on 17/3/19.
 */
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');

var config = {
    assets:{
        images:{extensions:['png']},
        style_modules:{
            extensions:['css','scss'],
            filter:function (module,regex,options,log) {
                if(options.development){//判断是否为开发环境
                    //返回适用于style-loader,css-loader的返回值
                    return WebpackIsomorphicToolsPlugin.style_loader_filter(module,regex,options,log);
                }else {
                    //提取单独的样式文件，返回默认值
                    return regex.test(module.name)
                }
            }
        },
        path:function (module,options,log) {
            if(options.development){
                return WebpackIsomorphicToolsPlugin.style_loader_path_extractor(module,options,log);
            }else{
                return module.name;
            }
        },
        parser:function (module,options,log) {
            if(options.development){
                return WebpackIsomorphicToolsPlugin.css_modules_loader_parser(module,options,log);
            }else{
                return module.source;
            }
        }
    }
};

module.exports = config;
