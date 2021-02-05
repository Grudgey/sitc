import React from "react";

export default function Project(props) {
  const {artist, song, links, comments, _id} = props.dat;

  function handleClick() {
    props.toggleSingleViewId(_id);
  }

  return (
    <div className="project" onClick={handleClick}>
      <p>Artist: {artist}</p>
      <p>Song: {song}</p>

      <figure>
        <figcaption>Latest Mix:</figcaption>
        <audio controls src={links[0]}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </figure>
      <p><em>Comment: {comments}</em></p>
    </div>
  );
}
