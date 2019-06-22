import React from 'react'
import styles from './Loader.module.css'

function Loader() {
    return (
        <div className={[styles.loadingBar]}>
            <div className={styles.blackBar}></div>
        </div>
    )
}

export default Loader