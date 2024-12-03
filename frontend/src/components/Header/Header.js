// import InputBase from "@mui/material/InputBase";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";

import styles from "./Header.module.scss";

const Header = () => {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.mainHead}>Sports Game</h1>
        <div className={styles.search_bar}>
          <SearchIcon className={styles.search_icon} />
          {/* <InputBase
            placeholder="Search Facebook"
            // inputProps={{ "aria-label": "search" }}
            className={styles.input}
          /> */}
          <input
            type="search"
            placeholder="Search Here"
            className={styles.input}
          />
        </div>
      </div>
    </>
  );
};

export default Header;
