var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var pg = require('pg');

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
  response.render('pages/mongo');
    /*var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

    // Connection URL
    var url = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';

    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    //
    response.render('pages/mongo');
    //db.close();
    //});*/
};
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/doctor', function(request, response) {
  response.render('pages/doctor');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



