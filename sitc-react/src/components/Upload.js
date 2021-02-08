import { Dropbox } from "dropbox";
import React, { useState } from "react";
import { Modal } from "@material-ui/core";

function Upload(props) {
  const [isClosed, setIsClosed] = useState(false);

  const toggleOpen = () => {
    setIsClosed(!isClosed);
  };

  function dropboxUpload(e) {
    e.preventDefault();
    toggleOpen();
    props.setIsLoading(true);

    const dbx = new Dropbox({
      accessToken: process.env.REACT_APP_ACCESS_TOKEN,
    });
    var fileInput = document.getElementById("file-upload");

    var file = fileInput.files[0];

    let fileName;

    if (!props.links) {
      fileName = props.artist + "-" + props.song + "-" + 0;
    } else {
      fileName = props.artist + "-" + props.song + "-" + props.links.length;
    }

    dbx
      .filesUpload({ path: "/" + fileName, contents: file })
      .then(function (response) {
        if (props.newProject) {
          props.createNewProject(fileName, props.comment);
        } else {
          props.uploadNewMix(fileName, props.comment, props._id, props.links);
        }
      })
      .catch(function (error) {
        console.error(error);
        props.setIsLoading(false);
      });
  }

  return (
    <div>
      {props.newProject ? (
        <button onClick={toggleOpen} className="btn btn-outline-light upload">
          <p>Upload New Project</p>
        </button>
      ) : (
        <button onClick={toggleOpen} className="btn btn-outline-dark upload">
          <p>Upload New Version</p>
        </button>
      )}

      <Modal
        open={isClosed}
        onClose={toggleOpen}
        aria-labelledby="Upload form"
        aria-describedby="Enter song details"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="upload-form">
          <h1 className="mb-3">
            {props.newProject ? "Create New Project" : "Upload New Version"}
          </h1>
          <form className="form-signin" onSubmit={dropboxUpload}>
            {props.newProject && (
              <div>
                <label htmlFor="inputArtist" className="visually-hidden">
                  Artist
                </label>
                <input
                  required
                  autoFocus
                  id="inputArtist"
                  className="form-control top-input"
                  type="text"
                  onChange={(e) =>
                    props.setState({ ...props.state, artist: e.target.value })
                  }
                  placeholder="Artist"
                  value={props.artist}
                />
                <label htmlFor="inputSong" className="visually-hidden">
                  Song
                </label>
                <input
                  required
                  autoFocus
                  id="inputSong"
                  className="form-control bottom-input"
                  type="text"
                  onChange={(e) =>
                    props.setState({ ...props.state, song: e.target.value })
                  }
                  placeholder="Song Title"
                  value={props.song}
                />
              </div>
            )}
            <label htmlFor="file-upload" className="visually-hidden">
              Add File For Upload
            </label>
            <input
              className="form-control top-input"
              type="file"
              id="file-upload"
              required
            />
            <label htmlFor="comment" className="visually-hidden">
              Mix Comment
            </label>
            <input
              className="form-control bottom-input"
              type="text"
              id="comment"
              onChange={(e) =>
                props.setState({ ...props.state, comment: e.target.value })
              }
              placeholder="Mix comment"
              value={props.comment}
            />

            <br />
            <button className="btn btn-lg btn-light btn-block" type="submit">
              UPLOAD
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Upload;
