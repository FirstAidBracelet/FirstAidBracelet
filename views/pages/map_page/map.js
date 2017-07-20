// connect to server
var socket = io.connect('/');

//Constants to decide map center
var TelAvivLongitude = 34.781450;
var TelAvivLatitude = 32.068089;

/*
Global variables to update and get from all functions
map - the map object
markerClusterer - the google marker clusterer object (which joins near markers on the map)
soldierMarkers - an array of pairs of soldiers and their markers
*/
var map;
var markerCluster;
var soldierMarkers = new Array();

/*
Message sent by index.js upon post from android.
This is meant to update the location of soldiers when they move.
*/
socket.on('new', function (data) { // listen to news event raised by the server
    setMarkers(data.soldiersArray);
    setListeners(map, markerCluster);
});

/*
This function sets and updates the markers on the map.
It does so by going over all soldiers and selecting only those that are connected to the logged
in user (according to type and division of user), then creating a marker on their location.
We create a pair of each marker-soldier in order to show information of the soldier when hovering over the marker.
In addition we average the longtitude and latitude of the markers to help center the map.
*/
function setMarkers(soldiersArray) { 
    /*
    Get the user's type (doctor/agam) and the division he is in charge of - both kept as a cookie.
    The user will only see the soldiers belonging to his division.
    If the user is an admin he will see all soldiers regardless of division.
    */
    var userDivision = getCookie("division");
    var userType = getCookie("type");

    //number of relevant soldiers
    var count = 0;
    //sum longitude of relevant soldiers
    var long = 0;
    //sum latitude of relevant soldiers
    var lat = 0;

    //For each soldier in soldiersArray
    soldiersArray.forEach(function (soldier) {
        if (soldier.Division == userDivision || userType == "agam") {
            /*
            Create marker on soldier location and check if soldier already exists.
            If he does than update the pair in soldierMarkers, if not then add to soldierMarkers
            */
            var position = new google.maps.LatLng(soldier.Latitude, soldier.Longitude);
            var soldierPair = soldierMarkers.find(function (elem) { return (elem['soldier'] == soldier); });
            if (soldierPair == null) {
                //place new marker at position
                var marker = new google.maps.Marker({ position: position });
                //create new pair of soldier and marker and add to soldierMarkers
                var pair = { soldier: soldier, marker: marker };
                soldierMarkers.push(pair);
            } else {
                //change location of existing marker
                pair.marker.setPosition(position);
            }

            //sum longtitude and latitude
            long += parseInt(soldier.Longitude);
            lat += parseInt(soldier.Latitude);
            count++;
        }
    });

    //calculate average location and return
    var avgLongitude = (long == 0) ? TelAvivLongitude : (long / count);
    var avgLatitude = (lat == 0) ? TelAvivLatitude : (lat / count);
    var avgLocation = { longitude: avgLongitude, latitude: avgLatitude };

    return avgLocation;
}

/*
Function to initialize a map
*/
function myMap() {
    var location = setMarkers(soldiersArray);
    var long = location.longitude;
    var lat = location.latitude;

    /*
    Initilize map with following initial attributes:
        center of map - according to average of soldiers presented or if no soldiers presented then tel aviv
        zoom level
        map type - visual style of map. "terrain" is a map with mountains, rivers, etc.
    */
    var mapOptions = {
        center: new google.maps.LatLng(lat, long),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    //create map in "map" div in map.ejs with the above map attributes.
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //create an empty markerClusterer (an option in google which clusters close markers into a single marker)
    markerCluster = new MarkerClusterer(map, [], {
        //images for markers according to size
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        //the map won't zoom in when a cluster is clicked
        zoomOnClick: false
    });

    //Function to initialize all events that happen to functions
    setListeners(map, markerCluster);
}

/*
We go over each marker in the soldierMarkers array and:
1. create events for when the mouse hovers over the marker - we show the fitting soldier's location above the marker
    and in a window in the left corner of the map the soldier's bracelet id, status and if their exists an evacution request
2. join the markers in a cluster which merges them according to nearness and zoom level and thus cleans the screen
3. create similar events for clusters of markers
*/
function setListeners(map, markerCluster) {
    //create a an object for floating windows above markers which will show their location
    var infowindow = new google.maps.InfoWindow({});

    //pair is a pair of soldier information and the marker on the map
    soldierMarkers.forEach(function (pair) {
        //set markers in map
        pair.marker.setMap(map);
        /*
        add events to each marker:
            mouse hovers over
            mouse moves away
            mouse clicks
        */
        markerListeners(infowindow, pair);
        //add to cluster. The cluster source code calculates which markers in its list need to be joined
        markerCluster.addMarker(pair.marker);
    })

    /*
    We add similar events to the marker clusters as to single markers,
    The difference being the left corner window show status for all soldiers in cluster
    */
    clusterListeners(infowindow, markerCluster);

}

function markerListeners(infowindow, pair) {
    //A listener for the event that the mouse hovers over the marker
    pair.marker.addListener('mouseover', function () {
        //clear all previouse information
        mouseOut();
        //show location above marker
        infowindow.setContent(pair.marker.getPosition().toString());
        infowindow.open(map, pair.marker);
        //show further soldier information in corner window
        mouseOver(pair);
    });

    //A listener for the event that the mouse moves off the marker
    pair.marker.addListener('mouseout', function () {
        //close info-window showing marker location
        infowindow.close();
        //clear soldier information in corner window
        mouseOut();
    });

    //A listener for the event that the mouse clicks the marker
    pair.marker.addListener('click', function () {
        /*
        create a list of soldier in marker
        in this case there is only one soldier but this is a general code for "soldiersFiltersTable" to handle
        since their are also clusters with multiple soldiers
        */
        var soldiersArr = [];
        soldiersArr.push(pair.soldier);
        //send the soldiers to backEnd to prepare rendering list
        socket.emit('mapSoldiersRequest', { soldiers: JSON.stringify(soldiersArr) });
        //call "soldiersFiltersTable" page
        window.open("/soldiersFiltersTable", "_self")
    });
}

function clusterListeners(infowindow, markerCluster) {
    /*
    If mouse passes over cluster show information for each soldier
    and calculate location of clusters by averaging marker locations
    */
    markerCluster.addListener('mouseover', function (cluster) {
        //clear previous information
        mouseOut();

        var avgLatitude = 0;
        var avgLongitude = 0;
        var count = 0;

        //get the markers in current cluster
        var clusterMarkers = cluster.getMarkers();
        //we add the foreach because we want to get the soldiers data page and not only the marker
        soldierMarkers.forEach(function (pair) {
            if (clusterMarkers.includes(pair.marker)) {
                //update left corner window with soldier info
                mouseOver(pair);

                //add soldier location
                avgLatitude += pair.marker.getPosition().lat();
                avgLongitude += pair.marker.getPosition().lng();
                count++;
            }
        });

        //update the info window to show the average location above the cluster, along with the caption "average location"
        var position = new google.maps.LatLng(avgLatitude/count, avgLongitude/count);
        infowindow.setContent("Average Position: " + position.toString());
        infowindow.setPosition(position);
        infowindow.open(map);

    });

    //clear left corner window and info window
    markerCluster.addListener('mouseout', function (cluster) {
        mouseOut();
        infowindow.close();
    });

    //Take user to soldier table for further information about soldiers
    markerCluster.addListener('click', function (cluster) {
        //the markers in current cluster
        var clusterMarkers = cluster.getMarkers();
        //we add the foreach because we want to get the soldiers data page and not only the marker
        var soldiersArr = [];
        soldierMarkers.forEach(function (pair) {
            if (clusterMarkers.includes(pair.marker)) {
                soldiersArr.push(pair.soldier);
            }
        });
        //send to backEnd the list of soldiers in the marker to prepare rendering list
        socket.emit('mapSoldiersRequest', { soldiers: JSON.stringify(soldiersArr) });
        //take user to "soldiersFiltersTable" page
        window.open("/soldiersFiltersTable", "_self")
    });
}
  

/**
 * function to update left corner window with soldiers id, status, and evac request
 * @param pair - pair of soldier and his marker on the map
 */
function mouseOver(pair) {
    //if soldier Id exists show that, otherwise show bracelet id
    var id = (pair.soldier.Soldier_ID == "") ? pair.soldier.Bracelet_ID : pair.soldier.Soldier_ID;
    //if status exists show that
    var status = (pair.soldier.Status == "") ? "No Status" : pair.soldier.Status;

    /*
    bg_type is attribute for coloring of the status according to its severity
    coloring is done using bootstrap classes
    we choose the coloring according to the index of the status in the configuration jason:
    the higher the status the worse the status
    */
    var statusIndex = configurations.injury_status.findIndex(function (status) {
        return pair.soldier.Status == status;
    });

    /*
    Bootstrap has four different colors and so we color the soldier's status according
    to the ratio between status index and the size of status array.
    If there is no status, then statusIndex=-1 -> severity=0 and so there is no color.
    */
    var severity = (1+statusIndex) / configurations.injury_status.length;
    var stat_bg_type;
    if (severity <= 0) { stat_bg_type = "" }
    else if (severity < 0.25) { stat_bg_type = "bg-success"; }
    else if (severity < 0.5) { stat_bg_type = "bg-info"; }
    else if (severity < 0.75) { stat_bg_type = "bg-warning"; }
    else if (severity <= 1) { stat_bg_type = "bg-danger"; }

    //if evacuation request exists show that along with coloring to highlight
    var evac, evac_bg_type;
    switch (pair.soldier.evacuation_request) {
        case "true": evac = "Evacuate"; evac_bg_type = "bg-danger"; break;
        default: evac = "No Evacuation Request"; evac_bg_type = "";
    }

    //add soldier line to left corner window
    var idHTML = "<p>" + id + ": ";
    var statusHTML = "<span class='" + stat_bg_type + "'>" + status + ", </span>  ";
    var evacHTML = "<span class='" + evac_bg_type + "'>" + evac + "</span></p>";
    document.getElementById('info').innerHTML += idHTML + statusHTML + evacHTML;
    //pop window in front of the map
    document.getElementById('info').style.display = "block";
}

function mouseOut() {
    //clear window
    document.getElementById('info').style.display = "none";
    //hide window behind map
    document.getElementById('info').innerHTML = "";
}