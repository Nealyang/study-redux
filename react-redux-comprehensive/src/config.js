/**
 * Created by Nealyang on 17/3/19.
 */
module.exports = {
    host:process.env.HOST || 'localhost',
    port:process.env.PORT || (process.env.NODE_ENV == 'production'?8080:3000),
    apiHost:process.env.APIHOST || 'localhost',
    apiPort:process.env.APIPORT || 3030,
    app:{
        title:'study redux comprehensive example',
        head:{
            titleTemplate:'study react-redux by Neal %s',
            meta:[
                {
                    name:"example by Neal",
                    content:'react-redux example'
                },
                {charset:'utf-8'}
            ],

        }
    }
};