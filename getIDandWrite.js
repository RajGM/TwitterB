var userID = require('./get_users_with_bearer_token.js');

var fs = require("fs");
// READ CSV INTO STRING
var data = fs.readFileSync("BotDataEarthDay.csv").toLocaleString();

var newData = [];

async function fetchUserID(userNameTest) {
    var userIDNum = await userID.getUserID(userNameTest);
    return userIDNum;
}

async function updateCSVdata() {
    var rowData = data.split("\n"); // SPLIT ROWS
    for (var i = 1; i < data.length ; i++) {

        if(rowData[i] == undefined) {
            continue;
        }

        var columns = rowData[i].split(","); //SPLIT COLUMNS
        var userName = columns[3].replace(/(\r\n|\n|\r)/gm, "");

        if (userName == " " || userName.length == 0) {
            continue;
        }

        var rowToAdd = columns;
        rowToAdd[3] = rowToAdd[3].replace(/(\r\n|\n|\r)/gm, "");
        
        var userIDNum = await fetchUserID(userName);
        if (userIDNum == "notFound") {
            rowToAdd[4] = "\n"
        } else {
            rowToAdd[4] = userIDNum + "\n";
        }

        newData[i] = rowToAdd;

    }

    writeDataToCSV();

}

function writeDataToCSV() {
    var csvData = newData.toString();
    fs.writeFile('./fileWithID.csv', csvData, 'utf8', function (err) {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else {
            console.log('It\'s saved!');
        }
    });

    console.log("Data written to CSV");
}

updateCSVdata();
