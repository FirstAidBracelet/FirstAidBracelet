//Check that username is not empty
function checkUsername(user) {
    if (user == ""){
        document.getElementById("userError").innerHTML = "Field is Required";
        return false;
    }
    document.getElementById("userError").innerHTML = "";
    return user;
}

//Check that password is not empty
function checkPassword(pass) {
    if (pass == ""){
        document.getElementById("passError").innerHTML = "Field is Required";
        return false;
    }
    document.getElementById("passError").innerHTML = "";
    return pass;
}

//Check that a type is selected
function checkType(type) {
    if (type == undefined){
        document.getElementById("typeError").innerHTML = "Field is Required";
        return false;
    }
    document.getElementById("typeError").innerHTML = "";
    return type;
}

//Check that division is not empty
function checkDiv(div) {
    if (div == ""){
        document.getElementById("divError").innerHTML = "Field is Required";
        return false;
    }
    document.getElementById("divError").innerHTML = "";
    div = div.substring(0, 1).toUpperCase() + div.substring(1, div.length).toLowerCase();
    return div;
}

//Check that username is not empty and contains only letters
function checkName(name) {
    if (name == ""){
        document.getElementById("nameError").innerHTML = "Field is Required";
        return false;
    }
    if (!/^[a-z]?[a-z\s]*$/i.test(name)) {
        document.getElementById("nameError").innerHTML = "This field must contain only letters and space";
        return false;
    }
    document.getElementById("nameError").innerHTML = "";
    return name
}

//Check that number is not empty, contains only numerals, and is of length 7 (personal number length)
function checkNum(num) {
    if (num == ""){
        document.getElementById("numberError").innerHTML = "Field is Required";
        return false;
    }
    if (isNaN(num)){
        document.getElementById("numberError").innerHTML = "P.N is not a number";
        return false;
    }
    if (num.length != '7'){
        document.getElementById("numberError").innerHTML = "P.N length is not correct. P.N needs to be 7 digits";
        return false;
    }
    document.getElementById("numberError").innerHTML = "";
    return num;
}