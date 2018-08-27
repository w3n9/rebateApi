var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
var config=require('./config');
var urlUtil=require('./util/urlUtil');
var expressJwt=require('express-jwt');
var axios=require('axios');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//全局变量的定义
global.access_token="123";
global.fresh_token="";
global.isPddAuthorized=false;



app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    if(global.isAuthorization===false){
        let url = urlUtil.urlConcat("http://jinbao.pinduoduo.com/open.html",{
            client_id:config.pdd_client_id,
            response_type:code,
            redirect_uri:config.pdd_redirect_uri,
        });

    }else{
        next();
    }
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(expressJwt({secret: config.secret}).unless({path: [
        "/users/login",
        "/users/register",
        "/test","/favicon.ico",
        "/is_pdd_authorized",
        '/authorization_handle']}));
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).send("invalid token");
    }
});




app.use('/', indexRouter);
app.use('/users', usersRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
