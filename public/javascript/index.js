console.log("Working");

let changeMonitorTagButton = document.getElementById("changeMonitorTagButton");
let tag = document.getElementById("tag");
let monitorStatusDiv = document.getElementById("monitorStatusDiv");

tag.onchange = function () {
    console.log("tag:" + tag.value);
}

changeMonitorTagButton.onclick = function () {

    var objSent = {
        tag: "",
    }

    objSent.tag = tag.value;
    
    var jsonFormat = JSON.stringify(objSent);
    try {
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            console.log(this.status);
            
            if (this.status == "200") {
                monitorStatusDiv.innerHTML = "Tag Change Done";
            } else{
                monitorStatusDiv.innerHTML = "Tag Change Failed";
            }
        };
        xhttp.open("POST", "/", true);
        xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
        xhttp.send(jsonFormat);
    }
    catch (err) {
        console.log("Error" + err);
    }


}