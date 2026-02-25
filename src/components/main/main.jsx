import { react, useState } from 'react';
import styles from "./main.module.css";
import '../../style/style.css';

import back from './back.svg';

import Home from '../home/home'
import NewProject from '../newProject/newProject';

const Main = () => {
    const [activeTab, setActiveTab] = useState('home');
    return (
        <div className={styles.mainContainer}>
            <div className={styles.tab}>
                <button className={styles.tabButton}>Files</button>
                <button className={styles.tabButton}>Settings</button>
            </div>
            {activeTab !== 'home' && (
                <img className={styles.backButton} onClick={() => setActiveTab("home")} src={back} alt="Back" />
            )}

            {activeTab === 'home' && (
                <Home
                    newProject = {() => setActiveTab("new")}
                />
            )}
            {activeTab === 'new' && (
                <NewProject />
            )}



        </div>
    )
}

export default Main;
