//IMPORTS
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
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

  dbx.sharingCreateSharedLinkWithSettings({
      path: "/" + fileName
    })
    .then(function(response) {

      link = response.result.url.toString();
      callback();
    })
    .catch(function(error) {
      console.error(error);
    });
}

function deleteSongFromDropbox(links, callback) {

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

app.use(express.static(path.join(__dirname,"..",'sitc-react/build')));
app.use(express.static("public"));

app.use(cors({
  credentials: true,
}));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60,
    httpOnly: false
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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

app.use(logger('dev'));

app.get('/api/getData', (req, res) => {
  if (req.isAuthenticated()) {
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
    return res.json({
      success: false,
    });
  }

});

app.post('/api/updateData', (req, res) => {
  if (req.isAuthenticated()) {

    const {
      _id,
      fileName,
      links,
      comment
    } = req.body;

    //so we have the id, get a shared link from the update
    //then add prepend this link to the array of the song with that ID

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
          return res.json({
            success: true,
          });
        }
      });
    });

  } else {
    return res.json({
      success: false,
    });
  }

});


app.delete('/api/deleteData', (req, res) => {

  if (req.isAuthenticated()) {

    const {
      id
    } = req.body;

    Data.findById(id, (err, song) => {
      if (err) {
        console.log(err);
        return res.json({
          success: false
        });
      } else {
        deleteSongFromDropbox(song.links, () => {
          Data.findByIdAndRemove(id, (err) => {
            if (err) return res.send(err);
            return res.json({
              success: true
            });
          });
        });
      }
    });

  } else {
    return res.json({
      success: false
    });
  }

});

app.post('/api/putData', function(req, res) {

  if(req.isAuthenticated()) {

    let data = new Data();

    const {
      fileName,
      _id,
      artist,
      song,
      comment
    } = req.body;

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

  } else {
    return res.json({
      success: false
    });
  }

});

app.post("/api/register", (req, res) => {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        error: err
      });
    } else {
      passport.authenticate("local")(req, res, () => {
        return res.json({
          success: true
        });
      });
    }
  });
});

app.post("/api/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
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

const port = process.env.PORT || 3003;

// launch our backend into a port
app.listen(port, () => console.log(`LISTENING ON PORT ${port}`));
