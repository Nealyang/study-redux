/**
 * Created by Nealyang on 17/3/19.
 */
if(process.env.NODE_ENV=='production'){
    require('../build/api/api');
}else{
    require('babel-register');
    require('../src/api/api');
}