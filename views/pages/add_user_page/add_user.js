function isDoctor(){
    var container = document.getElementById("division");
    var open = '<div class="form-group">';
    var label = '<label><b>Division</b></label>';
    var input = '<input type="text" class = "form-control" placeholder="Enter Division" name="division" required>';
    var close = '</div>';
    container.innerHTML = open + label + input + close;
}

function isAgam(){
    var container = document.getElementById("division");
    container.innerHTML = "";
}

function validateForm(){
    var number = document.forms["addUser"]["number"].value;
    if (isNaN(number)){
        alert("P.N is not a number");
        return false;
    }
    if (number.length != '7'){
        alert("P.N length is not correct. P.N needs to be 7 digits");
        return false;
    }
    var uname = document.forms["addUser"]["user"].value;
    var psw = document.forms["addUser"]["password"].value;
    users.forEach(function(doc) {
        if (doc.user == uname || doc.password == psw || doc.number == number){
            alert("Non-exclusive information");
            return false;
        }
    });
    return true;
}