import React from "react";
import Project from "./Project"

export default function ProjectsList(props) {

    const data = props.data;

    return (
        <div>
        <ul>
        {data.length <= 0
          ? "loading data..."
          : data.map(dat => (
              //all of this should be put in a 'artist - song' component
              <Project dat={dat} />
            ))}
        </ul>
        </div>
    );
}