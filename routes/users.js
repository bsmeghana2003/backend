var express = require('express');
var jwt = require('jsonwebtoken');
var request = require('request');
var router = express.Router();
const sha256 = require('sha256');

require('dotenv/config')

router.post('/user/add', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var collection = req.db.collection("users");
  var dataToInsert = {
    username: username,
    password: sha256(password)
  };
  collection.insertOne(dataToInsert).then(function (data) {
    if (data) {
      res.send({
        status: "Success",
        data: "User added successfully"
      });
    } else {
      res.send({
        status: "Error",
        err: "Failed to create user"
      });
    }
  })
});

router.get('/user/login', function (req, res, next) {
  var username = req.query.username;
  var password = req.query.password;
  var collection = req.db.collection("users");
  collection.findOne({ username: username, password: sha256(password) }).then(function (data) {
    if (data) {
      res.send({
        status: "Success",
        data: "Correct credentials"
      });
    } else {
      res.send({
        status: "Error",
        err: "Wrong credentials"
      });
    }
  });

});

router.get('/user/getprofile', function (req, res, next) {

  let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL;

  request.post(url, (error, response, body) => {
    console.log(body);
    body = JSON.parse(body);

    if (body.access_token) {
      request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
        if (error) {
          console.log('API Response Error: ', error);
          res.send(error);
        } else {
          body = JSON.parse(body);
          res.send(body);
        }
      }).auth(null, null, true, body.access_token);

    } else {
      res.send(error);
    }

  }).auth(process.env.clientID, process.env.clientSecret);

});

module.exports = router;
