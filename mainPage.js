var filters = [];

var addFilter = function(fltr) {
    filters.push(fltr);
};
var numOfFilters = function() { return filters.length(); }


var addX = function (value) {
    return value + x;
};
module.exports.numOfFilters = numOfFilters;
module.exports.addFilter = addFilter;
module.exports.filters = filters; 