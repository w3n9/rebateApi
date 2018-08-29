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
    let params={
        type:"pdd.ddk.oauth.cms.prom.url.generate",
        client_id:config.pdd_client_id,
        access_token:global.access_token,
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

router.get('/is_authorized',function(req,res,next){
  let name=req.query.name;
  query("select status from reb_authorization where name=?",[name],(err,rows,fields)=>{
     if(err){
         res.status(200).json(jsonFormat(-1,"服务器内部错误",null));
     }
     console.log(name+":"+rows[0].status);
     res.status(200).json(jsonFormat(0,"获取成功",{
         name:name,
         status:rows[0].status
     }));
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
        global.access_token=body.access_token;
        global.refresh_token=body.refresh_token;
        global.isPddAuthorized=true;
        res.status(200).json(jsonFormat(0,"多多客授权成功",null));
    }else{
        console.log(error);
        res.status(200).json(-1,"多多客授权失败",null);
    }
  });
});
module.exports = router;
