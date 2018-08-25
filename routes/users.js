var express = require('express');
var router = express.Router();
var query=require("../util/mysql");
/* GET users listing. */
router.post('/login', function(req, res, next) {
  let username=req.body.username;
  let password=req.body.password;
  query('select * from reb_user',null,(err,rows,fields)=>{
    if(err){
      console.log(err)
    }else{
      console.log()
    }
  });
});


module.exports = router;
