import React, { useState, useEffect } from "react";
import Upload from "./components/Upload.js";
import Login from "./components/Login";
import axios from "axios";
import ProjectsListView from "./components/ProjectsListView.js";
import ProjectSingleView from "./components/ProjectSingleView.js";
import Loading from "./components/Loading";

function App() {
  axios.defaults.withCredentials = true;

  const [state, setState] = useState({
    artist: "",
    song: "",
    comment: "",
    intervalIsSet: false,
    authenticated: false,
  });

  const { artist, song, comment, intervalIsSet, authenticated } = state;

  const [data, setData] = useState([]);
  const [singleViewModeId, setViewMode] = useState(-1);
  const [loading, setIsLoading] = useState(false);

  function createNewProject(fileName, comment) {
    let currentIds = data.map((data) => data._id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios
      .post("http://localhost:3001/api/putData", {
        fileName: fileName,
        _id: idToBeAdded,
        artist: artist,
        song: song,
        comment: comment,
      })
      .then(() => {
        setState({
          ...state,
          artist: "",
          song: "",
          comment: "",
        });
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }

  function uploadNewMix(fileName, comment, idToUpdate, links) {
    axios
      .post("http://localhost:3001/api/updateData", {
        _id: idToUpdate,
        fileName: fileName,
        links: links,
        comment: comment,
      })
      .then(() => {
        setState({
          ...state,
          artist: "",
          song: "",
          comment: "",
        });
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }

  function logout() {
    axios
      .get("http://localhost:3001/api/logout")
      .then(function (response) {
        console.log("Logged out");
        setState({ ...state, authenticated: false });
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
      .post("http://localhost:3001/api/login", {
        password: password,
        username: username,
      })
      .then(function (response) {
        if (response.status === 200) {
          console.log("Logged in");
          setState({ ...state, authenticated: true });
        }
      })
      .catch(function (error) {
        console.log(error);
        setState({ ...state, authenticated: false });
      });
  }

  function deleteById(id) {
    setViewMode(-1);
    setIsLoading(true);
    //axios.delete does not send data object. This is a known issue, the following is the recommended workaround

    axios
      .request({
        method: "delete",
        url: "http://localhost:3001/api/deleteData",
        data: { id: id },
      })
      .then((response) => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //Set an interval timer to make getData API requests 
  useEffect(() => {
    const interval = setInterval(() => {
      if (intervalIsSet === false) {
        setState({ ...state, intervalIsSet: true });
      }
      axios("http://localhost:3001/api/getData", {})
        .then((response) => {
          if (response.data.success) {
            setData(response.data.data);
            if (!authenticated) {
              setState({ ...state, authenticated: true });
            }
          } else {
            console.log("Error retrieving data");
            setState({ ...state, authenticated: false });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [authenticated, intervalIsSet, state]);

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
                  setState={setState}
                  state={state}
                  artist={artist}
                  song={song}
                  comment={comment}
                  createNewProject={createNewProject}
                  setIsLoading={setIsLoading}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button className="btn logout" onClick={logout} name="logout">
                  Logout
                </button>
              </div>
            </div>
          </div>

          {singleViewModeId === -1 ? (
            <ProjectsListView data={data} setViewMode={setViewMode} />
          ) : (
            <ProjectSingleView
              key={singleViewModeId}
              projectData={data.filter((dat) => {
                return dat._id === singleViewModeId;
              })}
              deleteById={deleteById}
              setViewMode={setViewMode}
              uploadNewMix={uploadNewMix}
              setIsLoading={setIsLoading}
              setState={setState}
              state={state}
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
