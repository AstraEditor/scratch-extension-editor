import { useEffect, useState } from 'react';
import styles from "./main.module.css";
import '../../style/style.css';

import back from './back.svg';

import Home from '../home/home'
import NewProject from '../newProject/newProject';
import Editor from '../editor/editor'
import FSCEditor from '../FSCEditor/FSCEditor';

const Main = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [projectVersion, setProjectVersion] = useState(0);
    const [fscData, setFscData] = useState({});
    useEffect(() => {
        const handleFSCEvent = (e) => {
            setFscData(e.detail);
            setProjectVersion(v => v + 1);
            setActiveTab("fsc");
        }  

        window.addEventListener("fsc-extension-loaded", handleFSCEvent)
        return () => window.removeEventListener("fsc-extension-loaded", handleFSCEvent)
    }, []);


    return (
        <div className={styles.mainContainer}>
            {(activeTab === 'new') && (
                <img className={styles.backButton} onClick={() => setActiveTab("home")} src={back} alt="Back" />
            )}

            {activeTab === 'home' && (
                <Home
                    newProject={() => setActiveTab("new")}
                    loaded={() => {
                        setProjectVersion(v => v + 1);
                        setActiveTab("editor");
                    }}
                />
            )}
            {activeTab === 'new' && (
                <NewProject
                    Done={() => {
                        setProjectVersion(v => v + 1);
                        setActiveTab("editor");
                    }}
                />
            )}
            {activeTab === 'editor' && (
                <Editor
                    key={projectVersion}
                    className={styles.editor}
                    Menu={() => setActiveTab("home")}
                    loaded={() => {
                        setProjectVersion(v => v + 1);
                        setActiveTab("editor")
                    }}
                />
            )}
            {activeTab === 'fsc' && (
                <FSCEditor
                    fscData={fscData}
                />
            )}


        </div>
    )
}

export default Main;
