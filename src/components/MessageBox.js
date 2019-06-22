import React from "react";
import styles from "./MessageBox.module.css";

function MessageBox({ message, other }) {
  const partner_style = {
    backgroundColor: "var(--color-lightgrey)"
  };

  const user_style = {
    backgroundColor: "var(--color-blue)",
    marginLeft: "auto",
    color: "#fff"
  };

  return (
    <div className={styles.box} style={other ? partner_style : user_style}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default MessageBox;
