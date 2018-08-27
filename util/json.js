var jsonFormat=function(code,msg,data){
    var obj={
        "code":code,
        "msg":msg,
        "data":data
    };
    return obj;
};
module.exports=jsonFormat;