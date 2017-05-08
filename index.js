var express = require('express');
var app = express();
var pg = require('pg');
var mainPage = require('./mainPage');
var mongoUrl = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

/*
postgres stuff
*/

app.get('/mongo', function (request, response) {
  
      // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, function(err, db) {
        assert.equal(null, err);
    var col = db.collection('soldiers');
    col.find().toArray(function(err, docs) {
      response.render('pages/mongo', {docs: docs});
    });

    db.close();
    });
});

app.get('/admin', function (request, response) {
  
      // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, function(err, db) {
        assert.equal(null, err);
    var col = db.collection('equipment');
    col.find().toArray(function(err, docs) {
      response.render('pages/admin', {docs: docs});
    });

    db.close();
    });
});


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/views'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
   response.render('pages/index');
});

app.get('/doctor', function (request, response) {
        response.render('pages/doctor');
});

app.post('/db', function (request, response) {
    response.render('pages/db', { loginForm: loginForm });
    /*var MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

    // Connection URL
    var url = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';

    // Use connect method to connect to the server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        var col = db.collection('users');
        var user = col.findOne({ type: 'bigfoot' });
        if (user == null) {
            response.render('pages/doctor');
        }
        else {
            response.render('pages/db', { loginForm: loginForm });
        }
        db.close();
    });*/
});

app.get('/mainPage', function(request, response) {
 
  //  mainPage.filters.push("two");
  //  mainPage.filters.push("three");
   
     response.render('pages/mainPage', { mainPage: mainPage });
});
   
app.get('/mainPage', function (request, response) {
    
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var armyStructure = db.collection('army_structure');
        armyStructure.find().toArray(function (err, army) {
            response.render('pages/mainPage', { divisions: army[0].divisions , units: army[0].units  });
        });
        db.close();
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
   
   
});



