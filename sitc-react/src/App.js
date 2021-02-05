import React, { useState, useEffect } from "react";
import Upload from "./components/Upload.js";
import Login from "./components/Login";
import axios from "axios";
import ProjectsListView from "./components/ProjectsListView.js";
import ProjectSingleView from "./components/ProjectSingleView.js";
import Loading from "./components/Loading";

//TODO
//Sort out authentication issues 

function App() {
  axios.defaults.withCredentials = true;

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
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [comment, setComment] = useState("");
  const [intervalIsSet, setIntervalIsSet] = useState(false);

  const [authenticated, setAuthentication] = useState(false);
  const [singleViewId, setsingleViewId] = useState(-1);
  const [loading, setIsLoading] = useState(false);


  const toggleSingleViewId = function(_id) {
    console.log(_id);
    setsingleViewId(_id);
  };

  const toggleLoading = (isLoading) => {
    console.log("Toggle loading called");
    setIsLoading(isLoading);    
  };

  function putDataToDB(fileName, comment, idToUpdate, links) {
    let currentIds = data.map((data) => data._id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    if(!links) {
      
      axios.post("http://localhost:3001/api/putData", {
        fileName: fileName,
        _id: idToBeAdded,
        artist: artist,
        song: song,
        comment: comment
      }).then(toggleLoading(false));
    } else {
      console.log("Adding new version to DB " + fileName);
      axios.post('http://localhost:3001/api/updateData', {
        _id: idToUpdate,
        fileName: fileName,
        links: links,
        comment: comment
      }).then(toggleLoading(false));
    }
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

  function deleteById(id) {
    console.log("Making delete call to server with to delete project with ID " + id);
    toggleSingleViewId(-1);
    toggleLoading(true);
    //axios.delete does not send data object. This is a known issue, the following is the recommended workaround 

    axios.request({method: 'delete', url: 'http://localhost:3001/api/deleteData', data: {id: id}})
    .then(response => {
      console.log(response);
      toggleLoading(false);
    })
    .catch(err => {
      console.log(err);
    });
  };

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen

  useEffect(() => {
    const interval = setInterval(() => {
      if (intervalIsSet === false) {
        setIntervalIsSet(true);
      }
      axios("http://localhost:3001/api/getData", {
        withCredentials: true,
      }).then((response) => {
        if (response.data === "Is not authenticated") {
          console.log(response.data.data);
        } else {
          if(!authenticated) {
            setAuthentication(true);
          }
          console.log("Grabbing data ");
          setData(response.data.data);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [authenticated, intervalIsSet]);

  return (
    <div>
      {authenticated ? (
        <div>
          <div className="navbar fixed-top">
            <div className="container-fluid">
              <div className="d-flex align-items-center">
                <img
                  className="me-3"
                  src="./images/sitc-logo.png"
                  alt=""
                  width="10%"
                />
                <Upload
                  newProject={true}
                  setArtist={setArtist}
                  artist={artist}
                  setSong={setSong}
                  song={song}
                  setComment={setComment}
                  comment={comment}
                  putDataToDB={putDataToDB}
                  toggleLoading={toggleLoading}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button className="btn logout" onClick={logout} name="logout">
                  Logout
                </button>
              </div>
            </div>
          </div>

          {singleViewId === -1 ? (
            <ProjectsListView
              data={data}
              toggleSingleViewId={toggleSingleViewId}
            />
          ) : (
            <ProjectSingleView
              key={singleViewId}
              projectData={data[singleViewId]}
              deleteById={deleteById}
              toggleSingleViewId={toggleSingleViewId}
              putDataToDB={putDataToDB}
              toggleLoading={toggleLoading}
              setComment={setComment}
              comment={comment}
            />
          )}
          <Loading loading={loading} />
        </div>
        
      ) : (
        <Login authenticate={authenticate} />
      )}
    </div>
  );
}

export default App;