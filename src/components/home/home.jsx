import styles from "./home.module.css";
import { setLanguage, SUPPORTED_LANGUAGES, useTranslation } from "../../i18n";
import { loadProject } from "../editor/blockUtils";

const Home = props => {
    const { t, language } = useTranslation();

    return (
        <div>
            <div className={styles.mainPanel}>
                <h1>{t('Welcome to Astras Blocktory')}</h1>
                <p>{t('What would you like to do?')}</p>
                <button className={styles.actionButton} onClick={props.newProject}>{t('Create New Extension')}</button>
                <button className={styles.actionButton} onClick={() => document.getElementById('file-input').click()}>{t('Load Extension (.ab)')}</button>
                <input id="file-input" type="file" accept=".ab,.json" style={{ display: 'none' }} onChange={(e) => loadProject(e,() => {props.loaded()})} />
                <div className={styles.footer}>
                    <select onChange={e => {
                        setLanguage(e.target.value);
                    }} value={language}>
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default Home