import styles from "./home.module.css";
import { setAllValue } from '../../extension/storage.js';
import { setLanguage, SUPPORTED_LANGUAGES, useTranslation } from "../../i18n";

const Home = props => {
    const { t, language } = useTranslation();

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
                alert(t('home.loadFailed') + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <div className={styles.mainPanel}>
                <select onChange={e => {
                    setLanguage(e.target.value);
                }} value={language}>
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <h1>{t('home.title')}</h1>
                <p>{t('home.whatToDo')}</p>
                <button className={styles.actionButton} onClick={props.newProject}>{t('home.newExtension')}</button>
                <button className={styles.actionButton} onClick={() => document.getElementById('file-input').click()}>{t('home.loadExtension')}</button>
                <input id="file-input" type="file" accept=".ab,.json" style={{ display: 'none' }} onChange={loadProject} />
            </div>
        </div>
    )
}

export default Home