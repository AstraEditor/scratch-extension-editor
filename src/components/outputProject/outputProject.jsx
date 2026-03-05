import { useState, useEffect } from 'react'
import Modal from '../modal/modal.jsx'
import styles from './outputProject.module.css'
import { useTranslation } from '../../i18n'

import { spawnExtension } from '../../extension/spawn.js'

const OutputProject = props => {
    const { t } = useTranslation();
    const [code, setCode] = useState(t('Loading...'))

    useEffect(() => {
        spawnExtension().then(result => {
            setCode(result)
        }).catch(error => {
            setCode("Error: " + error.message)
        })
    }, [])

    return (
        <div>
            <Modal
                close={() => props.close()}
                title={t('Output Project')}
                height="75%"
                width="75%"
            >
                <textarea className={styles.ouput} readOnly value={code} />
            </Modal>
        </div>
    )
}

export default OutputProject;