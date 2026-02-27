import Modal from '../modal/modal.jsx'
import styles from './outputProject.module.css'

import { spawnExtension } from '../../extension/spawn.js'

const OutputProject = props => {

    return (
        <div>
            <Modal
                close={() => props.close()}
                title="Output Project"
                height="75%"
                width="75%"
            >
                <textarea className={styles.ouput} readOnly>
                    {spawnExtension()}
                </textarea>
            </Modal>
        </div>
    )
}

export default OutputProject;