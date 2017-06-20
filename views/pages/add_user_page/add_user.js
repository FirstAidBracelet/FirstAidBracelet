function isDoctor(){
    var container = document.getElementById("divisions");
    var divisions = new Array();
    var divisions = army_struct.divisions;
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createTextNode("Choose Division Doctor is in charge of:"));
    container.appendChild(document.createElement("br"));
    divisions.forEach(function (div) {
        var open = '<div id="division-div" class="radio-inline"><label>';
        var input = '<input type="radio" name="division" value="' + div + '" required>';
        var close = div + '</label></div>';
        container.innerHTML += open + input + close;
    });
}

function isAgam(){
    var container = document.getElementById("divisions");
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