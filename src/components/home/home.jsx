import styles from "./home.module.css";


const Home = props => {
    return (
        <div>
            <div className={styles.mainPanel}>
                <h1>Welcome to Scratch Extension Editor</h1>
                <p>What would you like to do?</p>
                <button className={styles.actionButton} onClick={props.newProject}>Create New Extension</button>
            </div>
        </div>
    )
}

export default Home