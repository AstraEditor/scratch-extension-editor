import { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css'

import NewBlock from '../newBlock/newBlock';
import OutputProject from '../outputProject/outputProject.jsx';

import { renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import { getAllValue, setValueTo, returnValue } from '../../extension/storage.js';

// 预处理积木数据，用于显示（数组类型的 value 取第一项，颜色从 storage 获取）
const prepareBlockForDisplay = (blockData) => {
    if (!blockData) return blockData;
    const colors = returnValue("comments").color;
    return {
        ...blockData,
        colors: {
            primary: colors[0],
            secondary: colors[1],
            tertiary: colors[2],
        },
        parts: blockData.parts ? blockData.parts.map(part => {
            if (part && typeof part === 'object' && Array.isArray(part.value)) {
                return { ...part, value: part.value[0] || '' };
            }
            return part;
        }) : []
    };
};

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
    const [isSaveBlock, setSaveBlock] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null);

    const handleSaveBlock = (blockName, blockData) => {
        console.log(blockName, blockData);
        const allBlocks = getAllValue().blocks || {};
        setValueTo("blocks", { ...allBlocks, [blockName]: blockData });
        setEditingIndex(null);
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
                    initialBlock={editingIndex !== null ? getAllValue().blocks?.[editingIndex] : null}
                    initialBlockName={editingIndex !== null ? editingIndex : null}
                />
            )}
            {isSaveBlock && (
                <OutputProject
                    close={() => {
                        setSaveBlock(false)
                    }}
                />
            )}
            <div className={styles.blocks} style={{ width: `${leftWidth}%` }}>
                {/* 积木区 */}
                <h1>Blocks</h1>
                <button onClick={() => {
                    setEditingIndex(null);
                    setCreatBlock(true)
                }}>Create new Block</button>
                <button onClick={() => {
                    setSaveBlock(true)
                }}>Output</button>
                <div>
                    <h3>Flyout:</h3>
                    {Object.entries(getAllValue().blocks || {}).map(([name, blk]) => (
                        <div
                            key={name}
                            className={styles.blockPreview}
                            style={{ marginBottom: '24px', cursor: 'pointer' }}
                            onClick={() => {
                                setEditingIndex(name);
                                setCreatBlock(true);
                            }}
                        >
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{name}</div>
                            <div dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(blk)) }} />
                        </div>
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