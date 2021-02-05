import React from "react";
import Upload from "./Upload.js";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

export default function ProjectSingleView(props) {
  const { artist, song, _id, links, comments } = props.projectData;

  function handleClick(action) {
    console.log(action);
    if (action === "delete") {
      props.deleteById(_id);
    } else if (action === "back") {
      props.toggleSingleViewId(-1);
    }
  }

  return (
    <div className="project-single-container">
      <button
        id="back"
        className="btn btn-dark"
        onClick={() => handleClick("back")}
      >
        Back
      </button>
      <br />
      <div className="row project-single-view">
        <h2>{song}</h2>
        <div className="col song-info">
          <p>
            Artist: {artist}
            <br />
          </p>
          <figure>
            <figcaption>Latest Mix:</figcaption>
            <audio controls src={links[0]}>
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          </figure>
          <Upload
            newProject={false}
            _id={_id}
            artist={artist}
            song={song}
            putDataToDB={props.putDataToDB}
            links={links}
            toggleLoading={props.toggleLoading}
            loading={props.loading}
            setComment={props.setComment}
            comment={props.comment}
          />
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleClick("delete")}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="col mixes">
          <h4>Mixes</h4>

          {links.map((link, index) => {
            return (
              <div className="d-flex align-items-center">
                <figure>
                  <figcaption>Mix {links.length - index}</figcaption>
                  <audio controls src={link}>
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                </figure>
                <p>Comment: {comments[index]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
