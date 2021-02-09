import React from "react";
import Player from "./Player";

export default function ProjectsList(props) {
  const data = props.data;

  return (
    <div className="row justify-content-center">
      {data.length <= 0
        ? ""
        : data.map((dat) => (
            <div
              key={dat._id}
              className="project col"
              onClick={() => props.setViewMode(dat._id)}
            >
              <h2>{dat.song}</h2>
              <h4>by {dat.artist}</h4>
              <Player size={80} src={dat.links[0]} />
              {/* <figure>
                <audio controls src={dat.links[0]}>
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
                <figcaption>
                  <em>comment: {dat.comments[0]}</em>
                </figcaption>
              </figure> */}
              <br/>
              <p><em>comment: {dat.comments[0]}</em></p>
            </div>
          ))}
    </div>
  );
}
