import { VscWarning } from "react-icons/vsc";
import styles from './tip.module.css'

const Tip = props => {
    return (
        <div class={styles.Tip}>
            <div class={styles.title}>
                <VscWarning />
                <span>{props.title}</span>
            </div>
            {props.children &&
                <div class={styles.title}>
                    {props.children}
                </div>
            }
        </div>
    )
};

export default Tip