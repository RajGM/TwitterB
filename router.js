//importing libraries
const express = require('express');
const router = new express.Router();
var path = require('path');
router.use(express.static("./public"));


const fileupload = require("express-fileupload");
router.use(fileupload());

const multer = require('multer');
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, './files/');
     },

     // By default, multer removes file extensions so let's add them back
     filename: function (req, file, cb) {
          cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
          console.log("File name:", file.fieldname);
     }
});

const helperFunction = require('./indexHelper.js');

// @type    GET
//@route    /
// @desc    for sending login page
// @access  PUBLIC
router.get('/', function (req, res) {
     res.sendFile(path.join(__dirname + '/app/views/' + 'index.html'));
})

// @type    POST
//@route    /
// @desc    for changing hashtag to monitor
// @access  PUBLIC
router.post('/', function (req, res) {
     helperFunction(req.body.tag);
     res.json({ "Success": "OK" });
})

// @type    POST
//@route    /
// @desc    for uploading commentFile
// @access  PUBLIC
router.post('/commentFile', function (req, res) {

     console.log("INside Comment File Upload");

     let upload = multer({ storage: storage }).single('commentTestFile');
     console.log(req.files.commentFile);

     upload(req, res, function (err) {
          // req.file contains information of uploaded file
          // req.body contains information of text fields, if there were any

          if (req.fileValidationError) {
               return res.send(req.fileValidationError);
          }
          else if (!req.files) {
               return res.send('Please select an report file to upload');
          }
          else if (err instanceof multer.MulterError) {
               return res.send(err);
          }
          else if (err) {
               return res.send(err);
          } else {
               res.status("200").json({
                    message: "Successfully uploaded...",
                    filename: `${req.files.commentFile.name}`
               });
          }

         // res.json({ "Success": "OK" });
     })

     console.log("Upload Complete");

})

//export router
module.exports = router;