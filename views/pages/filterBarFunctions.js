function selectDivision(division) {
    var myNodelist = document.getElementsByTagName("ul");
    var node = document.createElement("LI");
    var textnode = document.createTextNode(division);
    node.appendChild(textnode);
    node.style.backgroundColor = "yellow";
    document.getElementById("divisionId").appendChild(node);
}
function selectUnit(unit) {
    var myNodelist = document.getElementsByTagName("ul");
    var node = document.createElement("LI");
    var textnode = document.createTextNode(unit);
    node.appendChild(textnode);
    node.style.backgroundColor = "#a64dff";
    document.getElementById("divisionId").appendChild(node);
}
function selectStatus(status) {
    var myNodelist = document.getElementsByTagName("ul");
    var node = document.createElement("LI");
    var textnode = document.createTextNode(status);
    node.appendChild(textnode);

    switch (status) {
        case "K.I.A":
            node.style.backgroundColor = "red";
            break;
        case "Heavy":
            node.style.backgroundColor = " #ff0066";
            break;
        case "Average":
            node.style.backgroundColor = "#ff7733";
            break;
        case "Light":
            node.style.backgroundColor = "whilte";
            break;
    }
    document.getElementById("divisionId").appendChild(node);
}