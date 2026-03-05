import { useEffect, useState } from "react";
import { renderBlockToHTML } from "../../lib/blockSvgRenderer.js";
import Modal from '../modal/modal'
import styles from './newBlock.module.css'
import { BlockType, InputType } from "../../lib/blockSvgRenderer.js";
import { returnValue } from '../../extension/storage.js';
import { useTranslation } from '../../i18n';

import { VscChevronUp, VscChevronDown, VscClose, VscWarning } from "react-icons/vsc";


function moveUp(array, index, pos = 1) {
    if (index <= 0 && pos > 0) return array;
    if (index == array.length - 1 && pos < 0) return array;

    const newArray = [...array];
    [newArray[index - pos], newArray[index]] = [newArray[index], newArray[index - pos]];
    return newArray;
}

const Tip = props => {
    return (
        <div class={styles.Tip}>
            <VscWarning />
            <span>{props.title}</span>
        </div>
    )
}

const NewInput = props => {
    const { t } = useTranslation();
    const [inputType, setInputType] = useState(InputType.TEXT)
    const [inputValue, setInputValue] = useState(
        { TEXT: "Text", NUMBER: "0", DROPDOWN: ["Option 1"] }
    )

    const [inputTypeREADONLY, setInputTypeREADONLY] = useState(false);
    useEffect(() => {
        if (props.isEditingBlock) {
            console.log(props.isEditingBlock)
            console.log(props.blockPart)
            setInputType(props.blockPart.inputType); //这里是固定文本，但定义它的类型是从InputType读取的，所以直接读
            switch (props.blockPart.inputType) {
                //我们没有找到更好的方法来添加...
                case InputType.DROPDOWN:
                case InputType.DROPDOWN_READONLY:
                    setInputType("DropDown");
                    setInputValue({
                        ...inputType,
                        DROPDOWN: props.blockPart.value
                    })
            }
        }
    }, [])




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
            case "textNumber":
                return "textNumber" //兼容
            case InputType.TEXT:
                return inputValue.TEXT
            case InputType.NUMBER:
                return inputValue.NUMBER
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN
            case InputType.BOOLEAN:
                return "" //布尔没有储存值
            default:
                console.error(`Can't find "${inputType}".`)
                return inputValue.TEXT
        }
    }

    /**
     * 返回显示的值，其中Dropdown会返回第一项
     * */
    const getDisplayInputValue = inputType => {
        switch (getRealInputType(inputType)) {
            case "textNumber":
                return "textNumber" //兼容
            case InputType.TEXT:
                return inputValue.TEXT
            case InputType.NUMBER:
                return inputValue.NUMBER
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN[0] || ""
            case InputType.BOOLEAN:
                return "" //布尔没有储存值
            default:
                console.error(`Can't find "${inputType}".`)
                return inputValue.TEXT
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
        <div className={styles.inputTab} style={{
            maxHeight: "95%"
        }}>
            <div className={styles.inputHeader}>
                <h2>{t('Add input')}</h2>
            </div>

            <div className={styles.inputLayout}>
                <div className={styles.inputPanel}>
                    <div className={styles.formRow}>
                        <label className={styles.formLabel}>{t('Mode')}</label>
                        <select
                            value={inputType}
                            onChange={e => {
                                setInputType(e.target.value);
                            }}
                        >
                            <option value={InputType.TEXT}>{t('Text')}</option>
                            <option value={InputType.NUMBER}>{t('Number')}</option>
                            <option value="DropDown">{t('Dropdown')}</option>
                            <option value={InputType.BOOLEAN}>{t('Boolean')}</option>
                        </select>
                    </div>
                    {inputType === "textNumber" && (
                        <Tip
                            title={t("Unknown Mode")}
                        />
                    )}
                    {(inputType === InputType.TEXT || inputType === InputType.NUMBER) && (
                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>
                                {returnValue("comments").translate ? "Default Input Translate ID" : t('Default Input')}
                            </label>
                            <input
                                value={inputType === InputType.NUMBER ? inputValue.NUMBER : inputValue.TEXT}
                                onChange={e => {
                                    if (inputType === InputType.NUMBER) {
                                        setInputValue({ ...inputValue, NUMBER: e.target.value })
                                        return;
                                    }
                                    setInputValue({ ...inputValue, TEXT: e.target.value })
                                }}
                            />

                            {/*提示文字 */}
                            <Tip
                                title={t("If the Addon is not enabled, the background of text and numbers will be consistent in AstraEditor.")}
                            />
                        </div>
                    )}

                    {inputType === "DropDown" && (
                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>
                                <span>{t('read only')}</span>
                                <input
                                    type="checkbox"
                                    checked={inputTypeREADONLY}
                                    onChange={e => {
                                        setInputTypeREADONLY(e.target.checked)
                                    }}
                                />
                            </label>
                            <div className={styles.optionList}>
                                {inputValue.DROPDOWN.map((opt, idx) => (
                                    <div key={idx} className={styles.optionRow}>
                                        {idx === 0 && (<span className={styles.formLabel} style={{
                                            whiteSpace:"nowrap"
                                        }}>
                                            {t("Default Option")}
                                        </span>)}
                                        <input
                                            value={opt}
                                            onChange={e => updateDropdownOption(idx, e.target.value)}
                                        />
                                        <button onClick={() => removeDropdownOption(idx)} disabled={inputValue.DROPDOWN.length <= 1}>
                                            <VscClose />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addDropdownOption}>+</button>
                        </div>
                    )}
                </div>

                <div className={styles.sectionCard} style={{
                    maxWidth: "50%"
                }}>
                    <div className={styles.sectionTitle}>{t('Input Preview')}</div>
                    <div className={styles.inputSvgView}>
                        <div dangerouslySetInnerHTML={{ __html: svgHTML }} />
                    </div>
                </div>
            </div>

            <div className={styles.inputFooter}>
                <button onClick={() => props.back()}>{t('Back')}</button>
                <button onClick={() => props.done(currentInput)}>{t('Done')}</button>
            </div>
        </div >
    )
}
const NewBlock = props => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("create")

    // props.onSave(blockName, blockData)
    // props.initialBlock (optional) - existing block to edit
    // props.initialBlockName (optional) - existing block name to edit
    const [nowSvgBlock, setSvgBlock] = useState({});
    const [blockType, setBlocktype] = useState(BlockType.STACK);
    const [blockPart, setBlockPart] = useState([]);
    const [blockName, setBlockName] = useState("");

    const [EditBlockIndex, setEditBlockIndex] = useState(0);
    const [isEditingBlock, setEditingBlock] = useState(false);
    const canEditParts = true;

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

    const saveBlock = () => {
        if (props.onSave && blockName.trim()) {
            props.onSave(blockName.trim(), {
                type: blockType,
                parts: blockPart
            });
            props.close();
        } else {
            alert(t('Invalid Block ID!'))
        }
    };

    const removePart = (index) => {
        const newPart = [...blockPart];
        newPart.splice(index, 1);
        setBlockPart(newPart);
    };

    const updateTextPart = (index, value) => {
        const newPart = [...blockPart];
        newPart[index] = value;
        setBlockPart(newPart);
    };

    const getTypeName = value => {
        switch (value) {
            case "textNumber":
                return t("Text or Number")
            case "text":
                return t("Text")
            case "number":
                return t("Number")
            case "dropdown":
                return t("Dropdown")
            case "dropdownReadOnly":
                return t("Read Only Dropdown")
            case "boolean":
                return t("Boolean")
            default:
                return value
        }
    }

    return (
        <div>
            <Modal
                close={() => props.close()}
                title={t('New Block')}
                height="75%"
                width="75%"
            >
                {activeTab === 'create' && (
                    <div className={styles.newBlock}>
                        <div className={styles.blockArea}>
                            <div className={styles.sectionCard}>
                                <div className={styles.sectionTitle}>{t('Block Preview')}</div>
                                <div className={styles.svgView}>
                                    <div className={styles.previewOpcode}>{blockName}</div>
                                    <div dangerouslySetInnerHTML={{ __html: svgHTML }} />
                                </div>
                            </div>

                            <div className={styles.sectionCard}>
                                <div className={styles.formRow}>
                                    <label className={styles.formLabel}>{t('ID')}</label>
                                    <input
                                        type="text"
                                        value={blockName}
                                        onChange={e => {
                                            // 只允许 a-z A-Z 字符
                                            const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                                            setBlockName(value);
                                        }}
                                        placeholder={t('Enter ID (a-z, A-Z only)')}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.formLabel}>{t('Block Type')}</label>
                                    <select
                                        value={blockType}
                                        onChange={e => {
                                            setBlocktype(e.target.value);
                                        }}
                                    >
                                        <option value={BlockType.STACK}>{t('stack')}</option>
                                        <option value={BlockType.HAT}>{t('hat')}</option>
                                        <option value={BlockType.ROUND}>{t('repoter')}</option>
                                        <option value={BlockType.BOOLEAN}>{t('boolean')}</option>
                                        <option value={BlockType.C_BLOCK}>{t('C block')}</option>
                                    </select>
                                </div>

                                <div className={styles.actionsRow}>
                                    {canEditParts && (
                                        <>
                                            <button onClick={() => {
                                                setBlockPart(
                                                    [
                                                        ...blockPart,
                                                        "Text"
                                                    ]
                                                )
                                            }}>
                                                {returnValue("comments").translate ? "Add Text Translate ID" : t('Add Text')}
                                            </button>
                                            <button onClick={() => {
                                                setEditingBlock(false);
                                                setActiveTab("add_input")
                                            }}>
                                                {t('Add Input')}
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => {
                                        saveBlock()
                                    }}>
                                        {t('Save Block')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.domView}>
                            <div className={styles.sectionCard}>
                                <div className={styles.sectionTitle}>{t('Block Parts')}</div>
                                {blockPart.length === 0 ? (
                                    <div className={styles.emptyParts}>{t('No parts yet. Add text or input to start building.')}</div>
                                ) : (
                                    <div className={styles.partsList}>
                                        {blockPart.map((item, index) => (
                                            <div className={styles.partRow} key={`${typeof item}-${index}`}>
                                                <div className={styles.partIndex}>#{index + 1}</div>
                                                <div className={styles.partContent}>
                                                    {typeof item === "object" ? (
                                                        <code className={styles.partCode}>
                                                            {getTypeName(item.inputType)}{item.inputType !== BlockType.BOOLEAN && ":"} {Array.isArray(item.value) ? (item.value[0] + '...') : item.value}
                                                        </code>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={item}
                                                            onChange={e => {
                                                                updateTextPart(index, e.target.value)
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.partActions}>
                                                    <button onClick={() => {
                                                        setBlockPart(moveUp(blockPart, index))
                                                    }}><VscChevronUp /></button>
                                                    <button onClick={() => {
                                                        setBlockPart(moveUp(blockPart, index, -1))
                                                    }}><VscChevronDown /></button>
                                                    <button onClick={() => {
                                                        setBlockPart(moveUp(blockPart, index, index))
                                                    }}>{t('move to top')}</button>
                                                    <button onClick={() => {
                                                        removePart(index)
                                                    }}>{t('Remove')}</button>
                                                    <button onClick={() => {
                                                        setEditingBlock(true)
                                                        setEditBlockIndex(index);
                                                        setActiveTab("add_input")
                                                    }}>{t('Modify')}</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'add_input' && (
                    <NewInput
                        back={() => {
                            setEditBlockIndex(0);
                            setEditingBlock(false);
                            setActiveTab("create");
                            updateSVG()
                        }}
                        done={(input) => {
                            if (isEditingBlock) {
                                const BlockPart = blockPart;
                                blockPart[EditBlockIndex] = input;
                                setBlockPart(BlockPart)
                            } else {
                                setBlockPart(
                                    [
                                        ...blockPart,
                                        input
                                    ]
                                )
                            }
                            setEditBlockIndex(0);
                            setEditingBlock(false);
                            setActiveTab("create");
                            updateSVG()
                        }}
                        isEditingBlock={isEditingBlock}
                        blockPart={blockPart[EditBlockIndex]}
                    />
                )}

            </Modal>
        </div>
    )
}

export default NewBlock;