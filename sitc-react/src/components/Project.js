import React from "react";

export default function Project(props) {

    const dat = props.dat;

  return (  
    <div className="project" key={dat.id}>

    <p>Artist: {dat.artist}</p>
    <p>Song: {dat.song}</p>
    
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
