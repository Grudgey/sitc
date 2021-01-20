//IMPORTS
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var cors = require('cors');
const logger = require('morgan');
const Data = require('./data.js');
const { Dropbox } = require('dropbox');
const fs = require('fs');
var path = require('path');

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

app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));

// app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

// append /api for our http requests

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false, maxAge: 1000*60, httpOnly: false}
}));

app.use(passport.initialize());
app.use(passport.session());

// const router = express.Router();
// app.use('/api', router);

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

// app.use(logger('dev'));

app.get('/api/getData', (req, res) => {

  console.log("Received getData");

  if(req.isAuthenticated()) {
    console.log("Authenticated");
    console.log(req.sessionID);
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  } else {
    console.log("Is not authenticated");
    console.log(req.sessionID);
    res.send("Is not authenticated");
  }

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
app.post('/api/putData', function(req, res) {

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

app.post("/api/register" , (req, res) => {

  console.log("Registration request received.");
  console.log(req.body.username + " - " + req.body.password);

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.json({ success: false, error: err });
      // res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        console.log("Authenticating...");
        return res.json({ success: true });
      });
    }
  });
});

app.post("/api/login", function(req, res){

  console.log("Login request received.");
  console.log(req.body.username + " - " + req.body.password);

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    }
    else {
      passport.authenticate("local")(req, res, function(){
        console.log("Authentication");
        return res.json({ success: true });
      });
    }
  });

});

app.get("/api/logout", (req, res) => {
  console.log("Logging out");
  req.logout();
  req.session.destroy((err) => {
    return res.send({ authenticated: req.isAuthenticated()});
  });
});

// launch our backend into a port
app.listen(process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.API_PORT}`));
