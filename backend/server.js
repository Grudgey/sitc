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
const {
  Dropbox
} = require('dropbox');
const fs = require('fs');
var path = require('path');

//DROPBOX

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN
});

let link;

function getDropboxSharingLink(fileName, callback) {
  console.log("Getting sharing link for " + fileName);

  dbx.sharingCreateSharedLinkWithSettings({
      path: "/" + fileName
    })
    .then(function(response) {

      link = response.result.url.toString();
      console.log("Shared link is " + response.result.url);
      callback();
    })
    .catch(function(error) {
      console.error(error);
    });
}

function deleteSongFromDropbox(links, callback) {
  console.log("Deleting files " + links);

  let linksToBeDeleted = links;
  let entries = [];

  for (let i = 0; i < linksToBeDeleted.length; i++) {
    linksToBeDeleted[i] = "/" + linksToBeDeleted[i].substring(52, linksToBeDeleted[i].length);

    while (linksToBeDeleted[i].includes("%20")) {
      linksToBeDeleted[i] = linksToBeDeleted[i].replace("%20", " ");
    }
    entries.push({
      path: linksToBeDeleted[i]
    })
  }

  dbx.filesDeleteBatch({
      entries: entries
    })
    .then(response => {
      callback();
    })
    .catch(error => {
      console.log(error);
    });
}

//EXPRESS SETUP

const app = express();

app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));

// app.use(cors());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

// append /api for our http requests

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: false
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// const router = express.Router();
// app.use('/api', router);

mongoose.connect(process.env.DBROUTE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
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


  if (req.isAuthenticated()) {
    // console.log("Authenticated");
    // console.log(req.sessionID);
    Data.find((err, data) => {
      if (err) return res.json({
        success: false,
        error: err
      });
      return res.json({
        success: true,
        data: data
      });
    });
  } else {
    // console.log("Is not authenticated");
    // console.log(req.sessionID);
    res.send("Is not authenticated");
  }

});

app.post('/api/updateData', (req, res) => {
  const {
    _id,
    fileName,
    links,
    comment
  } = req.body;

  //so we have the id, get a shared link from the update
  //then add prepend this link to the array of the song with that ID

  console.log("Server received update request with ID: " + _id + " and fileName: " + fileName + " with links " + links + " comment " + comment);

  getDropboxSharingLink(fileName, function() {
    //need to format link here
    const newLink = ('https://dl.dropboxusercontent.com/' + link.substring(24, link.length - 5));

    Data.update({
      _id: _id
    }, {
      $push: {
        links: {
          $each: [newLink],
          $position: 0
        },
        comments: {
          $each: [comment],
          $position: 0
        }
      }
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Found object in DB with links and has been updated");
      }
    });
  });
});


app.delete('/api/deleteData', (req, res) => {
  const {
    id
  } = req.body;
  console.log("Received request to delete id " + id);

  Data.findById(id, (err, song) => {
    if (err) {
      console.log(err)
    } else {
      deleteSongFromDropbox(song.links, () => {
        console.log("Removed from Dropbox, now removing from DB");
        Data.findByIdAndRemove(id, (err) => {
          if (err) return res.send(err);
          return res.json({
            success: true
          });
        });
      });
    }
  });
});

app.post('/api/putData', function(req, res) {

  let data = new Data();

  const {
    fileName,
    _id,
    artist,
    song,
    comment
  } = req.body;

  console.log("Saving to database ID: " + _id + " fileName: " + fileName + " artist: " + artist + " song: " + song + " comment: " + comment);

  if ((!_id && _id !== 0) || !song || !artist || !fileName) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }

  data.artist = artist;
  data.song = song;
  data._id = _id;
  data.comments.push(comment);

  getDropboxSharingLink(fileName, function() {
    //need to format link here
    data.links.push('https://dl.dropboxusercontent.com/' + link.substring(24, link.length - 5));
    console.log("Data.link is " + data.links);
    data.save((err) => {
      if (err) {
        return res.json({
          success: false,
          error: err
        });
      }
      return res.json({
        success: true
      });
    });
  });
});

app.post("/api/register", (req, res) => {

  console.log("Registration request received.");
  console.log(req.body.username + " - " + req.body.password);

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        error: err
      });
      // res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        console.log("Authenticating...");
        return res.json({
          success: true
        });
      });
    }
  });
});

app.post("/api/login", function(req, res) {

  console.log("Login request received.");
  console.log(req.body.username + " - " + req.body.password);

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        console.log("Authentication");
        return res.json({
          success: true
        });
      });
    }
  });

});

app.get("/api/logout", (req, res) => {
  console.log("Logging out");
  req.logout();
  req.session.destroy((err) => {
    return res.send({
      authenticated: req.isAuthenticated()
    });
  });
});

// launch our backend into a port
app.listen(process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.API_PORT}`));
