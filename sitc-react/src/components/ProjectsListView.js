import React from "react";

export default function ProjectsList(props) {
  const data = props.data;

  return (
    <div>
      {data.length <= 0
        ? ""
        : data.map((dat) => (
            <div
              key={dat._id}
              className="project"
              onClick={() => props.setViewMode(dat._id)}
            >
              <h2>{dat.song}</h2>
              <h4>by {dat.artist}</h4>
              <figure>
                <audio controls src={dat.links[0]}>
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
                <figcaption>
                  <em>comment: {dat.comments[0]}</em>
                </figcaption>
              </figure>
            </div>
          ))}
    </div>
  );
}
