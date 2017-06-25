var express = require('express');
var app = express();
var mongoUrl = 'mongodb://heroku_8lwbv1x0:hlus7a54o0lnapqd2nhtlkaet7@dbh73.mlab.com:27737/heroku_8lwbv1x0';
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const EventEmitter = require('events');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 5000)); // Defining Application port
var io = require('socket.io').listen(app.listen(app.get('port'))); // Setting App and Socket Listening port (same one)

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});


app.get('/admin', function (request, response) {

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
});

app.post('/admin', function (request, response) {

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('equipment').insertOne({
            equipment_id: request.body.itemId,
            name: request.body.name,
            type: request.body.type
        })

            .then(function (result) {
                response.redirect('/admin')
            })

        db.close();
    });
});

//deleting an item in Equipment. called from admin.ejs
app.post('/admin_delete_item', (req, res) => {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('equipment').findOneAndDelete({ equipment_id: req.body.item_id }, function () {
            db.collection('equipment').find().toArray(function (err, docs) {
                res.render('pages/admin', { docs: docs });
            });
            db.close();
        });
    });
});


app.get('/login', function (request, response) {
    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('/map');
    }
    else if (type == "agam") {
        response.redirect('/admin_main');
    }
    else {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            var col = db.collection('users');
            col.find().toArray(function (err, docs) {
                response.render('pages/login', { docs: docs });
            });
            db.close();
        });
    }
});

app.post('/logged', function (request, response) {
    var user = request.cookies.user;
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var col = db.collection('users');
        col.update({ user: user }, { $set: { status: "connected" } })
        db.close();
    });

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
    var user = request.cookies.user;
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var col = db.collection('users');
        col.update({ user: user }, { $set: { status: "not connected" } })
        db.close();
    });

    var cookie = request.cookies;
    for (var key in cookie) {
        if (!cookie.hasOwnProperty(key)) {
            continue;
        }
        response.clearCookie(key);
    }
    response.redirect('/login');
});

app.get('/user', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        var army_struct;
        var users = [];
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('army_structure').find().forEach(function (doc, err) {
                army_struct = doc;
            }, function () {
                db.collection('users').find().forEach(function (user, err) {
                    users.push(user);
                }, function () {
                    db.close();
                    response.render('pages/add_user_page/add_user', { army_struct: army_struct, users: users });
                });
            });
        });
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

app.get('/user_table', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').find().toArray(
                function (err, docs) {
                    response.render('pages/users_table', { docs: docs });
                }
            );
            db.close();
        });
    }
});

//deleting a user. called from user_table.ejs
app.post('/admin_delete_user', (req, res) => {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('users').findOneAndDelete({ user: req.body.user }, function () {
            db.collection('users').find().toArray(function (err, docs) {
                res.render('pages/users_table', { docs: docs });
            });
            db.close();
        });
    });
});

app.get('/try', function (request, response) {
    response.render('pages/try');
});

app.post('/try-edit', function (request, response) {
    console.log("Reached!!!!!!!!!!!!!!!!!!!!!");
    return;
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
        var soldiers = [];
        var users = [];
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').find().forEach(function (sol, err) {
                soldiers.push(sol);
            }, function () {
                db.collection('users').find().forEach(function (use, err) {
                    users.push(use);
                }, function () {
                    db.close();
                    response.render('pages/map_page/map', { soldiers: soldiers, users: users });
                });
            });
        });
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
    response.redirect('/logged');
});

var filtersArray = []; // array that stores the filters for the AND operation
var configs = [];
app.get('/mainPage', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
        return;
    }
    configs = [];
    filtersArray = [];
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('configurations').find().forEach(function (cnfs, err) {
            configs.push(cnfs);
        }, function () {
            db.close();
            response.render('pages/mainPage', { soldiers_table: configs[0].soldiers_table, treatments_table: configs[0].treatments, filters: configs[0].filters });
        });
    });
});



app.post('/get-soldiers/:filter/:value/:action', function (req, res) {
    var result = [];
    var databaseDoctors = [];
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
        if (filtersArray.length == 0) {
            MongoClient.connect(mongoUrl, function (err, db) {
                assert.equal(null, err);
                db.collection('soldiers').find().forEach(function (sld, err) {
                    assert.equal(null, err);
                    result.push(sld);
                }, function () {
                    db.close();
                    res.json(result);

                });
            });
            return;
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


var client; // This is the Socket client from mainPage.ejs
io.sockets.on('connection', function (socket) { // the actual socket opening and it's functions definition
    client = socket;
    client.on('removePatient', function (data) { // removing bracelet via mainPage socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').findOneAndDelete({ Bracelet_ID: data.braceletId }, function () {
                db.close();
            });
        });
    });
    client.on('updateEvacuationStatus', function (data) {  // updating evacuation request via mainPage socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').update({ Bracelet_ID: data.braceletId }, { $set: { evacuation_request: data.status } }, function () {
                db.close();
            });
        });
    });
    client.on('updateLocationFilter', function (data) {  // updating evacuation request via mainPage socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').update({ Bracelet_ID: data.braceletId }, { $set: { Location: data.location } }, function () {
                db.close();
            });
        });
    });
});

/*
This is the Event function that handles the Android request for
updating the soldiers table
*/
class MyEmitter extends EventEmitter { } // event hendler for post request from android
const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
    var result = [];
    if (filtersArray.length == 0) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').find().forEach(function (sld, err) {
                assert.equal(null, err);
                result.push(sld);
            }, function () {
                db.close();
                client.emit('news', JSON.stringify(result));
            });
        });
        return;
    }
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find({ $and: filtersArray }).forEach(function (sld, err) {
            assert.equal(null, err);
            result.push((sld));
        }, function () {
            db.close();
            client.emit('news', JSON.stringify(result));
        });

    });
});

myEmitter.on('mapEvent', () => {
    console.log('a map event occurred');
    var soldiersArray = [];
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find().forEach(function (sol, err) {
            soldiersArray.push(sol);
        }, function () {
            db.close();
            client.emit('new', { soldiersArray: soldiersArray });
        });
    });
    return;
});
/*
This is the Post request for the Android application,
It trigers event that update the soldiers table trought the socket
*/
app.post('/soldiersChange', function (request, response) {
    myEmitter.emit('event');
    myEmitter.emit('mapEvent');
    console.log('Got request from android!');
    response.send("Android i got your request!")
});

app.post('/get-soldier/:braceletId', function (req, res) {
    var result = [];
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('soldiers').find({ Bracelet_ID: req.params.braceletId }).forEach(function (sld, err) {
            assert.equal(null, err);
            result.push(sld);
        }, function () {
            db.close();
            res.json(result);
        });
    });
});