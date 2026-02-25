import { react, useState } from 'react';
import StroagePanel from '../storagePanel/storagePanel';
import styles from "./main.module.css"; //为什么这里要加module才行，好奇怪的语法
import '../../style/style.css';

const Main = () => {
    const [activeTab, setActiveTab] = useState('home');
    return (
        <div className={styles.mainContainer}>
            <div className={styles.tab}>
                <button className={styles.tabButton}>Files</button>
                <button className={styles.tabButton}>Settings</button>
            </div>
            {activeTab === 'home' && (
                <div>
                    <div className={styles.mainPanel}>
                        <h1>Welcome to Scratch Extension Editor</h1>
                        <p>What would you like to do?</p>
                        <button className={styles.actionButton}>Create New Extension</button>
                        <button className={styles.actionButton} onClick={() => setActiveTab("manage")}>Manage Extensions</button>
                    </div>
                </div>
            )}

            {activeTab !== 'home' && (
                <button className={styles.backButton} onClick={() => setActiveTab("home")}>Back to Home</button>
            )}
            {activeTab === 'manage' && (
                < StroagePanel />
            )}

        </div>
    )
}

export default Main;
