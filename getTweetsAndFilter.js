const needle = require('needle');
require('dotenv').config()

//const url = `https://api.twitter.com/2/users/${userId}/tweets`;
let url = "";

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = process.env.BearerToken;

let fetchTweets = async (userId) => {
    url = `https://api.twitter.com/2/users/${userId}/tweets`;

    let userTweets = [];

    // we request the author_id expansion so that we can print out the user name later
    let params = {
        "max_results": 5,
        "tweet.fields": "created_at",
        "expansions": "author_id",
    }

    const options = {
        headers: {
            "User-Agent": "v2UserTweetsJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    let userName;
    console.log("Retrieving Tweets...");

    try {
        const resp = await needle('get', url, params, options);
        console.log("resp.statusCode: " + resp.statusCode);
        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        } else {
            return resp.body.data;
        }
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }

}

function filterTweets(tweetsArray, hashtag) {
    let tweetIDArray = [];
    let tag = "#" + hashtag;
    
    if (tweetsArray != undefined) {

        for (let i = 0; i < tweetsArray.length; i++) {
            if (tweetsArray[i].text.toLowerCase().includes(tag)) {
                tweetIDArray.push(tweetsArray[i].id);
            }
        }

    }

    return tweetIDArray;
}

async function fetchTweetAndFilter(userID, filterTag) {
    let tweets = await fetchTweets(userID);
    let tweetIDArray = await filterTweets(tweets, filterTag);

    return tweetIDArray;
}

module.exports = fetchTweetAndFilter;