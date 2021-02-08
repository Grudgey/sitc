import React from "react";
import { Modal, CircularProgress } from "@material-ui/core";

export default function Loading(props) {
  return (
    <Modal
      open={props.loading}
      aria-labelledby="Image pop-up"
      aria-describedby="Image description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Modal>
  );
}
