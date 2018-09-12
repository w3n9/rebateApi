var express = require('express');
var router = express.Router();
var jsonFormat =require("../util/json");
var axios=require("axios");
var config=require("../config");
var urlUtil=require("../util/urlUtil");
var query =require("../util/mysql")
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test',function(req,res,next){
  res.status(200).json(global.access_token);
});


router.post("/to_pdd",function(req,res,next){
    let pddId=req.body.pddId;
    console.log("[\""+pddId+"\"]");
    axios.post(config.api_url+"/get_pdd_access_token",{}).then(({data})=>{
        let params={
            type:"pdd.ddk.oauth.cms.prom.url.generate",
            client_id:config.pdd_client_id,
            access_token:data.data,
            timestamp:Math.round(new Date().getTime()/1000).toString(),
            p_id_list:"[\""+pddId+"\"]",
        };
        let sign=urlUtil.generateSign(urlUtil.paramsSort(params));
        params['sign']=sign;
        let url=urlUtil.urlConcat(config.pdd_api,params);
        axios.post(url,{}).then(({data})=>{
            console.log(JSON.stringify(data));
            console.log(data.cms_promotion_url_generate_response.url_list[0].single_url_list.url);
            res.status(200).json(jsonFormat(0,"获取成功",{
                pdd_url:data.cms_promotion_url_generate_response.url_list[0].single_url_list.url
            }));
        });
        console.log(123);
    });
});

router.post('/get_pdd_access_token',(req,res,next)=>{
    let msg='';
    query("select * from dsc_reb_token where name=? limit 1", ['pdd'], (err, rows, field) => {
        if (err) {
            console.log(err);
        }
        let access_token_update_at = Date.parse(new Date(rows[0].access_token_update_at.toLocaleString())) / 1000;
        let now_time = Date.parse(new Date()) / 1000;
        let hoursBetween = (now_time - access_token_update_at) / 3600;
        if (hoursBetween <= 23) {//数据库中的access_token尚且可用
            msg="access_token获取成功";
            console.log(msg);
            return res.status(200).json(jsonFormat(0,msg,rows[0].access_token));
        } else {
            let refresh_token_update_at = Date.parse(new Date(rows[0].refresh_token_update_at.toLocaleString())) / 1000;
            let now_time = Date.parse(new Date()) / 1000;
            let hoursBetween = (now_time - refresh_token_update_at) / 3600;
            if (hoursBetween <= 700) {//可以使用refresh_token刷新access_token
                let form= {
                    client_id: config.pdd_client_id,
                    client_secret: config.pdd_client_secret,
                    grant_type: "refresh_token",
                    refresh_token: rows[0].refresh_token
                };
                request({
                    url:config.pdd_access_token_get_url,
                    method:"POST",
                    json:true,
                    headers:{
                        "content-type":"application/json",
                    },
                    body:form
                },(error,response,body)=>{
                    if(!error&&response.statusCode==200){
                        console.log(response.body.access_token);
                        query("update dsc_reb_token set access_token=?,access_token_update_at=now() where name=?",[response.body.access_token,'pdd'],(err,rows,field)=>{
                            if(err){
                                console.log(err);
                            }
                            return res.status(200).json(jsonFormat(0,msg,response.body.access_token));
                        });
                    }else{
                        msg="刷新token失败请重试";
                        return res.status(200).json(jsonFormat(-2,msg,null));
                    }
                });
            } else {//refresh_token也过期了需要重新授权
                msg="所有token均已过期请联系管理员重新授权";
                return res.status(200).json(jsonFormat(-1,msg,null));
            }
        }
    });
});





router.get('/authorization_handle',function(req,res,next){
  let code=req.query.code;
  console.log("code="+code);
  let form={
    "client_id":config.pdd_client_id,
    "code":code,
    "grant_type":"authorization_code",
    "client_secret":config.pdd_client_secret
  };
  request({
      url:config.pdd_access_token_get_url,
      method:"POST",
      json:true,
      headers:{
        "content-type":"application/json",
      },
      body:form
  },(error,response,body)=>{
    if(!error&&response.statusCode==200){
        query("update dsc_reb_token set access_token=?,access_token_update_at=now(),refresh_token=?,refresh_token_update_at=now() where name=?",[body.access_token,body.refresh_token,"pdd"],(err,rows,field)=>{
            if(err){
                console.log(err);
                res.status(200).json(jsonFormat(0,"多多客授权失败",null));
            }
            res.status(200).json(jsonFormat(0,"多多客授权成功",null));
        });

    }else{
        console.log(error);
        res.status(200).json(-1,"多多客授权失败",null);
    }
  });
});
router.post("/list_pdd_order",(req,res,next)=>{
        let p_id=req.body.pId;
        console.log(p_id);
        let params={
            type:"pdd.ddk.order.list.increment.get",
            client_id:config.pdd_client_id,
            timestamp: Math.round(new Date().getTime()/1000).toString(),
            start_update_time:(Math.round(new Date().getTime()/1000)-90*24*60*60).toString(),
            end_update_time:Math.round(new Date().getTime()/1000).toString(),
            p_id:p_id
        };
        console.log(params);
        let sign=urlUtil.generateSign(urlUtil.paramsSort(params));
        params['sign']=sign;
        let pddApiUrl=urlUtil.urlConcat(config.pdd_api,urlUtil.paramsSort(params));
        console.log(pddApiUrl);
        axios.post(pddApiUrl,{}).then(({data})=>{
            console.log(data);
            console.log(data.order_list_get_response);
            return res.status(200).json(jsonFormat(0,"订单获取成功",data.order_list_get_response));
        });
});
module.exports = router;
