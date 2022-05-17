const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
let wholeData = [];
let inputStream = Fs.createReadStream('./BotDataEarthDay.csv', 'utf8');


const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        { id: 'name', title: 'NAME' },
        { id: 'handle', title: 'AccountHandle' },
        { id: 'Score', title: 'Score' },
        { id: 'Ticker', title: 'Ticker' }
    ]
});

async function testMe() {
    await inputStream
        .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', function (row) {
            let dataObj = {
                name: row[0],
                handle: row[1],
                Score: row[2],
                Ticker: row[3]
            }
            wholeData.push(dataObj);
            //console.log('A row arrived: ', row);
        })
        .on('end', function () {
            //console.log("wholeData:", wholeData);

            csvWriter.writeRecords(wholeData)       // returns a promise
                .then(() => {
                    console.log('...Done');
                });

            //console.log('No more rows!');
        })

}

testMe();