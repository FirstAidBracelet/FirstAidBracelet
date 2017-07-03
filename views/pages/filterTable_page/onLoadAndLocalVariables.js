      /* This is the Socket between back and front end */
    var socket = io.connect('/'); // connect to server
  socket.on('news', function (data) { // listen to news event raised by the server
     buildSoldiersTable(JSON.parse(data));
  });

    /*local variables to manipulate chosen data in real time */
    var chosenFilters = [];
    var chosenBracelets = [];
    var filteredSoldiers = [];

window.onload = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));
        }
    }
        xhr.open('POST','/get-soldiers/_/_/remove', true);
        xhr.send({});
    };