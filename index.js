var express = require('express');
var app = express();
var pg = require('pg');
var mongoUrl = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
        response.redirect('/admin')
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

app.get('/login', function (request, response) {
    // Use connect method to connect to the server
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var col = db.collection('users');
        col.find().toArray(function (err, docs) {
            response.render('pages/login', { docs: docs });
        });

        db.close();
    });
});

app.post('/logged', function (request, response) {
    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('/map');
    }
    else if (type == "agam") {
        response.redirect('/admin_main');
    }
});

app.get('/logged', function (request, response) {
    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('/map');
    }
    else if (type == "agam") {
        response.render('pages/admin_main');
    } else {
        response.redirect('/login');
    }
});

app.get('/logout', function (request, response) {
    response.clearCookie('type');
    response.clearCookie('user');
    response.redirect('/login');
});

app.get('/user', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        response.render('pages/add_user');
    }
});

app.get('/equip', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            var equipmentDB = db.collection('equipment');
            equipmentDB.find().toArray(
                function (err, docs) {
                    response.render('pages/admin', { docs: docs });
                }
            );
            db.close();
        });
    }
});

app.get('/admin_main', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        response.render('pages/admin_main');
    }
});

app.get('/map', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        response.render('pages/map');
    }
});

app.post('/addUser', function (request, response) {
    var form = request.body;
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('users').save(form, function (err, result) {
            if (err) return console.log(err);
        });
    });
    response.redirect('pages/logged');
});

var army = [];
var configs = [];

app.get('/mainPage', function (request, response) {
    army = [];
    configs = [];
    filtersArray = [];
    var soldiers = [];
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
                    response.render('pages/mainPage', { divisions: army[0].divisions, units: army[0].units, soldiers_table: configs[0].soldiers_table, treatments_table: configs[0].treatments, filters: configs[0].filters, soldiers: soldiers });
                });
            });
        });
    });
});


var filtersArray = []; // array that stores the filters for the AND operation
app.post('/get-soldiers/:filter/:value/:action', function (req, res) {
    var result = [];
    var fltr = { [req.params.filter]: req.params.value }; // Check if there is no duplicated filters
    if (req.params.action == "add") {     
        for (var i = 0; i < filtersArray.length; i++) {
            if (Object.keys(filtersArray[i])[0] == Object.keys(fltr)[0] && filtersArray[i][Object.keys(filtersArray[i])[0]] == fltr[Object.keys(fltr)[0]]) {
                return;
            }
        }
        filtersArray.push(fltr);
    }
    if (req.params.action == "remove") {
        for (var i = 0; i < filtersArray.length; i++) {
            if (Object.keys(filtersArray[i])[0] == Object.keys(fltr)[0] && filtersArray[i][Object.keys(filtersArray[i])[0]] == fltr[Object.keys(fltr)[0]]) {
                filtersArray.splice(i, 1);
                break;
            }
        }
    }
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find({ $and: filtersArray }).forEach(function (sld, err) {
            assert.equal(null, err);
            result.push(sld);
        }, function () {
            db.close();
            res.json(result);
        });
    });
});

app.post('/get-soldier/:braceletId', function (req, res) {
    console.log('ENTERED TO SEARCH SOLDIER');
    var result = [];
          MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find({ bracelet_id: req.params.braceletId }).forEach(function (sld, err) {
            assert.equal(null, err);
            result.push(sld);
        }, function () {
            db.close();
            res.json(result);
        });
    });
});


app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));

});