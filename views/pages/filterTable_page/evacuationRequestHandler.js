/*
Change given soldier current evacuation request property (field)

 @param braceletID - soldier bracelet ID
 @localPageParam filteredSoldiers - local array of soldiers kind of local "cache" .
 @return currStatus - the evacuation status before the change
*/
function changeCurrentEvacuationRequestAndReturnOld(braceletID) {
    var currStatus;
    for (var i = 0; i < filteredSoldiers.length; i++) {
        if (filteredSoldiers[i].Bracelet_ID == braceletID) {
            currStatus = filteredSoldiers[i].evacuation_request;
            if (currStatus == "false") {
                filteredSoldiers[i].evacuation_request = "true";
            } else {
                filteredSoldiers[i].evacuation_request = "false";
            }
            return currStatus;
        }
    }
    return currStatus;
}

/*
Change evacuation request in soldiers table and update the database accordingly

 @param braceletID - soldier bracelet ID

*/
function evacuationStatusChange(braceletID) { 
    var cnfrmation = confirm("Are you sure you want to change patient evacuation status?");
    var newStatus;
    var currStatus;
    if (cnfrmation == true) {
        currStatus = changeCurrentEvacuationRequestAndReturnOld(braceletID);
        if (currStatus == "false") {
            newStatus = "true";
            document.getElementById("evacButton" + braceletID).style.backgroundColor = "#b3ffcc";
        } else {
            document.getElementById("evacButton" + braceletID).style.backgroundColor = "#e6e6e6";
            newStatus = "false";
        }

        document.getElementById("evacButton" + braceletID).innerHTML = newStatus;
        socket.emit('updateEvacuationStatus', { braceletId: braceletID, status: newStatus }); // socket request for backend to update evacuation status in database
    }
}