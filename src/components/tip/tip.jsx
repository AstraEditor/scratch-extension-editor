import { VscWarning } from "react-icons/vsc";
import styles from './tip.module.css'

const Tip = props => {
    return (
        <div className={styles.Tip}>
            <div className={styles.title}>
                <VscWarning />
                <span>{props.title}</span>
            </div>
            {props.children &&
                <div className={styles.title}>
                    {props.children}
                </div>
            }
        </div>
    )
};

export default Tip