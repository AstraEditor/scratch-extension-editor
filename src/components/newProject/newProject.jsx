import { useEffect, useState } from 'react'
import {
    init,
    returnValue,
    setValueTo,
    getAllValue
} from '../../extension/storage'

import styles from './newProject.module.css'

export default function NewProject() {
    const [nowActiveTab, setActiveTab] = useState("name")
    const [nowName, setName] = useState("")
    useEffect(() => {
        init() //扩展初始化
        console.log(getAllValue())
    }, [])

    const setNameToStorage = name => {
        const newComment = returnValue("comments");
        newComment.name = name;
        setValueTo("comments", newComment);
        console.log(getAllValue())
    }
    return (
        <div className={styles.main}>
            {nowActiveTab === "name" && (
                <>
                    <h1>What name do you like?</h1>
                    <h4>Type your favourite name here</h4>
                    <input type='text' placeholder='Name'
                        onChange={(e) => setName(e.target.value)}
                        value={nowName}
                    />
                    <button onClick={() => setNameToStorage(nowName)}>Next</button>
                </>
            )}
        </div>
    )
}