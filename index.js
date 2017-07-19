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
/*
 io - is the "communication chanel" between this backend and the app pages - which are the frontend.
 The connection established on application creation, io socket listening to events which are treated latter in this file. 
 */
var io = require('socket.io').listen(app.listen(app.get('port'))); // Setting App and Socket Listening port (same one). 

/* Here we will define the "static root" directory path for our project.
In other words - every time we will use the "/" redirection in our project, it will search in those paths.
*/
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));

/* defining directory for all EJS module, template files */
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/*-------- Local "BackEnd" variables -------- */
var filtersArray = []; // array that stores the chosen filters requests from filterTable_page.
var logedInDoctorDivision = null; // indicates wherever doctor or admin is loged to the system. If doctor loged - in, this will save his Division name.
var mapReqestedSoldiers = null; // Soldiers that map.js requested via group/soldier click. 
/*---- End of local variables defenition -----*/

app.get('/', function (request, response) { // Redirection "welcome page"
    response.render('pages/welcomePage');
});

//Shows Treatments DB
app.get('/treatmentsDb', function (request, response) {

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        var equipmentDB = db.collection('equipment');
        equipmentDB.find().toArray(
            function (err, docs) {
                response.render('pages/treatmentsDb', { docs: docs });
            }
        );
        db.close();
    });
});

//Adding new item to Treatments Database
app.post('/treatmentsDb', function (request, response) {

    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('equipment').update(
            { equipment_id: request.body.itemId }, // query
            { $set: { name: request.body.name, type: request.body.type } }, // replacement
            { upsert: true }, // if id is inside --> update. if id is not inside -->enter new record
            function (err, object) {
                if (err) {
                } else {
                    response.redirect('/treatmentsDb') //show the new table
                }
            });
        db.close();
    });
});

//Deleting an item in equipment database, called from treatmentsDb.ejs.
app.post('/treatments_delete_item', (req, res) => {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('equipment').findOneAndDelete({ equipment_id: req.body.item_id }, function () {
            db.collection('equipment').find().toArray(function (err, docs) {
                res.render('pages/treatmentsDb', { docs: docs });
            });
            db.close();
        });
    });
});


app.get('/login', function (request, response) {
    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('/doc_main');
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
    var number = request.cookies.number;
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('users').update({ number: number }, { $set: { status: "connected" } }, function () {
            db.close();
        });
    });

    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('/doc_main');
    }
    else if (type == "agam") {
        response.redirect('/admin_main');
    }
});

app.get('/logged', function (request, response) {
    var type = request.cookies.type;
    if (type == "doctor") {
        response.redirect('pages/doc_main');
    }
    else if (type == "agam") {
        response.render('pages/admin_main');
    } else {
        response.redirect('/login');
    }
});

app.get('/logout', function (request, response) {
    var number = request.cookies.number;
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('users').update({ number: number }, { $set: { status: "not connected" } }, function () {
            db.close();
        });
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
                    response.render('pages/treatmentsDb', { docs: docs });
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

app.get('/doc_main', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login')
    } else {
        response.render('pages/doc_main');
    }
});

//Deleting a user. called from user_table.ejs
app.get('/user_table', (req, res) => {
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('users').find().toArray(function (err, users) {
            res.render('pages/users_page/users_table', { users: users });
        });
        db.close();
    });
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

/* Handles the GET request to show the Command Center page (Soldiers table and filters bar).
Note that this request render the page with some page variables from "configuration" file in our database.
The configuration contains the basic information to build a valid soldiers table and filters bar.
Includes (for now - may change in future) Soldiers and treatments tables columns names, and the available filters names.

@response - rendered page with the configuration arrays parameters.
*/
app.get('/soldiersFiltersTable', function (request, response) {
    var user = request.cookies.user;
    var type = request.cookies.type;
    if (user == null || type == null) {
        response.redirect('/login');
        return;
    }
    var configs = [];
    if (type == "doctor") {
        logedInDoctorDivision = request.cookies.division;
    } else {
        logedInDoctorDivision = null;
    }
    configs = [];
    filtersArray = [];
    MongoClient.connect(mongoUrl, function (err, db) {
        assert.equal(null, err);
        db.collection('configurations').find().forEach(function (cnfs, err) {
            configs.push(cnfs);
        }, function () {
            db.close();
            response.render('pages/filterTable_page/soldiersFiltersTable', { soldiers_table: configs[0].soldiers_table, treatments_table: configs[0].treatments, filters: configs[0].filters });
        });
    });
});

/* Handles the POST request to recive array of soldiers according to given filter and the option (add or remove the filter).
 The response will ber the "AND" operation between all chosen filter values.
 @request.params filter - the filter you want to apply on soldiers database search (e.g. Division ).
 @request.params value - the filter value you want to apply on soldiers database search (e.g. Golani).
 @request.params action - the action you want to perform (add/remove the filter from chosen filters array).
 @result - the filtered soldiers as stringified JSON array object.

Attention - the request " /get-soldiers/_/_/remove " will return all soldiers without any filtering condition. 
*/
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
            if (mapReqestedSoldiers != null) {// This case is when the Map invoces the soldiers table build
                res.json(JSON.parse(mapReqestedSoldiers));
                mapReqestedSoldiers = null;
                return;
            }

            if (req.cookies.type == "doctor") { //This case is when Specific doctor invoced soldiers table - he will see only he's division soldiers      
                MongoClient.connect(mongoUrl, function (err, db) {
                    assert.equal(null, err);
                    db.collection('soldiers').find({ Division: req.cookies.division }).forEach(function (sld, err) {
                        assert.equal(null, err);
                        result.push(sld);
                    }, function () {
                        db.close();
                        res.json(result);
                    });
                });
                return;
            }
            MongoClient.connect(mongoUrl, function (err, db) { // This case is when Admin invoces soldiers table - he will see all the soldiers
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
    if (req.cookies.type == "doctor") { //This case is when Specific doctor invoced soldiers table - he will see only his Division soldiers      
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').find({ Division: req.cookies.division, $and: filtersArray }).forEach(function (sld, err) {
                assert.equal(null, err);
                result.push(sld);
            }, function () {
                db.close();
                res.json(result);
            });
        });
        return;
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

/*
 client is socket.io variable, we need to define it outside the io.sockets.on() function
to be able to use it anytime while applicaiton is running.
(The io.sockets.on('connection') function run once - on app load, so we use the 'client' local variable
to keep the request handlers "alive" while our application running)
 */
var client; // This is the Socket to that listen and handle our client (pages) events.
io.sockets.on('connection', function (socket) { // the actual socket opening and it's functions definition
    client = socket;
    client.on('removePatient', function (data) { // removing bracelet via soldiersFiltersTable socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').findOneAndDelete({ Bracelet_ID: data.braceletId }, function () {
                db.close();
            });
        });
    });
    client.on('updateEvacuationStatus', function (data) {  // updating evacuation request via soldiersFiltersTable socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').update({ Bracelet_ID: data.braceletId }, { $set: { evacuation_request: data.status } }, function () {
                db.close();
            });
        });
    });
    client.on('updateLocationFilter', function (data) {  // updating location via soldiersFiltersTable socket request
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('soldiers').update({ Bracelet_ID: data.braceletId }, { $set: { Location: data.location } }, function () {
                db.close();
            });
        });
    });
    client.on('mapSoldiersRequest', function (data) {  // receiving soldiers from map.js   
        mapReqestedSoldiers = data.soldiers;
    });
    client.on('removePreviuseMapFiltering', function (data) {  // removing soldiers request from map.js   
        mapReqestedSoldiers = null;
    });

    client.on('addUser', function (data) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').save(data.user, function () {
                db.close();
            });
        });
    });
    client.on('removeUser', function (data) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').findOneAndDelete({ number: data.number }, function () {
                db.close();
            });
        });
    });
    client.on('updateUserName', function (data) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').update({ number: data.number }, { $set: { name: data.name } }, function () {
                db.close();
            });
        });
    });
    client.on('updateUserNum', function (data) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').update({ number: data.number }, { $set: { number: data.num } }, function () {
                db.close();
            });
        });
    });
    client.on('updateUserDiv', function (data) {
        MongoClient.connect(mongoUrl, function (err, db) {
            assert.equal(null, err);
            db.collection('users').update({ number: data.number }, { $set: { division: data.div } }, function () {
                db.close();
            });
        });
    });
});

class MyEmitter extends EventEmitter { } // Event hendler for post request from Android.
const myEmitter = new MyEmitter();
/*
This is the Event function that handles the Android request for
updating the soldiers table.
We will use this eventEmitter method because we dont want that other devices (like android tablet)
will have an access to our source code. With this method androind sends us some natification, and we are
checking the database for changes.
You may consider to change this method to other more secure/compatible one when you will develop the code.
For now this is the only way for android to tell us that some change ocured (update,delete,add ... etc.).
*/
myEmitter.on('androidChangedDatabaseEvent', () => {

    var result = [];
    if (!logedInDoctorDivision) { // administrator loged in
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
    } else { // doctor loged in
        if (filtersArray.length == 0) {
            MongoClient.connect(mongoUrl, function (err, db) {
                assert.equal(null, err);
                db.collection('soldiers').find({ Division: logedInDoctorDivision }).forEach(function (sld, err) {
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
            db.collection('soldiers').find({ Division: logedInDoctorDivision, $and: filtersArray }).forEach(function (sld, err) {
                assert.equal(null, err);
                result.push((sld));
            }, function () {
                db.close();
                client.emit('news', JSON.stringify(result));
            });
        });
    }
});

/*
Handles the Post request for the Android application,
It trigers "androidChangedDatabaseEvent" event that updates the soldiers table trough the socket.
*/
app.post('/soldiersChange', function (request, response) {
    if (client != undefined) {
        myEmitter.emit('androidChangedDatabaseEvent');
    }
    response.send("Android i got your request!")
});

/* Handles the POST request to recive specific soldier by Bracelet_ID.
 The response will ber the "AND" operation between all chosen filter values.
 @request.params braceletId - the Bracelet_ID of the soldier.
 @result - array containing soldier which bracelet id provided as JSON object.
*/
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
