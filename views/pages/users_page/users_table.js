/*
In each row of the table we make three fields editable:
    name
    personal number
    division
This function defines the events when these fields are clicked to allow updating them. To do this we use x-editables
In addition we make a delete button for each user which also works with sockets
*/
function editables(user){
    //These fields will be similar to all events
    //The text box will appear instead of the previous value (inline)
    $.fn.editable.defaults.mode = 'inline';
    //The replaced value is of type text
    $.fn.editable.defaults.type = 'text';
    //The edit fields will allign to the right
    $.fn.editable.defaults.placement = 'right';

    // The name edit event. We edit the field according to class name which is "name_<user number>"
    var name = '.name_' + user.number;
    $(name).editable({
        //We keep the user's number as a future referance for when this field is edited (used upon success scenario)
        params: { number: user.number },
        //Validate the correctness of the edited field
        validate: function (value) {
            //make sure the value is not empty
            if (value == '') {
                return 'This field is required';
            }
            //make sure the value is made up only of letters
            if (!/^[a-z]?[a-z\s]*$/i.test(value)) {
                return "This field must contain only letters and space";
            }
        },
        //In case of valid update
        success: function (response, val) {
            //Find the user in the front-end array of all users and change the value of the user's name
            var usernum = $(this).data('editable').options.params.number;
            var userUpdate = usersArr.find( function(userDoc) {
                return userDoc.number == usernum;
            });
            userUpdate["name"] = val;
            //if the updated user is the connected user update the cookie
            if (usernum == getCookie("number")) {
                document.cookie = "name=" + val;
            }
            //update the back-end using sockets
            socket.emit('updateUserName', { number: usernum, name: val });
        }
    });

    // The number edit event. We edit the field according to class name which is "num_<user number>"
    var num = '.num_' + user.number;
    $(num).editable({
        //We keep the user's number as a future referance for when this field is edited (used for validation and upon success scenario)
        params: { number: user.number },
        //Validate the correctness of the edited field
        validate: function (value) {
            //make sure the field is made up only of numbers
            if (isNaN(value)) {
                return "This field needs be a number";
            }
            //make sure the field length is 7 (personal number length)
            if (value.length != '7') {
                return "This field's length needs be 7 digits";
            }
            //Because number is an exclusive field we need to make sure no other user has the same number
            //Search all users for another user with the same number
            var usernum = $(this).data('editable').options.params.number;
            var otherUser = usersArr.find(function(userDoc) {
                return (userDoc.number == value && value != usernum)
            });
            //If such a user exists return error
            if (otherUser != undefined) {
                return "This field contains non-exclusive information";
            }
        },
        //In case of valid update
        success: function (response, val) {
            //Find the user in the front-end array of all users and change the value of the user's number
            var usernum = $(this).data('editable').options.params.number;
            var userUpdate = usersArr.find( function(userDoc) {
                return userDoc.number == usernum;
            });
            userUpdate["number"] = val;
            //if the updated user is the connected user update the cookie
            if (usernum == getCookie("number")) {
                document.cookie = "number=" + num;
            }
            //update the back-end using sockets
            socket.emit('updateUserNum', { number: usernum, num: val });
        }
    });

    // The division edit event. We edit the field according to class name which is "div_<user number>".
    var div = '.div_' + user.number;
    //This event is possible only for doctors since agam's don't have a division
    if (user.type == "doctor"){
        $(div).editable({
            //We keep the user's number as a future referance for when this field is edited (used upon success scenario)
            params: { number: user.number },
            //Validate the correctness of the edited field
            validate: function (value) {
                //make sure the field isn't empty
                if (value == '') {
                    return 'This field is required';
                }
            },
            //In case of valid update
            success: function (response, val) {
                //Change value to first letter uppercase and the rest lowecase
                var division = val.substring(0, 1).toUpperCase() + val.substring(1, val.length).toLowerCase();
                //Find the user in the front-end array of all users and change the value of the user's division
                var usernum = $(this).data('editable').options.params.number;
                var userUpdate = usersArr.find( function(userDoc) {
                    return userDoc.number == usernum;
                });
                userUpdate["division"] = division;
                //if the updated user is the connected user update the cookie
                if (usernum == getCookie("number")) {
                    document.cookie = "division=" + val;
                }
                //update the back-end using sockets
                socket.emit('updateUserDiv', { number: usernum, div: division });
            }
        });
    }
    
    // The delete user event. We delete the user according to the buttob class name which is "del_<user number>".
    var del = '#delete_' + user.number;
    $(del).click( function() {
        //When a delete is selected we add an alert to ask for confirmation
        var r = confirm("Are you sure you want to delete?");
        if (r == true) {
            //If delete confirmed we remove the row
            $(del).parents('tr').remove();
            //we find and remove the user from the front-end array
            var usernum = $(this).parents('tr').attr('id');
            var userIndex = usersArr.findIndex( function(userDoc) {
                return userDoc.number == usernum;
            });
            usersArr.splice(userIndex, 1);
            //we update the back-end using sockets
            socket.emit('removeUser', { number: usernum });
        }
    });
}

/*
For every user that is currntly connected we prevent deleting that user by disabling the delete button (editing is still possible)
Also highlights cuttent user in a different color
In addition adds captions to current user row and disable buttons explaining reason 
*/
function markUsers(){
    //get the current user number
    var num = getCookie("number");
    //Change the user's row color and add caption
    document.getElementById(num).className = "success";
    document.getElementById(num).title = "Current user";
    //Go over all users and check their status
    users.forEach(function (user) {
        if (user.status == "connected") {
            //If "connected" then disable the button with the user's number in it's class name and add caption (the user's delete button)
            var udelete = "delete_" + user.number;
            document.getElementById(udelete).disabled = true;
            document.getElementById(udelete).title = "Cannot delete connected user";
        }
    });
}

/*
This is an event that calls the editable function for each user (thus making the fields editable) 
and disables connected users delete buttons once the page has loaded
*/
$(document).ready(function () {
    usersArr.forEach(function (user) {
       editables(user); 
    });
    markUsers();
});

/*
Event which overrides the add user form submit button and updates the back-end via socket with no need to refresh or re-render the page
*/
$("input[name=Add]").click(function(){
    //Disable buttons default response
    event.preventDefault();
    /*
    First we check that all required fields are filled correctly
    */
    var user = checkUsername($("input[name=user]").val());
    var pass = checkPassword($("input[name=password]").val());
    var type = checkType($("input[name=type]:checked").val());
    var div = "";
    if (type == "doctor"){
        div = checkDiv($("input[name=division]").val()); 
    }
    var name = checkName($("input[name=name]").val());
    var num = checkNum($("input[name=number]").val());
    //If one of the fields returned false we exit
    if (!user || !pass || !type || !div || !name || !num) return false;

    //Then we search for a user with a similar username or number (the two exclusive fields)
    var userDoc = usersArr.find(function(userDoc) {
        return (userDoc.user == user || userDoc.number == num);
    });
    //If such a user is found add alert to the fitting field and exit
    if (userDoc != undefined) {
        if (userDoc.user == user) {
            document.getElementById("numberError").innerHTML = "";
            document.getElementById("userError").innerHTML = "Non-exclusive information";
            return false;
        } else {
            document.getElementById("userError").innerHTML = "";
            document.getElementById("numberError").innerHTML = "Non-exclusive information";
            return false;
        }
    } else {
        document.getElementById("userError").innerHTML = "";  
        document.getElementById("numberError").innerHTML = "";
    }
    
    //The form has passed all checks. At this point we clear it to make it easier to add another user later
    $(this).closest('form').find("input[type=text], input[type=password]").val("");
    $(this).closest('form').find("input[type=radio]:checked").prop('checked', false);
    isAgam();
    
    //Create the new row in the table
    var tdUser = "<td>" + user + "</td>";
    var tdType = "<td>" + type + "</td>";
    var tdName = "<td><a href='#' class='name_" + num + "'>" + name + "</a></td>";
    var tdNum = "<td><a href='#' class='num_" + num + "'>" + num + "</a></td>";
    var tdDiv = "<td><a href='#' class='div_" + num + "'>" + div + "</a></td>";
    var tdStatus = "<td>not connected</td>";
    var tdButton = "<td><button type='submit' id='delete_" + num + "' class='btn btn-default btn-sm delete'>Delete</button></td>";
    var userRow = "<tr id='" + num + "'>" + tdUser + tdType + tdName + tdNum + tdDiv + tdStatus + tdButton + "</tr>";
    $("table tbody").append(userRow);

    //Create a new object of the user
    var newUser = { user: user, password: pass, type: type, name: name, number: num, status: "not connected" };
    if (type == "doctor"){
        newUser.division = div;
    }

    //Add the object to the front-end array
    usersArr.push(newUser);
    //Add the object to the back-end via socket
    socket.emit('addUser', { user : newUser });
    //Make the new row fields editable
    editables(newUser);
    return;
});