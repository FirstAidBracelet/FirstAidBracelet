/*
Builds the main soldiers table.
Attention - <% %> iterators are "EJS" syntax. (Read about ejs module)

 @param sldrs - array of soldiers where each soldier is a legal JSON object
 @pageParam soldiers_table - array that we pass to soldiersFiltersTable.ejs page when we render it.
            Each element in it represents header for specific column of the soldiers table.
@localPageParam filteredSoldiers - local array of soldiers kind of - "cache" that represents the soldiers acordingly to filter requests.                           
*/
function buildSoldiersTable(sldrs) {

    if (document.getElementById("mainTable") !== null) {
        document.getElementById("mainTable").remove();
    }

    filteredSoldiers = [];
    filteredSoldiers = sldrs;
    var table = document.createElement('table');
    table.setAttribute("class", "table table-striped");
    table.setAttribute("id", "mainTable");
    var tHeader = table.insertRow(0);
    // Iterator for the header
    var i = 0;
	  <% soldiers_table.forEach(function (doc) { %>
        tHeader.setAttribute('style', 'font-weight: bold; text-align:center;');
        tHeader.insertCell(i).innerHTML = " <%= doc %> ";
        i++;
     <% }); %>
        /* Here we will add 2 more columns for the table which are not part of
       the soldiers parameters this is the Evacuation request and Delete soldier option*/
        tHeader.insertCell(i++).innerHTML = "Evac_Request";
    tHeader.insertCell(i++).innerHTML = "Remove";

    // Iterator for the columns which are soldiers properties
    var j = 1;
    var k = 0;
    sldrs.forEach(function (sold) {
        var tHeader = table.insertRow(j);
        tHeader.setAttribute("id", 'tRow' + sold.Bracelet_ID);
        j++;
         <% soldiers_table.forEach(function (tbl) { %>
            tHeader.setAttribute('style', 'text-align:center;');
            var cell = tHeader.insertCell(k);
            cell.style.cursor = "pointer";
            cell.addEventListener("click", function (event) { // this is the handler that will open treatments table on row click
                getTreatments(sold.Bracelet_ID);
                event.preventDefault();
            });
            if ('<%=tbl %>' == "Location") {
                cell.innerHTML = giveSoldierLocationAccordingToLatLong(sold);
            }
            else {
                if (sold.<%=tbl %>){
            cell.innerHTML = sold.<%=tbl %>;
        }
    }
            k++;
          <% }); %>
    /* Here we will create The Evacuation button  */
    var btn = document.createElement("BUTTON");

    btn.addEventListener("click", function (event) {
        evacuationStatusChange(sold.Bracelet_ID);
        event.preventDefault();
    });
    var evacButtonText = document.createTextNode(sold.evacuation_request);
    if (sold.evacuation_request == "true") {
        btn.style.backgroundColor = "#b3ffcc";
    } else {
        btn.style.backgroundColor = "#e6e6e6";
    }
    btn.setAttribute("id", 'evacButton' + sold.Bracelet_ID);
    btn.appendChild(evacButtonText);
    tHeader.setAttribute('style', 'text-align:center;');
    tHeader.insertCell(k).appendChild(btn);
    k++
    /* End of the evacuation button creation*/

    /* Here we will create The button to remove soldier from table */
    var btn = document.createElement("BUTTON");
    btn.addEventListener("click", function (event) {
        removeSoldier(sold.Bracelet_ID);
        event.preventDefault();
    });
    var t = document.createTextNode("X");
    btn.appendChild(t);
    tHeader.setAttribute('style', 'text-align:center;');
    tHeader.insertCell(k).appendChild(btn);
    k++;
    /* End of the remove button creation*/
    k = 0;
        });
    document.getElementById("mainSoldiersTable").appendChild(table);
    buildAllFilters();
}

/*
Removes soldier from DATABASE and from main soldiers table.

 @param braceletID - The bracelet ID of the soldier we want to remove             
*/
function removeSoldier(braceletID) { 
    var cnfrmation = confirm("Are you sure you want to remove this patient from Database?");
    if (cnfrmation == true) {
        document.getElementById('tRow' + braceletID).remove(); // remove the row from main soldiers table
        socket.emit('removePatient', { braceletId: braceletID }); // send request to backEnd via socket to remove soldier from database
    }
}
/*
Calculates soldier location zone and update it in DATABASE and in the main soldiers table.

@param Soldier -  soldier as legal JSON object
@return sLocation - string that rapresents soldier location as defined in sildierLocation() function.
*/
function giveSoldierLocationAccordingToLatLong(Soldier) {

    if (!Soldier.Latitude || !Soldier.Longitude) {
        return;
    }
    var sLocation = soldierLocation(Soldier);
    socket.emit('updateLocationFilter', { braceletId: Soldier.Bracelet_ID, location: sLocation }); // send request to backEnd via socket to update soldier location in database.
    return sLocation;

}