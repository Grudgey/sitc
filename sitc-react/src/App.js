import React, { useState, useEffect } from "react";
import Upload from "./components/Upload.js";
import Login from "./components/Login";
import axios from "axios";
import ProjectsList from "./components/ProjectsList.js";

function App() {
  axios.defaults.withCredentials = true;
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
    axios("http://localhost:3001/api/getData", { withCredentials: true })
      // .then(function (response) {
      //     console.log(response.data);
      // });
      .then((response) => {
        if (response.data === "Is not authenticated") {
          console.log(response.data.data);
        } else {
          setData(response.data.data);
        }
      });
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

  function logout() {
    axios
      .get("http://localhost:3001/api/logout", { withCredentials: true })
      .then(function (response) {
        console.log("Logged out");
        console.log(response);
        setAuthentication(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function authenticate(credentials, loginType) {
    const { username, password } = credentials;

    // const postRoute = (loginType === "register") ?
    // "http://localhost:3001/api/register" : "http://localhost:3001/api/login";

    axios
      .post(
        "http://localhost:3001/api/login",
        {
          password: password,
          username: username,
        },
        { withCredentials: true }
      )
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
          <button className="logout" onClick={logout} name="logout">
            Logout
          </button>

          <ProjectsList data={data}/>

          <Upload
            setArtist={setArtist}
            artist={artist}
            setSong={setSong}
            song={song}
            putDataToDB={putDataToDB}
          />
        </div>
      ) : (
        <Login authenticate={authenticate} />
      )}
    </div>
  );
}

export default App;
