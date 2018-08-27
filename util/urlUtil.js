var config=require("../config");
var md5=require("md5-node");
//url原始url   params需要拼接的数组列表
/*例
* url https://www.baidu.com
* params
* {
*       type:"json",
*       id:123
* }
*
* */
let urlUtil={
    urlConcat:(url,params)=>{
        let rs=url+"?";
        for(let key in params){
            rs+=key+"=";
            rs+=params[key];
            rs+="&";
        }
        return rs.substr(0,rs.length-1);
    },
    paramsSort:(params)=>{
        var newkey = Object.keys(params).sort();
        //创建一个新的对象，用于存放排好序的键值对
        var newParams = {};
        //遍历newkey数组
        for (var i = 0; i < newkey.length; i++) {
            //向新创建的对象中按照排好的顺序依次增加键值对
            newParams[newkey[i]] = params[newkey[i]];
        }
        //返回排好序的新对象
        return newParams;
    },
    generateSign:(params)=>{
        let sign=config.pdd_client_secret;
        for(let key in params){
            sign+=key;
            sign+=params[key];
        }
        sign+=config.pdd_client_secret;
        return md5(sign).toUpperCase();
    },

};
module.exports=urlUtil;