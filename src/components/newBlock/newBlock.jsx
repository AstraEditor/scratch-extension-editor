import { useEffect, useState } from "react";
import { renderBlockToHTML } from "../../lib/blockSvgRenderer.js";
import Modal from '../modal/modal'
import styles from './newBlock.module.css'
import { renderBlock, svgToString, BlockType, InputType, MIN_BLOCK_Y } from "../../lib/blockSvgRenderer.js";
import { returnValue } from '../../extension/storage.js';


function moveUp(array, index, pos = 1) {
    if (index <= 0 && pos > 0) return array;
    if (index == array.length - 1 && pos < 0) return array;

    const newArray = [...array];
    [newArray[index - pos], newArray[index]] = [newArray[index], newArray[index - pos]];
    return newArray;
}

const NewBlock = props => {
    // props.onSave(blockData)
    // props.initialBlock (optional) - existing block to edit
    const [nowSvgBlock, setSvgBlock] = useState({});
    const [blockType, setBlocktype] = useState(BlockType.STACK);
    const [blockPart, setBlockPart] = useState([]);
    const [colors, setColors] = useState({
        primary: returnValue("comments").color[0],
        secondary: returnValue("comments").color[1],
        tertiary: returnValue("comments").color[2],
    });

    const svgHTML = renderBlockToHTML(nowSvgBlock);

    const updateSVG = () => {
        const newBlock = {
            type: blockType,
            colors,
            parts: blockPart
        };
        setSvgBlock(newBlock);
    };

    // respond to type/parts changes
    useEffect(() => {
        updateSVG();
    }, [blockType, blockPart]);

    // when editing an existing block, populate fields
    useEffect(() => {
        if (props.initialBlock) {
            setBlocktype(props.initialBlock.type || BlockType.STACK);
            setBlockPart(props.initialBlock.parts || []);
            if (props.initialBlock.colors) {
                setColors(props.initialBlock.colors);
            }
            // immediately update svg block to match colors
            setSvgBlock(props.initialBlock);
        }
    }, [props.initialBlock]);

    return (
        <div>
            <Modal
                close={() => props.close()}
                title="New Block"
                height="75%"
                width="75%"
            >
                <div className={styles.newBlock}>
                    <div className={styles.blockArea}>
                        Block Preview:
                        <div className={styles.svgView}>
                            <div dangerouslySetInnerHTML={{ __html: svgHTML }} />
                        </div>


                        Block Type:
                        <select
                            value={blockType}
                            onChange={e => {
                                setBlocktype(e.target.value);
                            }}
                        >
                            <option value={BlockType.STACK}>stack</option>
                            <option value={BlockType.HAT}>hat</option>
                            <option value={BlockType.ROUND}>round</option>
                            <option value={BlockType.BOOLEAN}>boolean</option>
                            <option value={BlockType.C_BLOCK}>C block</option>
                        </select>
                        {blockType !== BlockType.C_BLOCK && (
                            <div>
                                <button onClick={() => {
                                    setBlockPart(
                                        [
                                            ...blockPart,
                                            "TEXT"
                                        ]
                                    )
                                }}>
                                    Add Text
                                </button>
                                <button onClick={() => {
                                    setBlockPart(
                                        [
                                            ...blockPart,
                                            { inputType: InputType.TEXT_NUMBER, value: "Text and Number Input"}
                                        ]
                                    )
                                }}>
                                    Add Input
                                </button>
                                <button onClick={() => {
                                    // 保存当前积木并关闭弹窗
                                    if (props.onSave) {
                                        props.onSave(nowSvgBlock);
                                    }
                                    props.close();
                                }}>
                                    Save Block
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.domView}>
                        {blockPart.map((item, index) => (
                            <div>
                                {
                                    typeof item === "object" ?
                                        <code>Input: {item.value}</code>
                                        : <input type="text" value={item} onChange={e => {
                                            let newPart = [...blockPart]
                                            newPart[index] = e.target.value
                                            setBlockPart(newPart)
                                        }} />
                                }
                                <button onClick={() => {
                                    setBlockPart(moveUp(blockPart, index))
                                }}>up</button>
                                <button onClick={() => {
                                    setBlockPart(moveUp(blockPart, index, -1))
                                }}>down</button>
                                <button onClick={() => {
                                    setBlockPart(moveUp(blockPart, index, index))
                                }}>make first</button>
                                <button onClick={() => {
                                    let newPart = [...blockPart]
                                    newPart.splice(index, 1);
                                    setBlockPart(newPart)
                                }}>Remove</button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default NewBlock;