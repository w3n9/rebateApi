var query=require("./mysql");
var axios=require("axios");
var urlUtil=require("./urlUtil");
var config=require("../config");
var tokenUtil= {
    getPddToken: () => {//获取拼多多token

    },
    getPddTokenReal:(val)=>{
        return val;
    },
    refreshPddToken: () => {//刷新拼多多Token

    },
};
module.exports=tokenUtil;