//importing libraries
const express = require('express');
const router = new express.Router();
var path = require('path');

// @type    GET
//@route    /
// @desc    for sendig token
// @access  PUBLIC
router.get('/*',function(req,res){
    console.log("url:",req.url);
    console.log("params:",req.params);
    res.sendFile(path.join(__dirname+'/app/views/'+'index.html'));
    //res.json(req.url);
})


//export router
module.exports = router;