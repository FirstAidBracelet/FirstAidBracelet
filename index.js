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





app.get('/mongo', function (request, response) { 
    MongoClient.connect(mongoUrl, function(err, db) {
        assert.equal(null, err);
        var config = db.collection('configurations');
        config.find().toArray(function (err, cnfg) {
            openDbWithSoldiersAndFilters(cnfg);        
    });
    db.close();
    });
});
function openDbWithSoldiersAndFilters(param) {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
       var sldrs = db.collection('soldiers');
        sldrs.find().toArray(function (err, sld) {
          //  console.log('Paramteters ', param[0].soldiers_table);
          //  console.log('soldiers', sld[0]);

            response.render('pages/mongo', { docs: sld, soldiers_table: param[0].soldiers_table, filters: param[0].filters });
           
        });
        db.close();
    });
}




app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/views'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');





app.get('/', function (request, response) {
    
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var config = db.collection('configurations');
        config.find().toArray(function (err, config) {
            openDbWithSoldiersAndFilters(config);
        });
       // db.close();
    });
    
   response.render('pages/index');
});

app.get('/doctor', function(request, response) {
  response.render('pages/doctor');
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



