import React from "react";

export default function Project(props) {

    const dat = props.dat;

  return (  
    <div key={dat.song}>
    <li style={{ padding: "10px" }}>
      <span style={{ color: "gray" }}> Artist: </span> {dat.artist}
    </li>
    <li style={{ padding: "10px" }}>
      <span style={{ color: "gray" }}> Song: </span> {dat.song}
    </li>
    <figure>
      <figcaption></figcaption>
      <audio controls src={dat.link}>
        Your browser does not support the
        <code>audio</code> element.
      </audio>
    </figure>
  </div>
  );
}
