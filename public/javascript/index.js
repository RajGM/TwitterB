console.log("Working");

let changeMonitorTagButton = document.getElementById("changeMonitorTagButton");
let tag = document.getElementById("tag");

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
            var response = JSON.parse(this.responseText);
            console.log(this.responseText);
            if (response.logInfo == "Fail") {
                console.log("Incorrect User Name or password");
                //handle fail response here
            } else if (response.logInfo == "Success") {
                console.log("Success");
                //handle success response here
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