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
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            buildSoldiersTable(JSON.parse(this.response));

        }
    }
    xhr.open('POST', '/get-soldiers/' + type + '/' + value + '/add', true);
    xhr.send({});
}


function removeFilter(type, value) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {//Call a function when the state changes.
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