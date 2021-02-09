import React, {useRef, useState} from "react";
import { PlayCircleFilled, PauseCircleFilled } from "@material-ui/icons";

export default function Player(props) {

  const [playing, setPlaying] = useState(false);


  const {src, size } = props;

  const track = useRef();

    let audio = new Audio(src);

    function handleClick(e) {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
      console.log("Play button pressed");
      if(playing) {
        setPlaying(false);
        track.current.pause();
        console.log("Pausing audio");
      } else {
        setPlaying(true);
        track.current.play();
        console.log("Playing audio");
      }
    }

  return (
    <div className="player"> 
        <audio ref={track} src={src}/>
        {!playing ? 
        <PlayCircleFilled onClick={handleClick} style={{fontSize: size}}/> :
        <PauseCircleFilled onClick={handleClick} style={{fontSize: size}}/>}
    </div>
  );
}
