import { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css'

import NewBlock from '../newBlock/newBlock';
import { renderBlockToHTML } from '../../lib/blockSvgRenderer.js';

const Editor = props => {
    const [leftWidth, setLeftWidth] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return;
            
            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
            
            // 限制最小和最大宽度
            if (newLeftWidth >= 10 && newLeftWidth <= 90) {
                setLeftWidth(newLeftWidth);
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);


    const [isCreatingBlock, setCreatBlock] = useState(false)
    const [savedBlocks, setSavedBlocks] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleSaveBlock = (blockData) => {
        if (editingIndex !== null && editingIndex >= 0 && editingIndex < savedBlocks.length) {
            setSavedBlocks(prev => prev.map((b, i) => i === editingIndex ? blockData : b));
            setEditingIndex(null);
        } else {
            setSavedBlocks(prev => [...prev, blockData]);
        }
    };

    return (
        <div className={styles.editor} ref={containerRef}>
            {isCreatingBlock && (
                <NewBlock
                    close={() => {
                        setCreatBlock(false);
                        setEditingIndex(null);
                    }}
                    onSave={handleSaveBlock}
                    initialBlock={editingIndex !== null ? savedBlocks[editingIndex] : null}
                />
            )}
            <div className={styles.blocks} style={{ width: `${leftWidth}%` }}>
                {/* 积木区 */}
                <h1>Blocks</h1>
                <button onClick={() => {
                    setEditingIndex(null);
                    setCreatBlock(true)
                }}>Create new Block</button>
                <div>
                    {savedBlocks.map((blk, idx) => (
                        <div
                            key={idx}
                            className={styles.blockPreview}
                            style={{ marginBottom: '24px', cursor: 'pointer' }}
                            onClick={() => {
                                setEditingIndex(idx);
                                setCreatBlock(true);
                            }}
                            dangerouslySetInnerHTML={{ __html: renderBlockToHTML(blk) }}
                        />
                    ))}
                </div>
            </div>
            <div 
                className={styles.resizer}
                onMouseDown={handleMouseDown}
            />
            <div className={styles.code} style={{ width: `${100 - leftWidth}%` }}>
                {/* 代码区 */}
                <h1>Code</h1>
            </div>
        </div>
    )
}
export default Editor