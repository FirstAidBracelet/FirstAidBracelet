function editables(user){
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.type = 'text';
    $.fn.editable.defaults.placement = 'right';

    var name = '.name_' + user.user;
    $(name).editable({
        params: { user: user.user },
        validate: function (value) {
            if (value == '') {
                return 'This field is required';
            }
            if (!/^[a-z]?[a-z\s]*$/i.test(value)) {
                return "This field must contain only letters and space";
            }
        },
        success: function (response, val) {
            var username = $(this).data('editable').options.params.user;
            var userUpdate = usersArr.find( function(userDoc) {
                return userDoc.user == username;
            });
            userUpdate["name"] = val;
            socket.emit('updateUserName', { user: username, name: val });
        }
    });

    var num = '.num_' + user.user;
    $(num).editable({
        params: { user: user.user },
        validate: function (value) {
            if (isNaN(value)) {
                return "This field needs be a number";
            }
            if (value.length != '7') {
                return "This field's length needs be 7 digits";
            }
            var res;
            var username = $(this).data('editable').options.params.user;
            usersArr.forEach(function(userDoc) {
                if (userDoc.number == value && userDoc.user != username){
                    res = "This field contains non-exclusive information";
                }
            });
            if (res == "This field contains non-exclusive information") {
                return res;
            }
        },
        success: function (response, val) {
            var username = $(this).data('editable').options.params.user;
            var userUpdate = usersArr.find( function(userDoc) {
                return userDoc.user == username;
            });
            userUpdate["number"] = val;
            socket.emit('updateUserNum', { user: username, num: val });
        }
    });

    var div = '.div_' + user.user;
    if (user.type == "doctor"){
        $(div).editable({
            params: { user: user.user },
            validate: function (value) {
                if (value == '') {
                    return 'This field is required';
                }
            },
            success: function (response, val) {
                var username = $(this).data('editable').options.params.user;
                var userUpdate = usersArr.find( function(userDoc) {
                    return userDoc.user == username;
                });
                userUpdate["division"] = val;
                socket.emit('updateUserDiv', { user: username, div: val });
            }
        });
    }
    
    var del = '#delete_' + user.user;
    $(del).click( function() {
        var r = confirm("Are you sure you want to delete?");
        if (r == true) {
            $(del).parents('tr').remove();
            var username = $(this).parents('tr').attr('id');
            var userIndex = usersArr.findIndex( function(userDoc) {
                return userDoc.user == username;
            });
            usersArr.splice(userIndex, 1);
            socket.emit('removeUser', { user: username });
        }
    });
}

$(document).ready(function () {
    usersArr.forEach(function (user) {
       editables(user); 
    });
});

var uname = getCookie("user");
document.getElementById(uname).className = "success";
document.getElementById(uname).title = "Current user";
users.forEach(function (user) {
    var status = user.status;
    if (status == "connected") {
        uname = user.user;
        var udelete = "delete_" + uname;
        document.getElementById(udelete).disabled = true;
        document.getElementById(udelete).title = "Cannot delete connected user";
    }
});


$("input[name=Add]").click(function(){
    event.preventDefault();
    var user = $("input[name=user]").val();
    if (user == ""){
        document.getElementById("userError").innerHTML = "Field is Required";
        return false;
    } else {
        document.getElementById("userError").innerHTML = "";
    }
    var pass = $("input[name=password]").val();
    if (pass == ""){
        document.getElementById("passError").innerHTML = "Field is Required";
        return false;
    } else {
        document.getElementById("passError").innerHTML = "";
    }
    var type = $("input[name=type]:checked").val();
    if (type == undefined){
        document.getElementById("typeError").innerHTML = "Field is Required";
        return false;
    } else {
        document.getElementById("typeError").innerHTML = "";
    }
    var div = "";
    if (type == "doctor"){
        div = $("input[name=division]").val();
        if (div == ""){
            document.getElementById("divError").innerHTML = "Field is Required";
            return false;
        } else {
            document.getElementById("divError").innerHTML = "";
        }
    }
    var name = $("input[name=name]").val();
    if (name == ""){
        document.getElementById("nameError").innerHTML = "Field is Required";
        return false;
    } else {
        document.getElementById("nameError").innerHTML = "";
    }
    var num = $("input[name=number]").val();
    if (num == ""){
        document.getElementById("numberError").innerHTML = "Field is Required";
        return false;
    } else {
        document.getElementById("numberError").innerHTML = "";
    }
    var res = validateForm();
    if (res != "true"){
        document.getElementById("numberError").innerHTML = res;
        return false;
    } else {
        document.getElementById("numberError").innerHTML = "";
    }
    var userDoc = usersArr.find(function(userDoc) {
        return (userDoc.user == user || userDoc.password == pass || userDoc.number == num);
    });
    if (userDoc != undefined) {
        if (userDoc.user == user) {
            document.getElementById("passError").innerHTML = "";
            document.getElementById("numberError").innerHTML = "";
            document.getElementById("userError").innerHTML = "Non-exclusive information";
            return false;
        } else if (userDoc.password == pass) {
            document.getElementById("userError").innerHTML = "";
            document.getElementById("numberError").innerHTML = "";
            document.getElementById("passError").innerHTML = "Non-exclusive information";
            return false;
        } else {
            document.getElementById("userError").innerHTML = "";
            document.getElementById("passError").innerHTML = "";
            document.getElementById("numberError").innerHTML = "Non-exclusive information";
            return false;
        }
    }else {
        document.getElementById("userError").innerHTML = "";
        document.getElementById("passError").innerHTML = "";    
        document.getElementById("numberError").innerHTML = "";
    }
    
    $(this).closest('form').find("input[type=text], input[type=password]").val("");
    $(this).closest('form').find("input[type=radio]:checked").prop('checked', false);
    isAgam();

    var tdUser = "<td>" + user + "</td>";
    var tdType = "<td>" + type + "</td>";
    var tdName = "<td><a href='#' class='name_" + user + "'>" + name + "</a></td>";
    var tdNum = "<td><a href='#' class='num_" + user + "'>" + num + "</a></td>";
    var tdDiv = "<td><a href='#' class='div_" + user + "'>" + div + "</a></td>";
    var tdStatus = "<td>not connected</td>";
    var tdButton = "<td><button type='submit' id='delete_" + user + "' class='btn btn-default btn-sm delete'>Delete</button></td>";
    var markup = "<tr id='" + user + "'>" + tdUser + tdType + tdName + tdNum + tdDiv + tdStatus + tdButton + "</tr>";
    $("table tbody").append(markup);
    var newUser = { user: user, password: pass, type: type, name: name, number: num, status: "not connected" };
    if (type == "doctor"){
        newUser.division = div;
    }
    usersArr.push(newUser);
    socket.emit('addUser', { user : newUser });
    editables(newUser);
    return;
});