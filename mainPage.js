var filters = [];

var addFilter = function (fltr) {
    for (i = 0; i < filters.length; i++) {
        if (fltr === filters[i]) {
            return;
        }
    }
    filters.push(fltr);
};


module.exports.addFilter = addFilter;
module.exports.filters = filters; 