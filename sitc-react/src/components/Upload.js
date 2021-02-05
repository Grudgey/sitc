import { Dropbox } from "dropbox";
import React, { useState } from "react";
import { Modal } from "@material-ui/core";

function Upload(props) {
  const [isClosed, setIsClosed] = useState(false);

  const toggleOpen = () => {
    console.log("Toggle open called");
    setIsClosed(!isClosed);
  };

  function dropboxUpload(e) {
    e.preventDefault();
    toggleOpen();
    
    props.toggleLoading(true);

    const dbx = new Dropbox({
      accessToken: process.env.REACT_APP_ACCESS_TOKEN,
    });
    var fileInput = document.getElementById("file-upload");

    var file = fileInput.files[0];

    let fileName;

    if(!props.links) {
      fileName = props.artist + "-" + props.song + "-" + 0;
    } else {
      fileName = props.artist + "-" + props.song + "-" + props.links.length;
    }

    if (props.newProject) {
      props.putDataToDB(fileName, props.comment);
    } else {
      props.putDataToDB(fileName, props._id, props.links, props.comment);
    }

    dbx
      .filesUpload({ path: "/" + fileName, contents: file })
      .then(function (response) {
        console.log(
          "Upload success - adding " +
            fileName +
            " with ID " +
            file.id +
            " to DB"
        );

        if (props.newProject) {
          props.putDataToDB(fileName, props.comment);
        } else {
          props.putDataToDB(fileName, props.comment, props._id, props.links);
        }
      })
      .catch(function (error) {
        console.error(error);
        console.log("Upload failed");
        props.toggleLoading(false);
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
                  <label for="inputArtist" className="visually-hidden">
                    Artist
                  </label>
                  <input
                    required
                    autofocus
                    id="inputArtist"
                    className="form-control top-input"
                    type="text"
                    onChange={(e) => props.setArtist(e.target.value)}
                    placeholder="Artist"
                    value={props.artist}
                  />
                  <label for="inputSong" className="visually-hidden">
                    Song
                  </label>
                  <input
                    required
                    autofocus
                    id="inputSong"
                    className="form-control bottom-input"
                    type="text"
                    onChange={(e) => props.setSong(e.target.value)}
                    placeholder="Song Title"
                    value={props.song}
                  />
              </div>
            )}
            <label for="file-upload" className="visually-hidden">
              Add File For Upload
            </label>
            <input
              className="form-control top-input"
              type="file"
              id="file-upload"
              required
            />
            <label for="comment" className="visually-hidden">
               Mix Comment
            </label>
            <input
              className="form-control bottom-input"
              type="text"
              id="comment"
              onChange={(e) => props.setComment(e.target.value)}
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
