import React, { useState, useEffect } from "react";
import Upload from "./components/Upload.js";
import Login from "./components/Login";
import { Modal } from "@material-ui/core";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  // initialize our state
  // const [state, setState] = useState ({
  //   data: [],
  //   id: 0,
  //   artist: null,
  //   song: null,
  //   intervalIsSet: false,
  //   idToDelete: null,
  //   idToUpdate: null,
  //   objectToUpdate: null,
  // });

  const [data, setData] = useState([]);
  const [id, setId] = useState(0);
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [intervalIsSet, setIntervalIsSet] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [idToUpdate, setIdToUpdate] = useState(null);
  const [objectToUpdate, setObjectToUpdate] = useState(null);

  const [authenticated, setAuthentication] = useState(false);

  const [open, setState] = useState(false);

  const toggleOpen = () => {
    setState(!open);
  };

  //setState(prevValue) {} spread operator

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  // our first get method that uses our backend api to
  // fetch data from our data base
  function getDataFromDb() {
    if (intervalIsSet === false) {
      setIntervalIsSet(true);
    }
    fetch("http://localhost:3001/api/getData")
      .then((data) => data.json())
      .then((res) => setData(res.data));
  }

  // our put method that uses our backend api
  // to create new query into our data base
  function putDataToDB(fileName) {
    console.log("About to post to backend " + fileName);
    let currentIds = data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post("http://localhost:3001/api/putData", {
      fileName: fileName,
      id: idToBeAdded,
      artist: artist,
      song: song,
    });
  }

  function authenticate(credentials) {
    const { username, password } = credentials;

    axios
      .post("http://localhost:3001/api/register", {
        password: password,
        username: username,
      })
      .then(function (response) {
        if (response.status === 200) {
          console.log("Logged in");
          setAuthentication(true);
        }
      })
      .catch(function (error) {
        console.log(error);
        setAuthentication(false);
      });
  }

  // our delete method that uses our backend api
  // to remove existing database information
  // function deleteFromDB(idTodelete) {
  //   parseInt(idTodelete);
  //   let objIdToDelete = null;
  //   data.forEach((dat) => {
  //     if (dat.id == idTodelete) {
  //       objIdToDelete = dat._id;
  //     }
  //   });

  //   axios.delete('http://localhost:3001/api/deleteData', {
  //     data: {
  //       id: objIdToDelete,
  //     },
  //   });
  // };

  // our update method that uses our backend api
  // to overwrite existing data base information
  // function updateDB(idToUpdate, updateToApply) {
  //   let objIdToUpdate = null;
  //   parseInt(idToUpdate);
  // data.forEach((dat) => {
  //     if (dat.id == idToUpdate) {
  //       objIdToUpdate = dat._id;
  //     }
  //   });

  //   axios.post('http://localhost:3001/api/updateData', {
  //     id: objIdToUpdate,
  //     update: { song: updateToApply },
  //     update: { artist: updateToApply }
  //   });
  // };

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen

  useEffect(() => {
    const interval = setInterval(() => {
      getDataFromDb();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {authenticated ? (
        <div>
          <ul>
            {data.length <= 0
              ? "NO DB ENTRIES YET"
              : data.map((dat) => (
                  //all of this should be put in a 'artist - song' component
                  <div key={dat.song}>
                    <li style={{ padding: "10px" }}>
                      <span style={{ color: "gray" }}> Artist: </span>{" "}
                      {dat.artist}
                    </li>
                    <li style={{ padding: "10px" }}>
                      <span style={{ color: "gray" }}> Song: </span> {dat.song}
                    </li>
                    <figure>
                      <figcaption></figcaption>
                      <audio controls src={dat.link}>
                        Your browser does not support the
                        <code>audio</code> element.
                      </audio>
                    </figure>
                  </div>
                ))}
          </ul>

          <div
            onClick={toggleOpen}
            style={{ backgroundColor: "black", width: "30px", height: "30px" }}
            className="slide"
          />

          <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="Image pop-up"
            aria-describedby="Image description"
          >
            <Upload
              setArtist={setArtist}
              artist={artist}
              setSong={setSong}
              song={song}
              putDataToDB={putDataToDB}
            />
          </Modal>
        </div>
      ) : (
        <Login authenticate={authenticate} />
      )}
    </div>
  );
}

export default App;
