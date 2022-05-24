const jsonfile = require('jsonfile')

function changeMonitoredTag(newTag) {
    let file = './tagFile.json'
    let obj = { "tag": newTag }

    jsonfile.writeFile(file, obj, function (err) {
        if (err) console.error(err)
    })
}

module.exports = function (newTag) {
    changeMonitoredTag(newTag);
};