var socket = io.connect('/'); // connect to server
socket.on('new', function (data) { // listen to news event raised by the server
    changeMarkers(data.soldiersArray);
});

function httpGetAsync(theUrl, callback, parameters) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(parameters);
}

//Units user in charge of
var division = getCookie("division");
//User type = {doctor,agam}
var type = getCookie("type");
//Marker array
var markers = new Array();
/*
First we select the markers that appear on the map for the logged-in user.
The divisions the user is in charge of are kept in a cookie (unless he is a phone user or an admin).
We go over all the soldiers in the db and for each on who belongs to a relevant division we get his location
(if exists) and create a tuple of the marker and the soldier's page for future reference.
In addition we average the longtitude and latitude of the markers to point the center of the map. 
*/
function changeMarkers(soldiersArray) { 
    var count = 0;
    var long = 0;
    var lat = 0;
    
    //docs = Soldiers db in array form
    soldiersArray.forEach(function (soldier) {
        if (soldier.Division == division || type == "agam") {
                //create pair of soldier document and marker and push into markers' array
            var pos = new google.maps.LatLng(soldier.Latitude, soldier.Longitude);
            var pair = markers.find(function (elem) { return (elem['soldier'] == soldier); });
            if (pair == null) {
                var marker = new google.maps.Marker({ position: pos, map: map });
                var pair = { soldier: soldier, marker: marker };
                markers.push(pair);
            } else {
                pair.marker.setPosition(pos);
            }

            //sum longtitude and latitude
            long += parseInt(soldier.Longitude);
            lat += parseInt(soldier.Latitude);
            count += 1;
        }
    });
    var loc = {long : long, lat: lat, count: count};
    var changeMarkerReturn = {loc: loc, markers: markers};
    return changeMarkerReturn;
}


function myMap() {
    var changeMarkerReturn = changeMarkers(soldiersArray);
    var long = changeMarkerReturn.loc.long;
    var lat = changeMarkerReturn.loc.lat;
    var count = changeMarkerReturn.loc.count;
    var markers = changeMarkerReturn.markers;

    //average longtitude and latitude. If user has no soldiers the center is Tel-Aviv.
    var long = (long == 0) ? 32.068089 : (long / count);
    var lat = (lat == 0) ? 34.781450 : (lat / count);
    //attributes of map = center according to avg long-lat, starting zoom, and type
    var mapOptions = {
        center: new google.maps.LatLng(lat, long),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    //create new map
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //create an empty markerClusterer (an option in google which clusters close markers into a single marker)
    var markerCluster = new MarkerClusterer(map, [], {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        zoomOnClick: false
    });
    
    setMarkerListeners(map, markers, markerCluster);
}

/*
We go over each marker in the markers array and:
1. create events for when the mouse hovers over the marker - we show the fitting soldier's division above the marker
    and the bracelet id with a colored soldier's status on the map's left corner
2. join the markers in a cluster which merges them according to nearness and zoom level and thus cleans the screen
3. create events for clusters
*/
function setMarkerListeners(map, markers, markerCluster){
    markers.forEach(function (pair) {
        //create a floating window with the soldier's division
        var infowindow = new google.maps.InfoWindow({
            content: pair.soldier.doctor_name
        });

        //set window left corner information when mouse passes over marker
        pair.marker.addListener('mouseover', function () {
            mouseOut();
            infowindow.open(map, pair.marker);
            mouseOver(pair);
        });

        //clear all information when mouse passes from marker
        pair.marker.addListener('mouseout', function () {
            infowindow.close();
            mouseOut();
        });

        //add to cluster
        markerCluster.addMarker(pair.marker);
    })

    /*
    We add similar events to the marker clusters as to single markers. The difference being we don't show divisions and
    the left corner window show status for all soldiers in cluster
    */
    markerCluster.addListener('mouseover', function (cluster) {
        mouseOut();
        //the markers in current cluster
        var list = cluster.getMarkers();
        //we add the foreach because we want to get the soldiers data page and not only the marker
        markers.forEach(function (pair) {
            if (list.includes(pair.marker)) {
                //update left corner window
                mouseOver(pair);
            }
        });
    });

    //clear left corner window
    markerCluster.addListener('mouseout', function (cluster) {
        mouseOut();
    });


    markerCluster.addListener('click', function (cluster) {
        //the markers in current cluster
        var list = cluster.getMarkers();
        //we add the foreach because we want to get the soldiers data page and not only the marker
        var soldiersArr = [];
        markers.forEach(function (pair) {
            if (list.includes(pair.marker)) {
                soldiersArr.push(pair.doc);
            }
        });
        httpGetAsync('/mainPage', function (response) { }, soldiersArr);
    });

}

function mouseOver(pair) {
    //bg_type is attribute for coloring of the status according to its severity
    //coloring is done using bootstrap classes
    var stat_bg_type = "";
    switch (pair.soldier.Status) {
        case "Minor": stat_bg_type = "bg-success"; break;
        case "average": stat_bg_type = "bg-info"; break; //ALERT
        case "Severe": stat_bg_type = "bg-warning"; break;
        case "kia": stat_bg_type = "bg-danger"; break;
        case "": break;
    }
    var evac_bg_type = "";
    var evac = "";
    switch (pair.soldier.evacuation_request) {
        case "false": break; 
        case "true": evac_bg_type = "bg-danger"; evac = "Evacuate"; break;
    }
    //add to the window the bracelet-id and the colored status
    document.getElementById('info').innerHTML += "<p>" + pair.soldier.Bracelet_ID + ": <span class='" + stat_bg_type + "'>" + pair.soldier.Status + "</span>  " + "<span class='" + evac_bg_type + "'>" + evac + "</span></p>";
    //pop window in front of the map
    document.getElementById('info').style.display = "block";
}

function mouseOut() {
    //clear window
    document.getElementById('info').style.display = "none";
    //hide window behind map
    document.getElementById('info').innerHTML = "";
}