import styles from "./FSCEditor.module.css";

import { t } from "../../i18n";

const FSCEditor = props => {
    const ext = props.fscData
    return (
        <div className={styles.fscEditor}>
            <h1>{ext.name}</h1>
        </div>
    )
}

export default FSCEditor