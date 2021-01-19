import { Dropbox } from 'dropbox';
import React from 'react';

function Upload(props) {

    function dropboxUpload(e) {    
      e.preventDefault();

      const dbx = new Dropbox({ accessToken: process.env.REACT_APP_ACCESS_TOKEN });
      var fileInput = document.getElementById('file-upload');
      
      var file = fileInput.files[0];

      console.log(file);

        dbx.filesUpload({path: '/' + file.name, contents: file})
          .then(function(response) {
            console.log("Upload success - adding " + file.name + " to DB");
            props.putDataToDB(file.name);
          })
          .catch(function(error) {
            console.error(error);
            console.log("Upload failed");
          });
      }

      //I need to combine these 2 forms. The onsubmit should trigger a function which first uploads the song, once completed it 
      //then get's the link for it, then adds the artist / title/ link to the db.
    return (
      <div className="App">
        <form onSubmit={dropboxUpload}>

        <input
          type="text"
          onChange={(e) => props.setArtist(e.target.value)}
          placeholder="Artist"
          value={props.artist}
          style={{ width: "200px" }}
        />

      <input
          type="text"
          onChange={(e) => props.setSong(e.target.value)}
          placeholder="Song Title"
          value={props.song}
          style={{ width: "200px" }}
        />
          <input type="file" id="file-upload" />
          <button type="submit" >ADD NEW TRACK</button>
        </form>

      </div>
    );
  }

export default Upload;


