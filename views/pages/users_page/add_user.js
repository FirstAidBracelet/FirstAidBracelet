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
        return "P.N is not a number";
    }
    if (number.length != '7'){
        return "P.N length is not correct. P.N needs to be 7 digits";
    }
    var uname = document.forms["addUser"]["user"].value;
    var psw = document.forms["addUser"]["password"].value;
    var res = "true";
    return res;
}