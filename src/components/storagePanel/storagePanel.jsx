import React, { useState, useEffect } from 'react';
import IndexedDB from '../../storage/indexedDB';

import styles from './storagePanel.module.css'

const DB = new IndexedDB();

function decodeTimestamp(timestamp) { //复制的，我真聪明
    const date = new Date(timestamp);
    return {
        timestamp: timestamp,
        date: date,
        // 常用格式
        yyyy_mm_dd: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        hh_mm_ss: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
        fullDateTime: date.toLocaleString('zh-CN'),
        isoString: date.toISOString(),
        // 中文格式
        chinese: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    };
}

export default function StoragePanel() {
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchExtensions() {
        try {
            await DB.openDB();
            const data = await DB.getAllExtensions();
            setExtensions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchExtensions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <div></div>
            <button onClick={() => {
                let NewExtensionName;
                NewExtensionName = prompt("What name do you want?");
                if (NewExtensionName && NewExtensionName.trim() !== "") {
                    DB.saveExtension({
                        id: Date.now(),
                        name: NewExtensionName
                    });
                    fetchExtensions()
                }
            }}>Add Extension</button>

            <button onClick={() => {
                if (window.confirm("Are you sure you want to delete all extensions?")) {
                    DB.clearExtensions();
                    fetchExtensions();
                }
            }}>Clear All</button>


            <div className={styles.storagePanelContainer}>

                <ul className={styles.extensionList}>
                    {extensions.map(ext => (
                        <>

                            <li key={ext.id} className={styles.extensionItem}>
                                <div>
                                    <span className={styles.extensionName}>{ext.name}</span><br />
                                    <span className={styles.extensionTimestamp}>{decodeTimestamp(ext.id).fullDateTime}</span>
                                </div>
                                <div>
                                    <button onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete "${ext.name}"?`)) {
                                            DB.deleteExtension(ext.id);
                                            fetchExtensions();
                                        }
                                    }}>Load</button>
                                    <button onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete "${ext.name}"?`)) {
                                            DB.deleteExtension(ext.id);
                                            fetchExtensions();
                                        }
                                    }}>Delete</button>
                                </div>
                            </li>

                        </>
                    ))}
                </ul>
            </div>
        </>
    );
}