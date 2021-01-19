//IMPORTS
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data.js');
const { Dropbox } = require('dropbox');
const fs = require('fs');
var path = require('path');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//DROPBOX

const dbx = new Dropbox({accessToken: process.env.ACCESS_TOKEN});

let link;

function getDropboxSharingLink(fileName, callback) {
  console.log("Getting sharing link for " + fileName);

  dbx.sharingCreateSharedLinkWithSettings({path: '/' + fileName})
          .then(function(response) {

            link = response.result.url.toString();
            console.log("Shared link is " + response.result.url);
            callback();
          })
          .catch(function(error) {
            console.error(error);
          });

        }

//EXPRESS SETUP

const app = express();

app.use(cors());

const router = express.Router();

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

// append /api for our http requests
app.use('/api', router);

app.use(session({
  secret: process.env.SECRETS,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DBROUTE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

let db = mongoose.connection;

db.once('open', function() {
  console.log("Connected to database");
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(logger('dev'));

router.get('/getData', (req, res) => {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

// router.post('/updateData', (req, res) => {
//   const { id, update } = req.body;
//   Data.findByIdAndUpdate(id, update, (err) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true });
//   });
// });
//
// router.delete('/deleteData', (req, res) => {
//   const { id } = req.body;
//   Data.findByIdAndRemove(id, (err) => {
//     if (err) return res.send(err);
//     return res.json({ success: true });
//   });
// });
//
router.post('/putData', function(req, res) {

  let data = new Data();

  const { fileName, id, artist, song } = req.body;

  console.log(req.body);

  if ((!id && id !== 0) || !song || !artist || !fileName) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }

  data.artist = artist;
  data.song = song;
  data.id = id;

  getDropboxSharingLink(fileName, function() {
    //need to format link here
    data.link = 'https://dl.dropboxusercontent.com/' + link.substring(24, link.length-5);
    console.log("Data.link is " + data.link);
    data.save((err) => {
      if (err) {
        return res.json({ success: false, error: err });
      }
      return res.json({ success: true });
    });
  } );
});

router.post("/register" , (req, res) => {

  console.log("Registration request received.");
  console.log(req.body.username + " - " + req.body.password);

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.json({ success: false, error: err });
      // res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        console.log("Authentication");
        return res.json({ success: true });
      });
    }
  });



});

// launch our backend into a port
app.listen(process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.API_PORT}`));
