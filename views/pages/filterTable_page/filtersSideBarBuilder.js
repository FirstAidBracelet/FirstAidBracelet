/*
Builds the filters side bar.

 @pageParam filters - array that we pass to soldiersFiltersTable.ejs page when we render it.
            Each element in represents filter name.
 Attention - <% %> iterators are "EJS" syntax. (Read about ejs module)
 Attention - Filters names must to be an EXISTING soldier object field (property) (Status,Division,Unit ... etc)
*/
function buildAllFilters() {
    <% filters.forEach(function (filter) { %>
        filterButtonBuilder('<%= filter %>');
        <% }); %>
        buildLocationFilterButton();
}

/*
Auxilary functionf for updatePopovers() - to add dynamicly events

 @param myFilter - the type of the filter. ATTENTION!!! Must to be an EXISTING soldier object field (property) (Status,Division,Unit ... etc)
 @param btn - HTML DOM button element
 
*/
function addFilterEvent(myFilter, btn) {  
    btn.addEventListener("click", function (event) {
        putFilter(myFilter, btn.innerHTML);
        event.preventDefault();
    });
}

/*
 Creates the popover (when we press on the filters button)
*/
function updatePopovers() {
    $('[rel="popover"]').popover({
        container: 'body',
        html: true,
        content: function () {
            var myFilter = $($(this).data('popover-content')).children()[0].getAttribute("filter");
            var child = [];
            child = $($(this).data('popover-content')).children();
            var list = document.createElement('div');

            list.setAttribute("id", myFilter + "dropdown");
            for (var i = 0; i < child.length; i++) {
                var btn = document.createElement('BUTTON');
                btn.setAttribute("class", "list-group-item");
                btn.setAttribute("type", "button");
                btn.innerHTML = child[i].getAttribute("filterValue");
                addFilterEvent(myFilter, btn);
                list.appendChild(btn);

            };
            return list;
        }
    })
};

/*
 Builds specific filter button

 @param filterName - filters name - must to be an EXISTING soldier object field (property) (Status,Division,Unit ... etc)
 @localPageParam filteredSoldiers - local array of soldiers kind of - "cache" that represents the soldiers acordingly to filter requests.
 
*/

function filterButtonBuilder(filterName) {
    var existingFilters = [];
    var dropdown = document.createElement('div'); // The dropdown element

    dropdown.setAttribute("class", "dropdown-menu");
    dropdown.setAttribute("id", filterName + "dropdown");

    for (var i = 0; i < filteredSoldiers.length; i++) {
        if (!filteredSoldiers[i][filterName]) {
            continue;
        }
        var existingFilter = false;
        for (var j = 0; j < existingFilters.length; j++) {
            if (existingFilters[j] == filteredSoldiers[i][filterName]) {
                existingFilter = true;
                break;
            }

        }
        if (existingFilter == true) {
            continue;
        }
        existingFilters.push(filteredSoldiers[i][filterName]);

        var btn = document.createElement('div');
        btn.setAttribute("filter", filterName);
        btn.setAttribute("filterValue", filteredSoldiers[i][filterName]);
        dropdown.appendChild(btn);

    };

    if (document.getElementById(filterName + "dropdownButton") !== null) { // remove old if exists
        document.getElementById(filterName + "dropdownButton").remove();
    }

    var dropdownButton = document.createElement("button"); // The dropdown menu button
    dropdownButton.setAttribute("id", filterName + "dropdownButton");
    dropdownButton.innerHTML = filterName;
    dropdownButton.setAttribute("class", "btn btn-primary dropdown-toggle");
    dropdownButton.setAttribute("rel", "popover");
    dropdownButton.setAttribute("data-toggle", "popover");
    dropdownButton.setAttribute("data-popover-content", "#" + filterName + "dropdown");
    dropdownButton.setAttribute("type", "button");
    dropdownButton.setAttribute("data-trigger", "focus");
    dropdownButton.appendChild(dropdown);
    document.getElementById("filtersMenu").appendChild(dropdownButton);
    updatePopovers();
}
/*
 Builds Location filter button

 As we mentioned in locationFilteringConfigurations.js file, he functionality of location filtering  was developed on the last few days of our work.
There fore there is no configuration file for locations and coordination, and the soldiers do not have "Location" field when they added to Database
(only lat/long fileds). Therefore we need to build this button separately from other filers in our sidebar.

 @localPageParam filteredSoldiers - local array of soldiers kind of - "cache" that represents the soldiers acordingly to filter requests.

 
*/
function buildLocationFilterButton() {
    var existingFilters = [];
    var dropdown = document.createElement('div'); 
    dropdown.setAttribute("class", "dropdown-menu");
    dropdown.setAttribute("id", "Location" + "dropdown");

    for (var i = 0; i < filteredSoldiers.length; i++) {
        var lat = filteredSoldiers[i]["Latitude"];
        var long = filteredSoldiers[i]["Longitude"];

        if (!lat || !long) {
            continue;
        }
        var sLocation = soldierLocation(filteredSoldiers[i]);
        socket.emit('updateLocationFilter', { braceletId: filteredSoldiers[i]["Bracelet_ID"], location: sLocation });
        var existingFilter = false;
        for (var j = 0; j < existingFilters.length; j++) {
            if (existingFilters[j] == sLocation) {
                existingFilter = true;
                break;
            }

        }
        if (existingFilter == true) {
            continue;
        }
        existingFilters.push(sLocation);

        var btn = document.createElement('div');
        btn.setAttribute("filter", "Location");
        btn.setAttribute("filterValue", sLocation);
        dropdown.appendChild(btn);

    };

    if (document.getElementById("Location" + "dropdownButton") !== null) { // remove old if exists
        document.getElementById("Location" + "dropdownButton").remove();
    }

    var dropdownButton = document.createElement("button"); // The dropdown menu button
    dropdownButton.setAttribute("id", "Location" + "dropdownButton");
    dropdownButton.innerHTML = "Location";
    dropdownButton.setAttribute("class", "btn btn-primary dropdown-toggle");
    dropdownButton.setAttribute("rel", "popover");
    dropdownButton.setAttribute("data-toggle", "popover");
    dropdownButton.setAttribute("data-popover-content", "#" + "Location" + "dropdown");
    dropdownButton.setAttribute("type", "button");
    dropdownButton.setAttribute("data-trigger", "focus");
    dropdownButton.appendChild(dropdown);
    document.getElementById("filtersMenu").appendChild(dropdownButton);
    updatePopovers();
}
