/*
Events to wait for when a type is selected for the new user and accordingly add remove division field
*/
var type = document.addUser.type;
//type[0] = 'doctor'
type[0].onclick = function() {
	isDoctor();
};
//type[1] = 'agam'
type[1].onclick = function() {
	isAgam();
};

/*
If the added user is of type doctor we add a required field to state the doctor's division
This function is called once the radio 'doctor' is marked in add_user.ejs
*/
function isDoctor(){
    var container = document.getElementById("division");
    //add label and input text for new field
    var open = '<div class="form-group">';
    var label = '<label><b>Division</b></label>';
    var input = '<input type="text" class = "form-control" placeholder="Enter Division" name="division" required>';
    var close = '</div>';
    container.innerHTML = open + label + input + close;
}

/*
If the added user is of type agam we remove the required field to state the the user's division
This function is called once the radio 'agam' is marked in add_user.ejs
*/
function isAgam(){
    var container = document.getElementById("division");
    container.innerHTML = "";
}