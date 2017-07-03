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


    function evacuationStatusChange(braceletID) { // Changing the status of evacuation request on click
        var cnfrmation = confirm("Are you sure you want to change patient evacuation status?");
        var newStatus;
        var currStatus;
        if (cnfrmation == true) {
          currStatus =  changeCurrentEvacuationRequestAndReturnOld(braceletID);
            if (currStatus == "false") {
                newStatus = "true";
                 document.getElementById("evacButton" + braceletID).style.backgroundColor = "#b3ffcc";
            } else {
                document.getElementById("evacButton" + braceletID).style.backgroundColor = "#e6e6e6";
            newStatus = "false";
            }

       document.getElementById("evacButton" + braceletID).innerHTML = newStatus;
       socket.emit('updateEvacuationStatus', { braceletId: braceletID , status: newStatus });
     }
   }