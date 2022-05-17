const express = require('express');

const app = express();
const bodyparser = require("body-parser");
var fs = require("fs");

const getTweetAndFilter = require("./getTweetsAndFilter");
const CsvReadableStream = require('csv-reader');
let inputStream = fs.createReadStream('./BotDataEarthDay.csv', 'utf8');

let CSVdata = [];

readCSVData();

const callbackURL = "http://127.0.0.1:8000";

let allKeys = {};

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

// Twitter API init
const TwitterApi = require('twitter-api-v2').default;
const twitterClient = new TwitterApi({
    clientId: process.env.ClientId,
    clientSecret: process.env.ClientSecret,
});

//starting server
var server = app.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
    console.log("You application is running. You should be able to connect to it on http://localhost:" + app.get('port'));
});

let tweet = "Long time no tweet #Bitcoin  ";
let linkTest = "https://twitter.com/RajGM_Hacks/status/1511364821320892416";
let finalTweet = tweet + linkTest;

let code = "";

let globalClient;
let globalAccessToken;
let globalRefreshToken;

async function allCall() {

    //auth Step
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        callbackURL,
        { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
    );
    console.log("url:", url);
    console.log("codeVerifier:", codeVerifier);
    console.log("state:", state);

    allKeys = {
        "url": url,
        "codeVerifier": codeVerifier,
        "state": state
    }

    //to here

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await readline.question('Enter code?', async name => {
        code = name;
        console.log(`Hey there ${name}!`);

        const {
            client: loggedClient,
            accessToken,
            refreshToken,
        } = await twitterClient.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: callbackURL,
        });

        globalClient = loggedClient;
        globalAccessToken = accessToken;
        globalRefreshToken = refreshToken;

        allKeys["accessToken"] = accessToken;
        allKeys["refreshToken"] = refreshToken;

        console.log("AccessToken: ", accessToken);
        console.log("RefreshToken: ", refreshToken);

        console.log("All Keys: ", allKeys);

        console.log(await loggedClient.v2.me());

        const {
            client: refreshedClient,
            refreshToken: newRefreshToken,
        } = await twitterClient.refreshOAuth2Token(refreshToken);

        const { data } = await refreshedClient.v2.tweet(
            finalTweet
        );

        //Call a function which reiterates infinitely 
        setInterval(testme(data), 1000);
       
        console.log("Tweet DATA:", data);

        readline.close();
    });

}

function createStatusLink(userName, tweetID) {
    return `https://twitter.com/${userName}/status/${tweetID}`;
}

//setInterval(testme, 6000);
    
async function testme(moreText){
    console.log("TESTING TESTME");
    console.log("moreText:",moreText);
} 

//https://twitter.com/RajGM_Hacks/status/1511364821320892416
//https://twitter.com/user_name/status/tweetID
//  let testID ="1502246747690930178";
//  let testTag = "bitcoin";
//  getTweetAndFilter(testID,testTag);
////working all upto this point
//let tweetID = ['1517849711834984449', '1517582741558411266'];

async function passAccountToCheck(accountID, tag) {
    let tweetArraywithTag = [];
    for (var i = 0; i < 5; i++) {
        let tweetArray = await getTweetAndFilter(accountID, tag);
        console.log("tweetArray: ", tweetArray);

        if (tweetArray != undefined) {
            //do retweet
            console.log("Do a retweet");
        }

    }

}

async function testFetchAndFilter(){
    let testID = "1502246747690930178";
    let testTag = "bitcoin";
    let tweetArray = await getTweetAndFilter(testID, testTag);
    console.log("tweetArray:",tweetArray);
}

//testFetchAndFilter();

//passAccountToCheck("1502246747690930178","bitcoin");

//allCall();

async function readCSVData(){
    await inputStream
        .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', function (row) {
            let dataObj = {
                name: row[0],
                handle: row[1],
                Score: row[2],
                Ticker: row[3]
            }
            CSVdata.push(dataObj);
            //console.log('A row arrived: ', row);
        })
        .on('end', function () {
            console.log("readCSVData:", CSVdata);

            //console.log("wholeData:", wholeData);
            //console.log('No more rows!');
        })
} 