var mysql=require('mysql');
var pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:"root",
    database:"rebate"
});
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