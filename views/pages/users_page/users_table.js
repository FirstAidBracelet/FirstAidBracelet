$(document).ready(function () {

    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.type = 'text';
    $.fn.editable.defaults.placement = 'right';

    usersArr.forEach(function (user) {
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
    $('table').on('click', '.delete', function () {
        $(this).parents('tr').remove();
        socket.emit('removeUser', { user: uname });
    });
});