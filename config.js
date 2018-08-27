var config={
    "mysql":{//mysql配置
        host:"localhost",
        user:"root",
        password:"root",
        database:"rebate"
    },
    "secret":"ajdao1231231aosdjoasd",//jwt秘钥
    "pdd_api":"http://gw-api.pinduoduo.com/api/router",//拼多多api后台地址
    "pdd_client_id": "62b810aca7504bf19feb6ab3cbe71150",//拼多多应用id
    "pdd_client_secret": "a96f20eb3a9fa97fc7a8110cc293c4d29a42d7ef",//拼多多应用秘钥
    "pdd_redirect_uri":"https://www.baidu.com",//拼多多应用回调地址（与拼多多开放平台中的应用需保持一致）
};



module.exports=config;
