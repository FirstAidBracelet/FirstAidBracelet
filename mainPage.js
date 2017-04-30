var filters = [];

var addFilter = function (fltr) {
    filters.push(fltr);
};


module.exports.addFilter = addFilter;
module.exports.filters = filters; 