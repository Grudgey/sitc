import React from "react";
import Project from "./Project"

export default function ProjectsList(props) {

    const data = props.data;

    return (
        <div>
        <ul>
        {data.length <= 0
          ? ""
          : data.map(dat => (
              <Project dat={dat} key={dat._id} toggleSingleViewId={props.toggleSingleViewId}/>
            ))}
        </ul>
        </div>
    );
}