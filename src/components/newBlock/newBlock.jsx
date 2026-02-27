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
const NewInput = props => {
    const [inputType, setInputType] = useState(InputType.TEXT_NUMBER)
    const [inputValue, setInputValue] = useState(
        { TEXT_NUMBER: "Text and number", DROPDOWN: ["Option 1"] }
    )

    const [inputTypeREADONLY, setInputTypeREADONLY] = useState(false);

    /**
     * 用在推测类型，输入一个类型，返回一个类型，会确认DropDown类型
     * */
    const getRealInputType = input => {
        if (input === "DropDown") {
            if (inputTypeREADONLY) {
                return InputType.DROPDOWN_READONLY
            } else {
                return InputType.DROPDOWN
            }
        }
        return input
    }

    /**
     * 返回完整的值
     * */
    const getInputValue = inputType => {
        switch (getRealInputType(inputType)) {
            case InputType.TEXT_NUMBER:
                return inputValue.TEXT_NUMBER
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN
            case InputType.BOOLEAN:
                return "" //布尔没有储存值
            default:
                console.error(`Can't find "${inputType}".`)
                return inputValue.TEXT_NUMBER
        }
    }

    /**
     * 返回显示的值，其中Dropdown会返回第一项
     * */
    const getDisplayInputValue = inputType => {
        switch (getRealInputType(inputType)) {
            case InputType.TEXT_NUMBER:
                return inputValue.TEXT_NUMBER
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN[0] || ""
            case InputType.BOOLEAN:
                return "" //布尔没有储存值
            default:
                console.error(`Can't find "${inputType}".`)
                return inputValue.TEXT_NUMBER
        }
    }

    // 构建当前输入框对象
    const currentInput = {
        inputType: getRealInputType(inputType),
        value: getInputValue(inputType)
    };

    // 用于 SVG 预览显示的输入框（value 用显示值）
    const displayInput = {
        inputType: getRealInputType(inputType),
        value: getDisplayInputValue(inputType)
    };

    const svgBlock = {
        type: BlockType.ROUND,
        colors: {
            primary: returnValue("comments").color[0],
            secondary: returnValue("comments").color[1],
            tertiary: returnValue("comments").color[2],
        },
        parts: [displayInput]
    };

    const svgHTML = renderBlockToHTML(svgBlock);

    // 添加下拉选项
    const addDropdownOption = () => {
        setInputValue(prev => ({
            ...prev,
            DROPDOWN: [...prev.DROPDOWN, `Option ${prev.DROPDOWN.length + 1}`]
        }));
    };

    // 删除下拉选项
    const removeDropdownOption = (index) => {
        setInputValue(prev => ({
            ...prev,
            DROPDOWN: prev.DROPDOWN.filter((_, i) => i !== index)
        }));
    };

    // 修改下拉选项
    const updateDropdownOption = (index, newValue) => {
        setInputValue(prev => ({
            ...prev,
            DROPDOWN: prev.DROPDOWN.map((opt, i) => i === index ? newValue : opt)
        }));
    };

    return (
        <div className={styles.inputTab}>
            <h2>Add input</h2>
            Input Preview:
            <div className={styles.inputSvgView}>
                <div dangerouslySetInnerHTML={{ __html: svgHTML }} />
            </div>
            Mode: <select
                value={inputType}
                onChange={e => {
                    setInputType(e.target.value);
                }}
            >
                <option value={InputType.TEXT_NUMBER}>Text and Number</option>
                <option value="DropDown">DropDown</option>
                <option value={InputType.BOOLEAN}>Boolean</option>
            </select>
            {inputType === InputType.TEXT_NUMBER && (
                <div>
                    <h2>Text and Number</h2>
                    {returnValue("comments").translate ? "Default Input Translate ID" : "Default Input"}: <input value={inputValue.TEXT_NUMBER} onChange={e => {
                        setInputValue({ ...inputValue, TEXT_NUMBER: e.target.value })
                    }} />
                </div>
            )}
            {inputType === "DropDown" && (
                <div>
                    <h2>DropDown</h2>
                    read only: <input type="checkbox" checked={inputTypeREADONLY} onChange={e => {
                        setInputTypeREADONLY(e.target.checked)
                    }} />
                    <div style={{ marginTop: '10px' }}>
                        <h3>Options:</h3>
                        {inputValue.DROPDOWN.map((opt, idx) => (
                            <div key={idx} style={{ marginBottom: '5px' }}>
                                <input
                                    value={opt}
                                    onChange={e => updateDropdownOption(idx, e.target.value)}
                                />
                                <button onClick={() => removeDropdownOption(idx)} disabled={inputValue.DROPDOWN.length <= 1}>
                                    X
                                </button>
                            </div>
                        ))}
                        <button onClick={addDropdownOption}>+</button>
                    </div>
                </div>
            )}
            <div>
                <button onClick={() => props.back()}>Back</button>
                <button onClick={() => props.done(currentInput)}>Done</button>
            </div>
        </div>
    )
}
const NewBlock = props => {
    const [activeTab, setActiveTab] = useState("create")

    // props.onSave(blockName, blockData)
    // props.initialBlock (optional) - existing block to edit
    // props.initialBlockName (optional) - existing block name to edit
    const [nowSvgBlock, setSvgBlock] = useState({});
    const [blockType, setBlocktype] = useState(BlockType.STACK);
    const [blockPart, setBlockPart] = useState([]);
    const [blockName, setBlockName] = useState("");

    // 从 storage 获取颜色
    const getColors = () => ({
        primary: returnValue("comments").color[0],
        secondary: returnValue("comments").color[1],
        tertiary: returnValue("comments").color[2],
    });

    // 预处理 parts，用于显示（数组类型的 value 取第一项）
    const preparePartsForDisplay = (parts) => {
        if (!parts) return parts;
        return parts.map(part => {
            if (part && typeof part === 'object' && Array.isArray(part.value)) {
                return { ...part, value: part.value[0] || '' };
            }
            return part;
        });
    };

    const svgHTML = renderBlockToHTML(nowSvgBlock);

    const updateSVG = () => {
        const newBlock = {
            type: blockType,
            colors: getColors(),
            parts: preparePartsForDisplay(blockPart)
        };
        setSvgBlock(newBlock);
    };

    useEffect(() => {
        console.log(blockPart)
        updateSVG();
    }, [blockType, blockPart]);

    useEffect(() => {
        if (props.initialBlock) {
            setBlocktype(props.initialBlock.type || BlockType.STACK);
            setBlockPart(props.initialBlock.parts || []);
            // 立即更新 svg block
            setSvgBlock({
                ...props.initialBlock,
                colors: getColors()
            });
        }
        if (props.initialBlockName) {
            setBlockName(props.initialBlockName);
        }
    }, [props.initialBlock, props.initialBlockName]);

    return (
        <div>
            <Modal
                close={() => props.close()}
                title="New Block"
                height="75%"
                width="75%"
            >
                {activeTab === 'create' && (
                    <div className={styles.newBlock}>
                        <div className={styles.blockArea}>
                            Block Preview:
                            <div className={styles.svgView}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{blockName}</div>
                                <div dangerouslySetInnerHTML={{ __html: svgHTML }} />
                            </div>

                            Opcode (ID):
                            <input
                                type="text"
                                value={blockName}
                                onChange={e => {
                                    // 只允许 a-z A-Z 字符
                                    const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                                    setBlockName(value);
                                }}
                                placeholder="Enter opcode (a-z, A-Z only)"
                            />

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
                                                "Text"
                                            ]
                                        )
                                    }}>
                                        {returnValue("comments").translate ? "Add Text Translate ID" : "Add Text"}
                                    </button>
                                    <button onClick={() => {
                                        setActiveTab("add_input")
                                    }}>
                                        Add Input
                                    </button>
                                    <button onClick={() => {
                                        if (props.onSave && blockName.trim()) {
                                            props.onSave(blockName.trim(), {
                                                type: blockType,
                                                parts: blockPart
                                            });
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
                                            <code>Input: {Array.isArray(item.value) ? item.value[0] + '...' : item.value}</code>
                                            : <input type="text" value={item} onChange={e => {
                                                let newPart = [...blockPart]
                                                newPart[index] = e.target.value
                                                setBlockPart(newPart)
                                            }} />
                                    }
                                    <button onClick={() => {
                                        setBlockPart(moveUp(blockPart, index))
                                    }}>↑</button>
                                    <button onClick={() => {
                                        setBlockPart(moveUp(blockPart, index, -1))
                                    }}>↓</button>
                                    <button onClick={() => {
                                        setBlockPart(moveUp(blockPart, index, index))
                                    }}>move to top</button>
                                    <button onClick={() => {
                                        let newPart = [...blockPart]
                                        newPart.splice(index, 1);
                                        setBlockPart(newPart)
                                    }}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'add_input' && (
                    <NewInput
                        back={() => setActiveTab("create")}
                        done={(input) => {
                            setBlockPart(
                                [
                                    ...blockPart,
                                    input
                                ]
                            )
                            setActiveTab("create")
                        }}
                    />
                    // setBlockPart(
                    //     [
                    //         ...blockPart,
                    //         { inputType: InputType.TEXT_NUMBER, value: "Text and Number Input" }
                    //     ]
                    // )
                )}

            </Modal>
        </div>
    )
}

export default NewBlock;