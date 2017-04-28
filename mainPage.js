var filters = [];

var addFilter = function(fltr) {
    filters.push(fltr);
};
var filtersPrc = function() { return (100 / filters.length()); }


var addX = function (value) {
    return value + x;
};
module.exports.filtersPrc = filtersPrc;
module.exports.addFilter = addFilter;
module.exports.filters = filters; 