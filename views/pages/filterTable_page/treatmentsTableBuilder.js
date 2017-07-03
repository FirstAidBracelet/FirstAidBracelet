 function buildTreatmentsTable(givenSoldier) {

       givenSoldier.forEach(function(soldier) {  // this is the found soldier
 // Here we create Dynamicly linear list
   var node = document.createElement("LI");
    node.setAttribute('style', 'overflow:scroll; height:225px; width:350px');
    node.setAttribute("id", "eqipId"+soldier.Bracelet_ID);
   // Here we will insert our table
    var table = document.createElement('table');
    table.setAttribute("class", "table table-striped");
    var tHeaderr = table.insertRow(0);
    tHeaderr.setAttribute('style', 'font-weight: bold; text-align:center;');
    var tCell = tHeaderr.insertCell(0);
           /* Here we will create refresh button */
           var btnn = document.createElement("BUTTON");
           btnn.addEventListener("click", function (event) {
    for (i = 0; i < chosenBracelets.length; i++) { // removing the bracelet from array that prevents duplicates
                  if (soldier.Bracelet_ID === chosenBracelets[i]) {
                      chosenBracelets.splice(i, 1);
    document.getElementById('eqipId' + soldier.Bracelet_ID).remove();
      getTreatments(soldier.Bracelet_ID); //rebuild table after delted the first one - the refresh operation
                      break;
                  }
              }
              event.preventDefault();
     });
     var t = document.createTextNode("refresh");
     btnn.appendChild(t);
            tCell.appendChild(btnn);
           /* End of the refresh button creation*/
            tCell = tHeaderr.insertCell(1);
            tCell.colSpan = "2";
            /* Here we will create The button to delete the Treatments Table */
     var btn = document.createElement("BUTTON");
     btn.addEventListener("click", function (event) {
         document.getElementById('eqipId' + soldier.Bracelet_ID).remove();
              event.preventDefault();
           for (i = 0; i < chosenBracelets.length; i++) { // removing the bracelet from array that prevents duplicates
                  if (soldier.Bracelet_ID === chosenBracelets[i]) {
                      chosenBracelets.splice(i, 1);
                      if (chosenBracelets.length == 0) {
                          document.getElementById("chosenSoldiersText").style.visibility = "hidden";
                      }
                    break;
                  }
              }
     });
     var t = document.createTextNode("close");
     btn.appendChild(t);
            tCell.appendChild(btn);
            /* End of the delete button creation*/
    tHeaderr = table.insertRow(1);
    var tCell = tHeaderr.insertCell(0);
    tHeaderr.setAttribute('style', 'font-weight: bold; text-align:center;');
    tCell.innerHTML = "BraceletID: " + soldier.Bracelet_ID + "    ";
    tCell.colSpan = "3";

    tHeaderr = table.insertRow(2);
    tHeaderr.setAttribute('style', 'font-weight: bold; text-align:center;');
    tCell = tHeaderr.insertCell(0);
    tCell.innerHTML = "Soldier #: " + soldier.Personal_Number;
    tCell.colSpan = "3";
    var tHeader = table.insertRow(3);
    // Iterator for the header
	 var i = 0 ;
	  <% treatments_table.forEach(function(doc) { %>
	 tHeader.setAttribute('style','font-weight: bold; text-align:center;');
          tHeader.insertCell(i).innerHTML = " <%= doc %> ";
	 i++;
	  <% }); %>
    // Iterator for the columns which are treatment properties
	var k = 0;
    for(var i = 0; i < soldier.treatments.length; i++) { // for every treatment
      var tHeader = table.insertRow(i+4);  // create new row and insert +4 because there are 4 headers before
         <% treatments_table.forEach(function(tbl) { %> // every row put create cells
             tHeader.setAttribute('style', 'text-align:center;');
             tHeader.insertCell(k).innerHTML = soldier.treatments[i].<%=tbl%>;
		  k++;
		   <% }); %>
		   k = 0 ;
            };
        node.appendChild(table);
        document.getElementById("filtersTable").appendChild(node);
        document.getElementById("chosenSoldiersText").style.visibility = "visible";
             });
    }

    function putFilter(type, value) {
         for (i = 0; i < chosenFilters.length; i++) {
		if (value === chosenFilters[i] ){
			return;
             }
        }
      chosenFilters.push(value);
      var node = document.createElement("BUTTON");
        node.setAttribute("id", type + value);
        node.addEventListener("click", function (event) {
             removeFilter(type,value);
               event.preventDefault();
            });

     var textnode = document.createTextNode(value);
    node.appendChild(textnode);
    node.style.backgroundColor = "yellow";
        document.getElementById("filtersBarId").appendChild(node);
        document.getElementById("chosenFiltersText").style.visibility = "visible";

   var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));

        }
    }
        xhr.open('POST','/get-soldiers/'+ type +'/' + value + '/add', true);
        xhr.send({});
}
function getTreatments(braceletID) {
        for (i = 0; i < chosenBracelets.length; i++) {
		if (braceletID === chosenBracelets[i] ){
			return;
             }
        }
      chosenBracelets.push(braceletID);
     var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildTreatmentsTable(JSON.parse(this.response));
        }
    }
        xhr.open('POST','/get-soldier/'+ braceletID , true);
        xhr.send({});
}
