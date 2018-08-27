var express = require('express');
var router = express.Router();
var jsonFormat =require("../util/json");
var axios=require("axios");
var config=require("../config");
var urlUtil=require("../util/urlUtil");
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test',function(req,res,next){
  res.status(200).json(global.access_token);
});

router.post('/is_pdd_authorized',function(req,res,next){
  res.status(200).json(jsonFormat(0,"获取成功",global.isPddAuthorized));
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
  },(err,res,body)=>{
    if(!err&&res.statusCode==200){
      console.log(body);
    }
  });
});
module.exports = router;
