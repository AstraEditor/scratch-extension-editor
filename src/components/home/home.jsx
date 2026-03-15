import styles from "./home.module.css";
import { setLanguage, SUPPORTED_LANGUAGES, useTranslation } from "../../i18n";
import { loadProject } from "../editor/blockUtils";
import decompile from "../../extension/decompile";

import logo from './logo.svg';

const Home = props => {
    const { t, language } = useTranslation();

    return (
        <div>
            <div className={styles.mainPanel}>
                <div className={styles.logo}>
                    <img src={logo} className={styles.logoPic} alt="logo" /><span className={styles.title}>Astra Blocktory</span>
                </div>
                    <p>{t('What would you like to do?')}</p>
                    <button className={styles.actionButton} onClick={props.newProject}>{t('Create New Extension')}</button>
                    <button className={styles.actionButton} onClick={() => document.getElementById('file-input-c').click()}>{t('Load Extension (.ab)')}</button>
                    <button className={styles.actionButton} onClick={() => document.getElementById('file-input-d').click()}>{t('Decompile Extension (.js)')}</button>

                    <input id="file-input-c" type="file" accept=".ab,.json" style={{ display: 'none' }} onChange={(e) => loadProject(e, () => { props.loaded() })} />
                    <input id="file-input-d" type="file" accept=".js" style={{ display: 'none' }} onChange={async (e) => {
                        try {
                            await decompile(e);
                            props.loaded();
                        } catch (err) {
                            alert(t('Failed to decompile extension: ') + err.message);
                        }
                    }} />

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