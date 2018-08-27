
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

};
module.exports=urlUtil;