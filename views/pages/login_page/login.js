/*
Upon submition of the form we search the users for a username password pair similar
to the entered username and password. If the user exists we keep cookies of the user's info for
future reference. Otherwise we return an error.
*/
function validateForm() {
    //Pull typed username and password
	var login = document.forms["loginForm"];
    var uname = login["currentUser"].value;
	var psw = login["psw"].value;
    //If one or both fields are empty return error
	if (uname == "" || psw == "") {
       alert("All fields must be filled out");
	   return false;
	}

    //Search user database for match of username and password
	var user = usersArray.find( function(user) {
		return (user.user == uname && user.password == psw);
    });
    
    if (user != undefined){
        //In case of match - keep cookies of user's info
		document.cookie = "user=" + uname;
		document.cookie = "type=" + user.type;
		document.cookie = "number=" + user.number;
		document.cookie = "name=" + user.name;
        //If the user is a doctor we need to save his division.
		if (user.type == "doctor") {
			document.cookie = "division=" + user.division;
		}
		return true;
	}
    //In case of no match return error
	alert("The username or password is incorrect");
	return false;
}