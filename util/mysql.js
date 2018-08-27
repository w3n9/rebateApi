var mysql=require('mysql');
var config=require("../config");
var pool=mysql.createPool(config.mysql);
var query=function(sql,options,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,options,function(err,result,fields){
                conn.release();
                callback(err,result,fields)
            });
        }
    });
}
module.exports = query;