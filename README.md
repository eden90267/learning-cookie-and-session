# Cookie and Session

## Cookie 講解

### Cookie 介紹

- 儲存資料在瀏覽器上 (小型資料庫 4k)
- 可在 client、server 端進行讀取、寫入
- 若有鎖 HTTP only，則不能用 javascript 存取
- 由 key/value 方式組成，用分號跟空格隔開
- 可設定失效時間 (localStorage 則是永久保存)

### Cookie 欄位介紹

- Name：key
- Value：value
- Domain：來自於哪個網址
- Path：來自於哪個路徑
- Expire/Max-Age：失效時間，有兩個寫法
- Size
- HTTP：是否可用 js 讀取，有打勾就不行
- Secure：是否支援 HTTPS

## Cookie 瀏覽器 Client 端設計

```javascript
document.cookie // 有些資料是沒有的，HTTP only 的就不會顯示 (後端傳給前端用，不打算讓 js 存取)

document.cookie = 'myName=bob';

document.cookie = 'username=bob; expires=Mon, 04 Dec 2017 08:18:32 GMT; path=/'; // 需要用 GMT 時間

new Date().toGMTString();

document.cookie="username=bob; max-age=10; path=/"; // 大部分都用 max-age，此例是 10 秒後失效
```

## Cookie Node.js Server 設計

```javascript
// routes/index.js

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.cookies);
  res.cookie('name', 'mary', {
    maxAge: 10000, // 10 秒
    httpOnly: true
  });
  res.render('index', {title: 'Express'});
});

module.exports = router;
```

傳輸過去 client 會寫在 Response Headers 的 Set-Cookie 屬性裏。

## Session 講解

後端的好幫手，可以透過它在後端有個暫時資料庫。但會經過一些方式不小心消除掉，跟正式資料庫不一樣。

比較安全，放在 cookies 會被有心人士竊取到

會有一個 ID 在 cookie 上做對應

### Session 介紹

- 儲存在伺服器的暫存資料，可暫存在記憶體或資料庫上
- session 可在 cookie 上儲存一筆辨識你是誰的 session id

### 一個例子

- Client 進入瀏覽器
- Server 提供 session ID 給 client (號碼牌)，並在 session 記錄詳細資訊
- Client 離開瀏覽器
- Client 進入瀏覽器，提供 session ID 給 Server
- Server 透過 session ID 得到該 session 詳細資訊

## Session 開發環境設計

運用到 express-session npm 套件

```shell
npm i express-session --save
```

```javascript
// app.js

var session = require('express-session')

app.use(session({
  secret: 'keyboard cat', // 亂數產生一個編號，若要安全可使設定讓 session 去編碼，駭客較不易入侵
  resave: true, // 重新造訪 session 會生效，或是否會寫入到 node.js 上，建議為 true
  saveUninitialized: true
}));
```

## Session 寫入資料

```javascript
// routes/index.js

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
```

## session 結合 form post 設計

```javascript
// routes/index.js

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {username: req.session.username, email: req.session.email});
});
router.post('/', function (req, res) {
  req.session.username = req.body.username;
  req.session.email = req.body.email;
  res.redirect('/');
});
```

```html
<!--index.ejs-->

<!DOCTYPE html>
<html>
  <head>
    <title>Index</title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
    <h1><%= username %> <%= email %></h1>
    <form method="post" action="/">
        <input type="text" name="username">
        <input type="email" name="email">
        <input type="submit" value="送出">
    </form>
  </body>
</html>
```

```javascript
// app.js

app.use(session({
  secret: 'keyboard cat', // 亂數產生一個編號，若要安全可使設定讓 session 去編碼，駭客較不易入侵
  resave: true, // 重新造訪 session 會生效，或是否會寫入到 node.js 上，建議為 true
  saveUninitialized: true,
  cookie: {maxAge: 10 * 1000} // 10 秒後失效
}));
```

## Cookie、Session 的總結

不是重要資訊要保留：Cookie；若是機密資訊要保留：Session

## FB Login 機制講解

一樣 Cookie 存取號碼牌 原理