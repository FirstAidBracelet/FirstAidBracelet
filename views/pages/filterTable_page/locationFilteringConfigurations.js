/*
This script is for defining location coordinates.
The functionality to give location alias based coordinates was developed on the last few days of our work.
There fore there is no configuration file for locations and coordination definitions.
You may use this Script to define new location aliases lik "north ,center ,south" based on the
longitude and latitude that you will choose, As we see on this page script, and then add the functionality
to soldierLocation() function that will update the soldier location when she will be called.
*/


var North = { "maxLat": "33.3", "minLat": "32.46", "maxLong": "35.9", "minLong": "34.8" };
var Center = { "maxLat": "32.46", "minLat": "31.67", "maxLong": "35.57", "minLong": "34.55" };
var South = { "maxLat": "31.67", "minLat": "29.49", "maxLong": "35.57", "minLong": "34.21" };

function isNorth(sld) {
    return (sld.Latitude <= North.maxLat && sld.Latitude >= North.minLat && sld.Longitude <= North.maxLong && sld.Longitude >= North.minLong);
}
function isCenter(sld) {
    return (sld.Latitude <= Center.maxLat && sld.Latitude >= Center.minLat && sld.Longitude <= Center.maxLong && sld.Longitude >= Center.minLong);
}

function isSouth(sld) {
    return (sld.Latitude <= South.maxLat && sld.Latitude >= South.minLat && sld.Longitude <= South.maxLong && sld.Longitude >= South.minLong);
}

/*
Return the Location allias based on soldier long/lat coordinates.

 @param sld - soldier as a legal JSON object.
 @return location allias calculated based on upper script configurations.
*/

function soldierLocation(sld) {
    if (isNorth(sld)) {
        return "North";
    }
    if (isCenter(sld)) {
        return "Center";
    }
    if (isSouth(sld)) {
        return "South";
    }
    return;
}

