import { react, useState } from 'react';
import styles from "./main.module.css";
import '../../style/style.css';

import back from './back.svg';

import Home from '../home/home'
import NewProject from '../newProject/newProject';
import Editor from '../editor/editor'

const Main = () => {
    const [activeTab, setActiveTab] = useState('home');
    return (
        <div className={styles.mainContainer}>
            {activeTab !== 'home' || activeTab === 'editor' && (
                <img className={styles.backButton} onClick={() => setActiveTab("home")} src={back} alt="Back" />
            )}

            {activeTab === 'home' && (
                <Home
                    newProject = {() => setActiveTab("new")}
                />
            )}
            {activeTab === 'new' && (
                <NewProject
                    Done = {() => setActiveTab("editor")}
                />
            )}
            {activeTab === 'editor' && (
                <Editor
                    className={styles.editor}
                    Menu = {() => setActiveTab("home")}
                />
            )}



        </div>
    )
}

export default Main;
