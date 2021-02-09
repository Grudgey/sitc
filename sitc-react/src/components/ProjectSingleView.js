import React from "react";
import Upload from "./Upload.js";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Player from "./Player";

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
    <div>
      <button
        id="back"
        className="btn btn-dark"
        onClick={() => handleClick("back")}
      >
        Back
      </button>
      <div className="row mt-5">
        <div className="d-flex justify-content-center">
          <h2>{song}</h2>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleClick("delete")}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>

        <h3>by {artist}</h3>

        <div className="col text-end pe-5">
          {/* <figure>
            <figcaption><h4>Latest Mix</h4></figcaption>
            <audio src={links[0]}>
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          </figure> */}
          <Player size={80} src={links[0]} />
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
        </div>
        <div className="col mixes text-start ps-5">
          <h4>Mixes</h4>

          {links.map((link, index) => {
            return (
              <div key={index} className="d-flex align-items-baseline">
                <Player size={50} src={link}/>
                <p className="ms-3"><b>Mix {links.length - index}:</b> {comments[index]}</p>
                
                {/* <figure>
                  <figcaption>Mix {links.length - index}</figcaption>
                  <audio controls src={link}>
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                </figure> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
