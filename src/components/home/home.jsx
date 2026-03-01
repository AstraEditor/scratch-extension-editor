import styles from "./home.module.css";
import { setAllValue } from '../../extension/storage.js';

const Home = props => {
    const loadProject = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setAllValue(data);
                props.Loaded();
            } catch (err) {
                alert('Failed to load project: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <div className={styles.mainPanel}>
                <h1>Welcome to Astras Blocktory</h1>
                <p>What would you like to do?</p>
                <button className={styles.actionButton} onClick={props.newProject}>Create New Extension</button>
                <button className={styles.actionButton} onClick={() => document.getElementById('file-input').click()}>Load Extension (.ab)</button>
                <input id="file-input" type="file" accept=".ab,.json" style={{ display: 'none' }} onChange={loadProject} />
            </div>
        </div>
    )
}

export default Home