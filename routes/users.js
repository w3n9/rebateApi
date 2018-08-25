var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/login', function(req, res, next) {
  let username=req.body.username;
  let password=req.body.password;
  
});

module.exports = router;
