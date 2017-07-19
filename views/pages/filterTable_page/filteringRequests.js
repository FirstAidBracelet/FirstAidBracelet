/*
Applies chosen filter on current soldiers table and REBUILD the table acordingly.
Attention - the function uses POST request that should be handled in index.js

 @param type - the type of the filter. ATTENTION!!! Must to be an EXISTING soldier object field (property) (Status,Division,Unit ... etc)
 @param value - filter value . ( Example if type is "Status" then value must to be "Severe/Dead/ ... etc")
 @localPageParam chosenFilters - local array of chosen filters names , to prevent duplicated filters option.
 
*/
function putFilter(type, value) {
    for (i = 0; i < chosenFilters.length; i++) {
        if (value === chosenFilters[i]) {
            return;
        }
    }
    chosenFilters.push(value);
    var node = document.createElement("BUTTON");
    node.setAttribute("id", type + value);
    node.addEventListener("click", function (event) {
        removeFilter(type, value);
        event.preventDefault();
    });

    var textnode = document.createTextNode(value);
    node.appendChild(textnode);
    node.style.backgroundColor = "yellow";
    document.getElementById("filtersBarId").appendChild(node);
    document.getElementById("chosenFiltersText").style.visibility = "visible";

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));

        }
    }
    xhr.open('POST', '/get-soldiers/' + type + '/' + value + '/add', true);
    xhr.send({});
}


/*
Removes selected filter and applies the change on current soldiers table - REBUILD the table acordingly .
Attention - the function uses POST request that should be handled in index.js

 @param type - the type of the filter. ATTENTION!!! Must to be an EXISTING soldier object field (property) (Status,Division,Unit ... etc)
 @param value - filter value . ( Example if type is "Status" then value must to be "Severe/Dead/ ... etc")
 @localPageParam chosenFilters - local array of chosen filters names , to prevent duplicated filters option.
 
*/

function removeFilter(type, value) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));

            for (i = 0; i < chosenFilters.length; i++) {
                if (value === chosenFilters[i]) {
                    chosenFilters.splice(i, 1);
                    document.getElementById(type + value).remove();
                    if (chosenFilters.length == 0) {
                        document.getElementById("chosenFiltersText").style.visibility = "hidden";
                    }
                    break;
                }
            }
        }
    }
    xhr.open('POST', '/get-soldiers/' + type + '/' + value + '/remove', true);
    xhr.send({});
}