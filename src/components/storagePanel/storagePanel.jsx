import React, { useState, useEffect } from 'react';
import IndexedDB from '../../storage/indexedDB';

const DB = new IndexedDB();

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
        <div>
            <button onClick={() => {
                let NewExtensionName;
                NewExtensionName = prompt("What name do you want?");
                if (!NewExtensionName || NewExtensionName.trim() === "") {
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


            <ul>
                {extensions.map(ext => (
                    <>
                        <li key={ext.id}>{ext.name}</li>
                        <button onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${ext.name}"?`)) {
                                DB.deleteExtension(ext.id);
                                fetchExtensions();
                            }
                        }}>Delete</button>
                    </>
                ))}
            </ul>
        </div>
    );
}