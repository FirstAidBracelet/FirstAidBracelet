var express = require('express');
var app = express();
var pg = require('pg');
var mainPage = require('./mainPage');
var mongoUrl = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var bodyParser= require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
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
    var equipmentDB = db.collection('equipment');
    equipmentDB.find().toArray(
        function(err, docs) {
            response.render('pages/admin', {docs: docs});
        }
    );
    db.close();
    });
});

app.post('/admin', function (request, response) {
  
      // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, function(err, db) {
        assert.equal(null, err);

    db.collection('equipment').insertOne({
          equipment_id: request.body.itemId,
          name: request.body.name,
          type: request.body.type
    })
    .then(function(result) {
          // process result
    }) 

    db.close();
    });
});


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname ));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
   response.render('pages/index');
});

app.get('/doctor', function (request, response) {

    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var col = db.collection('users');
        col.find().toArray(function (err, docs) {
            response.render('pages/doctor', { docs: docs });
        });

        db.close();
    });
});

app.post('/db', function (request, response) {
    var MongoClient = require('mongodb').MongoClient
    response.render('pages/db');
});

var army = [];
var configs = [];
var soldiers = [];
app.get('/mainPage', function (request, response) {    
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('army_structure').find().forEach(function (doc, err) {
            army.push(doc);
        }, function () {
            db.collection('configurations').find().forEach(function (cnfs, err) {
                configs.push(cnfs);  
            }, function () {
                db.collection('soldiers').find().forEach(function (sld, err) {
                    soldiers.push(sld);     
                }, function () {
                    db.close();
                    response.render('pages/mainPage', { divisions: army[0].divisions, units: army[0].units, soldiers_table: configs[0].soldiers_table, filters: configs[0].filters, soldiers: soldiers });                   
                    });            
            });
        });
    });
});


app.get('/get-soldiers/:filter/:value', function (req, res, next) {
    var result = [];
      console.log('value is', req.params.value);
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find({ [req.params.filter] : req.params.value }).forEach(function (sld, err) {
            assert.equal(null, err);
            result.push(sld);
        }, function () {
            db.close();
            res.render('pages/mainPage', { divisions: army[0].divisions, units: army[0].units, soldiers_table: configs[0].soldiers_table, filters: configs[0].filters, soldiers: result });                  
            }); 
    });

    //soldiers.forEach(function (sldr) {
    //    if (sldr.injury_stat == req.params.filter) { 
    //        console.log('soldierr: ', sldr.first_name);
    //        result.push(sldr);
    //        console.log('soldierr: ', result.length);
    //    }
    //}, function () {
    //    res.render('pages/mainPage', { divisions: army[0].divisions, units: army[0].units, soldiers_table: configs[0].soldiers_table, filters: configs[0].filters, soldiers: result });
    //});
});




app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
    
});
