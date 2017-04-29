var express = require('express');
var app = express();
var pg = require('pg');
var mainPage = require('./mainPage');

/*
postgres stuff
*/

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});


//mongodb stuff
app.get('/mongo', function (request, response) {
  var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

    // Connection URL
    var url = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';

    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
    var col = db.collection('soldiers');
    col.find().toArray(function(err, docs) {
      /*docs.forEach(function (doc)) {
        var pri = doc['Rank'];
      }*/
      response.render('pages/mongo', {docs: docs});
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

app.get('/doctor', function(request, response) {
  response.render('pages/doctor');
});

   mainPage.filters.push("one");
app.get('/mainPage', function(request, response) {
 
  //  mainPage.filters.push("two");
  //  mainPage.filters.push("three");
   
     response.render('pages/mainPage', { mainPage: mainPage });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
   
   
});



