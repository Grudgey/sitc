import React from "react";
import Upload from "./Upload.js";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

export default function ProjectSingleView(props) {
  const { artist, song, _id, links, comments } = props.projectData[0];

  function handleClick(action) {
    if (action === "delete") {
      props.deleteById(_id);
    } else if (action === "back") {
      props.setViewMode(-1);
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
      <div className="row project-single-view">
        <h2>{song}</h2>
        <h4>by {artist}</h4>
        <br />
        <div className="col">
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
            uploadNewMix={props.uploadNewMix}
            links={links}
            setIsLoading={props.setIsLoading}
            loading={props.loading}
            setState={props.setState}
            state={props.state}
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
              <div key={index} className="d-flex align-items-center">
                <figure>
                  <figcaption>Mix {links.length - index}</figcaption>
                  <audio controls src={link}>
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                </figure>
                <p> Comment: {comments[index]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
