var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  req.session.username = 'tom';
  req.session.email = 'email';
  res.cookie('name', 'mary', {
    maxAge: 10000, // 10 秒
    httpOnly: true
  });

  res.render('index', {title: 'Express'});
});

module.exports = router;
