
/* This is the Socket between back and front end */
var socket = io.connect('/'); // connect to server
socket.on('news', function (data) { // listen to news event raised by the server
    buildSoldiersTable(JSON.parse(data)); // when there any news (say android posted some changes - rebuild the table )
});

/*local page variables to manipulate chosen data in real time */
var chosenFilters = []; // to prevent chosing same filter twice
var chosenBracelets = [];  // to prevent chosing same bracelet twice when building treatments table
var filteredSoldiers = [];// kind of "cashe" for more eficient management (in relevant functios there is an explanation about this globalPageVariable)

/*
Function that run on page load
Building the Soldiers table without any constrains at the very begining/
Attention - the function uses POST request that should be handled in index.js
this function use the special "/_/_remove" string in "/get-soldiers/" request to ask for building table without any constrains and filters.
(We will use this special string for post request to use the existing request , rather than create a new special Post request for creating table witout filters.)
*/
window.onload = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));
        }
    }
    xhr.open('POST', '/get-soldiers/_/_/remove', true);
    xhr.send({});
};