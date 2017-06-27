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
        },
        success: function (response, val) {
            var username = $(this).data('editable').options.params.user;
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
                socket.emit('updateUserDiv', { user: username, div: val });
            }
        });
    }
    
    var del = '#delete_' + user.user;
    $(del).click( function() {
        $(del).parents('tr').remove();
        var uname = $(this).parents('tr').attr('id');
        socket.emit('removeUser', { user: uname });
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
        if (res == "Non-exclusive information"){
            document.getElementById("userError").innerHTML = res;
            document.getElementById("passError").innerHTML = res;
        }
        return false;
    } else {
        document.getElementById("numberError").innerHTML = "";
        document.getElementById("userError").innerHTML = "";
        document.getElementById("passError").innerHTML = "";
    }

    var tdUser = "<td>" + user + "</td>";
    var tdType = "<td>" + type + "</td>";
    var tdName = "<td><a href='#' class='name_" + user + "'>" + name + "</a></td>";
    var tdNum = "<td><a href='#' class='num_" + user + "'>" + num + "</a></td>";
    var tdDiv = "<td><a href='#' class='div_" + user + "'>" + div + "</a></td>";
    var tdStatus = "<td>not connected</td>";
    var tdButton = "<td><button type='submit' id='delete_" + user + "' class='btn btn-default btn-sm delete'>Delete</button></td>";
    var markup = "<tr id='" + user + "'>" + tdUser + tdType + tdName + tdNum + tdDiv + tdStatus + tdButton + "</tr>";
    $("table tbody").append(markup);
    var newUser = { user: user, password: pass, type: type, name: name, number: num };
    if (type == "doctor"){
        newUser.division = div;
    }
    socket.emit('addUser', { user : newUser });
    editables(newUser);
    return;
});