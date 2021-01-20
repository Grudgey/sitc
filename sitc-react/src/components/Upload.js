import { Dropbox } from "dropbox";
import React, { useState } from "react";
import { Modal } from "@material-ui/core";

function Upload(props) {
  const [open, setState] = useState(false);

  const toggleOpen = () => {
    setState(!open);
  };

  function dropboxUpload(e) {
    e.preventDefault();

    const dbx = new Dropbox({
      accessToken: process.env.REACT_APP_ACCESS_TOKEN,
    });
    var fileInput = document.getElementById("file-upload");

    var file = fileInput.files[0];

    console.log(file);

    dbx
      .filesUpload({ path: "/" + file.name, contents: file })
      .then(function (response) {
        console.log("Upload success - adding " + file.name + " to DB");
        props.putDataToDB(file.name);
      })
      .catch(function (error) {
        console.error(error);
        console.log("Upload failed");
      });
  }

  //I need to combine these 2 forms. The onsubmit should trigger a function which first uploads the song, once completed it
  //then get's the link for it, then adds the artist / title/ link to the db.
  return (
    <div>
      <div onClick={toggleOpen} className="upload">
        <p>UPLOAD NEW PROJECT</p>
      </div>
      <Modal
        open={open}
        onClose={toggleOpen}
        aria-labelledby="Image pop-up"
        aria-describedby="Image description"
      >
        <div className="upload-position">
        <h1 className="mb-3">Create new project</h1>
          <form className="form-signin" onSubmit={dropboxUpload}>
            <label for="inputArtist" className="visually-hidden">
              Artist
            </label>
            <input
              required
              autofocus
              id="inputArtist"
              className="form-control"
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
              className="form-control"
              type="text"
              onChange={(e) => props.setSong(e.target.value)}
              placeholder="Song Title"
              value={props.song}
            />
            <input className="form-control" type="file" id="file-upload" required/>
            <button className="btn btn-lg btn-light btn-block" type="submit">
              ADD NEW TRACK
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Upload;
