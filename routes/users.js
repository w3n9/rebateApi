var express = require('express');
var router = express.Router();
var jsonFormat=require('../util/json');
var query=require("../util/mysql");
var config=require("../config");
var jwt = require("jsonwebtoken");
var urlUtil=require("../util/urlUtil");
var md5=require("md5-node");
var axios=require("axios");
var tokenUtil=require("../util/token");
/* GET users listing. */
router.post('/login', function(req, res, next) {
  let username=req.body.username;
  let password=req.body.password;
  //TODO验证输入
  query("select * from dsc_users where user_name=? or mobile_phone=? limit 1",[username,username],(err,rows,fields)=>{
    let msg='';
    if(err){
      console.log(err)
      msg="服务器内部错误";
      console.log(msg);
      return res.status(200).json(jsonFormat(-1,msg,null));
    }
    if(rows===null||rows.length===0){
      msg="用户不存在";
      console.log(msg);
      return res.status(200).json(jsonFormat(-2,msg,null));
    }
    if(rows[0].password!==md5(md5(password)+rows[0].ec_salt)){
        msg="密码错误";
        console.log(msg);
        return res.status(200).json(jsonFormat(-2,msg,null));
    }
    let spreadId={
        token:'',
        pId:rows[0].pdd_id,
    };
    if(rows[0].pdd_id===null||rows[0].pdd_id==="") {
        //拼多多推广位申请
        axios.post(config.api_url+"/get_pdd_access_token",{}).then(({data})=>{
            console.log(data.data);
            let params={
                access_token:data.data,
                type:"pdd.ddk.oauth.goods.pid.generate",
                client_id:config.pdd_client_id,
                timestamp: Math.round(new Date().getTime()/1000).toString(),
                number:1,
                p_id_name_list:"[\"pid_for_"+rows[0].user_id+"\"]",
            };
            let sign=urlUtil.generateSign(urlUtil.paramsSort(params));
            params['sign']=sign;
            let pddApiUrl=urlUtil.urlConcat(config.pdd_api,urlUtil.paramsSort(params));
            console.log(pddApiUrl);
            axios.post(pddApiUrl,{}).then(({data})=>{
                console.log(data);
                console.log(data.p_id_generate_response.p_id_list[0].p_id);
                spreadId.pId=data.p_id_generate_response.p_id_list[0].p_id;
                query("update dsc_users set pdd_id=?,jd_id=?,tb_id=? where user_id=?",[spreadId.pId,spreadId.jId,spreadId.tId,rows[0].user_id],(err,rows,field)=>{
                    if(err){
                        console.log(err);
                        msg="授权失败请重试";
                        return res.status(200).json(jsonFormat(-3,msg,null));
                    }
                    msg="登录成功";
                    spreadId.token= jwt.sign({username: username}, config.secret);
                    return res.status(200).json(jsonFormat(0,msg,spreadId));
                });
            });
        });
    }else{
        return res.status(200).json(jsonFormat(0,msg,spreadId));
    }
  });
  // query('select * from reb_user',null,(err,rows,fields)=>{
  //   if(err){
  //     console.log(err)
  //   }else{
  //     console.log()
  //   }
  // });
});
//
// router.post('/register', function(req, res, next){
//     let username=req.body.username;
//     let password=req.body.password;
//     //for pdd
//     let params={
//         access_token:'',
//         type:"pdd.ddk.oauth.goods.pid.generate",
//         client_id:config.pdd_client_id,
//         timestamp: Math.round(new Date().getTime()/1000).toString(),
//         number:1,
//         p_id_name_list:"[\"pid_for_"+username+"\"]",
//     };
//     let sign=urlUtil.generateSign(urlUtil.paramsSort(params));
//     params['sign']=sign;
//     let pddApiUrl=urlUtil.urlConcat(config.pdd_api,urlUtil.paramsSort(params));
//     console.log(pddApiUrl);
//     axios.post(pddApiUrl,{}).then(({data})=>{
//         console.log(data);
//         console.log(data.p_id_generate_response.p_id_list[0].p_id);
//     });
//     //TODO
//     // for jd
//
//
//     //TODO
//     // for tb
//     // query("insert into reb_user(username,password,pdd_id) value(?,?,?)",[username,password],(err,rows,fields)=>{
//     //     if(err){
//     //
//     //     }
//     // });
//     res.status(200).json(null);
// });



module.exports = router;
