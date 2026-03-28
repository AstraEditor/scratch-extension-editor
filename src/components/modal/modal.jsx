import styles from './modal.module.css'
import close from './close.svg'

const Modal = props => {
    const closeUI = () => {
        props.close()
    }
    return (
        <div className={styles.modal}>
            <div className={styles.backGround} onClick={() => {
                closeUI()
            }}></div>
            <div className={styles.window} style={{
                width: props.width || "50%",
                height: props.height || "50%"
            }}>
                <div className={styles.title}>
                    <div className={styles.titleBar}>
                        <span>{props.title}</span>
                    </div>
                    <img className={styles.close} src={close} alt="close" onClick={() => {
                        closeUI()
                    }} />
                </div>
                {props.children}
            </div>
        </div>
    )
}

export default Modal