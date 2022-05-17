// Get User objects by username, using bearer token authentication
// https://developer.twitter.com/en/docs/twitter-api/users/lookup/quick-start

const needle = require('needle');
require('dotenv').config()

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
//const token = process.env.BEARER_TOKEN;
const token = process.env.BearerToken;

const endpointURL = "https://api.twitter.com/2/users/by?usernames="

async function getRequest(username) {

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
        usernames: username // Edit usernames to look up
        // Edit optional query parameters here
    }

    // this is the HTTP header that adds bearer token authentication
    const res = await needle('get', endpointURL, params, {
        headers: {
            "User-Agent": "v2UserLookupJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request')
    }
}

async function getUserID(username){
    try {
        // Make request
        const response = await getRequest(username);
        // console.dir(response, {
        //     depth: null
        // });
        if(response.errors || response.data == undefined){
            return "notFound";
        }else{
            return response.data[0].id;
        }
        
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
}

exports.getUserID = getUserID;