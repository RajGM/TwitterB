const express = require('express');

const app = express();
const bodyparser = require("body-parser");

var fs = require("fs");
const Twitter = require('twit');
const callbackURL = "http://127.0.0.1:8000";

const getTweetAndFilter = require("./getTweetsAndFilter");

const CsvReadableStream = require('csv-reader');
let inputStreamAccounts = fs.createReadStream('./accountID.csv', 'utf8');
let inputStreamComments = fs.createReadStream('./comments.csv', 'utf8');

let tagToMonitor = "earthday2022";

const jsonfile = require('jsonfile')

require('dotenv').config()

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 8000);

//Middleware for bodyparser
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());

// Router listens on / (root)
var route = require('./router');
app.use('/', route);

// Twitter API Twit init
const Client = new Twitter({
    consumer_key: process.env.Consumer_Key,
    consumer_secret: process.env.Consumer_Secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret,
    strictSSL: true,
})

//starting server
var server = app.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
    console.log("You application is running. You should be able to connect to it on http://localhost:" + app.get('port'));
});

function createStatusLink(userName, tweetID) {
    return `https://twitter.com/${userName}/status/${tweetID}`;
}

async function postTweet(textToPost, retweetLink) {

    // Client.post('statuses/update', { status: textToPost, attachment_url: retweetLink }, function (err, data, response) {
    //     if (err) return console.error(`Encountered error quoting tweet with id: ${retweetLink}, ${new Error(err.message)}`)
    //     console.log(`Quoted a tweet with id: ${retweetLink}`)
    //     console.log("Tweet DATA:", data);
    //     console.log("Response data:", response);
    // })

    Client.post('statuses/update', { status: textToPost }, function (err, data, response) {
        if (err) return console.error(`Encountered error quoting tweet with id: ${retweetLink}, ${new Error(err.message)}`)
        console.log(`Quoted a tweet with id: ${retweetLink}`)
        console.log("Tweet DATA:", data);
        console.log("Response data:", response);
    })

};

async function readAccountCSVData() {

    let allData = [];
    return new Promise(async (resolve, reject) => {
        await inputStreamAccounts
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                let dataObj = {
                    name: row[0],
                    Ticker: row[1],
                    Score: row[2],
                    handle: row[3],
                    accountID: row[4]
                }
                allData.push(dataObj);
            })
            .on('end', function () {
                resolve(allData);
                //console.log('No more rows!');
            })

    });

}

async function readCommentsCSVData() {

    let allData = [];
    return new Promise(async (resolve, reject) => {
        await inputStreamComments
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                let rowLength = row.length;
                let comment = "";
                for (var i = 2; i < rowLength; i++) {
                    comment += row[i] + " ";
                }
                let dataObj = {
                    rangeStart: parseFloat(row[0]),
                    rangeEnd: parseFloat(row[1]),
                    Comment: comment,
                }
                allData.push(dataObj);
            })
            .on('end', function () {
                resolve(allData);
                //console.log('No more rows!');
            })

    });

}

async function passAccountToCheck(accountID, tag) {
    console.log("Inside passAccountToCheck");
    console.log("All params:", accountID, tag);
    let tweetArraywithTag = [];

    let tweetArray = await getTweetAndFilter(accountID, tag);
    console.log("tweetArray: ", tweetArray);

    if (tweetArray != undefined) {
        return tweetArray;
    } else {
        return tweetArraywithTag;
    }

}

function buildCommentBasedOnScore(CSVdataAccounts, CSVdataComments, score, index) {
    let commentTemplate = getComment(CSVdataComments, score);
    commentTemplate = commentTemplate.replace("{companyname}", CSVdataAccounts[index].name);
    commentTemplate = commentTemplate.replace("{TK}", CSVdataAccounts[index].Ticker);
    commentTemplate = commentTemplate.replace("{XX%}", score);
    return commentTemplate;
}

function getComment(CSVdataComments, score) {
    for (var i = 0; i < CSVdataComments.length; i++) {
        if (score >= CSVdataComments[i].rangeStart && score <= CSVdataComments[i].rangeEnd) {
            return CSVdataComments[i].Comment;
        }
    }
}

async function checkAllAccounts(CSVdataAccounts, CSVdataComments, tag) {
    console.log("Inside checkAllAccounts");
    loadTagToMonitor();



    //Implement rate limiting here
    //For checking
    //For posting

    for (var i = 1; i < 2; i++) {

        if (i % 90 == 0) {
            //pause program for 3 minutes
            //implement rate limiting here
            //implement when accounts are less than 90
        }

        if (CSVdataAccounts[i].accountID != undefined && typeof CSVdataAccounts[i].accountID == "number") {

            let tweetCheckStatus = await passAccountToCheck(CSVdataAccounts[i].accountID, tag);
            for (let tweetFoundLength = 0; tweetFoundLength < tweetCheckStatus.length; tweetFoundLength++) {
                let tweetLink = createStatusLink(CSVdataAccounts[i].handle, tweetCheckStatus[tweetFoundLength]);
                let text2post = buildCommentBasedOnScore(CSVdataAccounts, CSVdataComments, CSVdataAccounts[i].Score, i);
                console.log("tweetLink:", tweetLink);
                console.log("text2post:", text2post);

                //postTweet(text2post, tweetLink); //this is working 
                CSVdataAccounts.splice(i, 1);
                i--;
            }

        }

    }

}

async function finalCall() {
    let CSVdataAccounts = [];
    let CSVdataComments = [];

    CSVdataAccounts = await readAccountCSVData();
    CSVdataComments = await readCommentsCSVData();
    await checkAllAccounts(CSVdataAccounts, CSVdataComments, tagToMonitor);

    setInterval(checkAllAccounts, 5000, CSVdataAccounts, CSVdataComments, tagToMonitor);

}

//finalCall();

function loadTagToMonitor() {
    let file = './tagFile.json'
    jsonfile.readFile(file, function (err, obj) {
        if (err) console.error(err)
        tagToMonitor = obj.tag.replace("#", "");
        console.log("LOADING TAGTO MONITOR:", tagToMonitor);
    })
}

async function testme(moreText) {
    console.log("TESTING TESTME");
    console.log("moreText:", moreText);
}
