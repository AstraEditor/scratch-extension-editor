import { Fragment, useEffect, useState, useRef } from "react";
import { renderBlockToHTML, DefaultBlockConfig, getConfigForBlockType, NEXT_BRANCH_MARKER } from "../../lib/blockSvgRenderer.js";
import Modal from '../modal/modal'
import styles from './newBlock.module.css'
import { BlockType, InputType } from "../../lib/blockSvgRenderer.js";
import { returnValue } from '../../extension/storage.js';
import { useTranslation } from '../../i18n';
import Tip from '../tip/tip.jsx';
import { prepareBlockForDisplay } from "../editor/blockUtils.js";


import { VscClose } from "react-icons/vsc";


function moveUp(array, index, pos = 1) {
    if (index <= 0 && pos > 0) return array;
    if (index === array.length - 1 && pos < 0) return array;

    const newArray = [...array];
    [newArray[index - pos], newArray[index]] = [newArray[index], newArray[index - pos]];
    return newArray;
}

const DEFAULT_DROPDOWN_OPTIONS = [{ name: "Option 1", value: "1" }];
const DEFAULT_IMAGE_VALUE = {
    dataURI: "",
    width: 40,
    height: 40,
    alt: "Image",
    flipRTL: false
};
const ALL_FILTER_TARGETS = ['sprite', 'stage'];


const NewInput = props => {
    const { t } = useTranslation();
    const [inputType, setInputType] = useState(InputType.TEXT)
    const [inputValue, setInputValue] = useState({
        TEXT: "Text",
        NUMBER: "0",
        ANGLE: "90",
        COLOR: "#ff8c1a",
        MATRIX: "0101010101010101010101010",
        NOTE: "60",
        COSTUME: "costume1",
        SOUND: "sound1",
        DROPDOWN: [...DEFAULT_DROPDOWN_OPTIONS],
        IMAGE: { ...DEFAULT_IMAGE_VALUE }
    })

    const [inputTypeREADONLY, setInputTypeREADONLY] = useState(false);
    useEffect(() => {
        if (props.isEditingBlock) {
            const part = props.blockPart;
            if (!part) return;
            setInputType(part.inputType); //这里是固定文本，但定义它的类型是从InputType读取的，所以直接读
            switch (props.blockPart.inputType) {
                //我们没有找到更好的方法来添加...
                case InputType.DROPDOWN:
                case InputType.DROPDOWN_READONLY:
                    setInputType("DropDown");
                    setInputTypeREADONLY(props.blockPart.inputType === InputType.DROPDOWN_READONLY);
                    setInputValue({
                        TEXT: "Text",
                        NUMBER: "0",
                        ANGLE: "90",
                        COLOR: "#ff8c1a",
                        MATRIX: "0101010101010101010101010",
                        NOTE: "60",
                        COSTUME: "costume1",
                        SOUND: "sound1",
                        DROPDOWN: Array.isArray(props.blockPart.value) && props.blockPart.value.length > 0
                            ? props.blockPart.value
                            : [...DEFAULT_DROPDOWN_OPTIONS],
                        IMAGE: { ...DEFAULT_IMAGE_VALUE }
                    })
                    break;
                case InputType.IMAGE:
                    setInputValue(prev => ({
                        ...prev,
                        IMAGE: {
                            ...DEFAULT_IMAGE_VALUE,
                            ...(props.blockPart.value || {})
                        }
                    }));
                    break;
                case InputType.TEXT:
                    setInputValue(prev => ({ ...prev, TEXT: props.blockPart.value || "" }));
                    break;
                case InputType.NUMBER:
                    setInputValue(prev => ({ ...prev, NUMBER: String(props.blockPart.value ?? "0") }));
                    break;
                case InputType.ANGLE:
                    setInputValue(prev => ({ ...prev, ANGLE: String(props.blockPart.value ?? "90") }));
                    break;
                case InputType.COLOR:
                    setInputValue(prev => ({ ...prev, COLOR: props.blockPart.value || "#ff8c1a" }));
                    break;
                case InputType.MATRIX:
                    setInputValue(prev => ({ ...prev, MATRIX: props.blockPart.value || "" }));
                    break;
                case InputType.NOTE:
                    setInputValue(prev => ({ ...prev, NOTE: String(props.blockPart.value ?? "60") }));
                    break;
                case InputType.COSTUME:
                    setInputValue(prev => ({ ...prev, COSTUME: props.blockPart.value || "costume1" }));
                    break;
                case InputType.SOUND:
                    setInputValue(prev => ({ ...prev, SOUND: props.blockPart.value || "sound1" }));
                    break;
                default:
                    break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            case InputType.ANGLE:
                return inputValue.ANGLE
            case InputType.COLOR:
                return inputValue.COLOR
            case InputType.MATRIX:
                return inputValue.MATRIX
            case InputType.NOTE:
                return inputValue.NOTE
            case InputType.COSTUME:
                return inputValue.COSTUME
            case InputType.SOUND:
                return inputValue.SOUND
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN
            case InputType.IMAGE:
                return inputValue.IMAGE
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
            case InputType.ANGLE:
                return inputValue.ANGLE
            case InputType.COLOR:
                return inputValue.COLOR
            case InputType.MATRIX:
                return inputValue.MATRIX
            case InputType.NOTE:
                return inputValue.NOTE
            case InputType.COSTUME:
                return inputValue.COSTUME
            case InputType.SOUND:
                return inputValue.SOUND
            case InputType.DROPDOWN:
            case InputType.DROPDOWN_READONLY:
                return inputValue.DROPDOWN[0]?.name || ""
            case InputType.IMAGE:
                return inputValue.IMAGE
            case InputType.BOOLEAN:
                return "" //布尔没有储存值
            default:
                console.error(`Can't find "${inputType}".`)
                return inputValue.TEXT
        }
    }

    const preservedPartMeta = props.isEditingBlock && props.blockPart
        ? Object.fromEntries(
            Object.entries(props.blockPart).filter(([key]) => key !== 'inputType' && key !== 'value')
        )
        : {};

    // 构建当前输入框对象
    const currentInput = {
        ...preservedPartMeta,
        inputType: getRealInputType(inputType),
        value: getInputValue(inputType)
    };

    // 用于 SVG 预览显示的输入框（value 用显示值）
    const displayInput = {
        ...preservedPartMeta,
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
            DROPDOWN: [
                ...prev.DROPDOWN,
                {
                    name: `Option ${prev.DROPDOWN.length + 1}`,
                    value: `${prev.DROPDOWN.length + 1}`
                }
            ]
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
    const updateDropdownOption = (idx, name, newValue) => {
        setInputValue(prev => ({
            ...prev,
            DROPDOWN: prev.DROPDOWN.map((item, itemIndex) => (
                itemIndex === idx ? { ...item, [name]: newValue } : item
            ))
        }));
    };

    const updateImageValue = (key, value) => {
        setInputValue(prev => ({
            ...prev,
            IMAGE: {
                ...prev.IMAGE,
                [key]: value
            }
        }));
    };

    const uploadImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                updateImageValue('dataURI', event.target?.result || '');
            };
            reader.readAsDataURL(file);
        };
        input.click();
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
                            <optgroup label={t('Special Input')}>
                                <option value={InputType.ANGLE}>{t('Angle')}</option>
                                <option value={InputType.NOTE}>{t('Note')}</option>
                                <option value={InputType.COLOR}>{t('Color')}</option>
                                <option value={InputType.MATRIX}>{t('Matrix')}</option>
                            </optgroup>
                            <optgroup label={t('Sprite Property')}>
                                <option value={InputType.COSTUME}>{t('Costume')}</option>
                                <option value={InputType.SOUND}>{t('Sound')}</option>
                            </optgroup>
                            <option value="DropDown">{t('Dropdown')}</option>
                            <option value={InputType.BOOLEAN}>{t('Boolean')}</option>
                        </select>
                    </div>
                    {inputType === "textNumber" && (
                        <Tip
                            title={t("Unknown Mode")}
                        />
                    )}
                    {[
                        InputType.TEXT,
                        InputType.NUMBER,
                        InputType.ANGLE,
                        InputType.COLOR,
                        InputType.MATRIX,
                        InputType.NOTE,
                        InputType.COSTUME,
                        InputType.SOUND
                    ].includes(inputType) && (
                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>
                                {returnValue("comments").translate ? "Default Input Translate ID" : t('Default Input')}
                            </label>
                            <input
                                type={inputType === InputType.COLOR ? "color" : "text"}
                                value={
                                    inputType === InputType.NUMBER ? inputValue.NUMBER :
                                        inputType === InputType.ANGLE ? inputValue.ANGLE :
                                            inputType === InputType.COLOR ? inputValue.COLOR :
                                                inputType === InputType.MATRIX ? inputValue.MATRIX :
                                                    inputType === InputType.NOTE ? inputValue.NOTE :
                                                        inputType === InputType.COSTUME ? inputValue.COSTUME :
                                                            inputType === InputType.SOUND ? inputValue.SOUND :
                                                                inputValue.TEXT
                                }
                                onChange={e => {
                                    if (inputType === InputType.NUMBER) {
                                        setInputValue({ ...inputValue, NUMBER: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.ANGLE) {
                                        setInputValue({ ...inputValue, ANGLE: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.COLOR) {
                                        setInputValue({ ...inputValue, COLOR: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.MATRIX) {
                                        setInputValue({ ...inputValue, MATRIX: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.NOTE) {
                                        setInputValue({ ...inputValue, NOTE: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.COSTUME) {
                                        setInputValue({ ...inputValue, COSTUME: e.target.value })
                                        return;
                                    }
                                    if (inputType === InputType.SOUND) {
                                        setInputValue({ ...inputValue, SOUND: e.target.value })
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
                                {Object.keys(inputValue.DROPDOWN).map((opt, idx) => (
                                    <div key={idx} className={styles.optionRow}>
                                        {idx === 0 && (<span className={styles.formLabel} style={{
                                            whiteSpace: "nowrap"
                                        }}>
                                            {t("Default Option")}
                                        </span>)}
                                        <input
                                            value={inputValue.DROPDOWN[opt]["name"]}
                                            onChange={e => updateDropdownOption(idx,"name",e.target.value)}
                                        />
                                        <input
                                            value={inputValue.DROPDOWN[opt]["value"]}
                                            onChange={e => updateDropdownOption(idx,"value", e.target.value)}
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

                    {inputType === InputType.IMAGE && (
                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>{t('Image settings')}</label>
                            <div className={styles.optionList}>
                                <div className={styles.optionRow}>
                                    <button onClick={uploadImage}>{t('Upload')}</button>
                                </div>
                                <div className={styles.optionRow}>
                                    <input
                                        value={inputValue.IMAGE.alt}
                                        placeholder={t('Image alt text')}
                                        onChange={e => updateImageValue('alt', e.target.value)}
                                    />
                                </div>
                                <div className={styles.optionRow}>
                                    <input
                                        type="number"
                                        value={inputValue.IMAGE.width}
                                        placeholder={t('Image width')}
                                        onChange={e => updateImageValue('width', Number(e.target.value) || 40)}
                                    />
                                    <input
                                        type="number"
                                        value={inputValue.IMAGE.height}
                                        placeholder={t('Image height')}
                                        onChange={e => updateImageValue('height', Number(e.target.value) || 40)}
                                    />
                                </div>
                                <label className={styles.formLabel}>
                                    <span>{t('Flip image in RTL')}</span>
                                    <input
                                        type="checkbox"
                                        checked={!!inputValue.IMAGE.flipRTL}
                                        onChange={e => updateImageValue('flipRTL', e.target.checked)}
                                    />
                                </label>
                                {inputValue.IMAGE.dataURI ? (
                                    <img
                                        src={inputValue.IMAGE.dataURI}
                                        alt={inputValue.IMAGE.alt || 'preview'}
                                        style={{
                                            width: `${Math.min(inputValue.IMAGE.width || 40, 120)}px`,
                                            height: `${Math.min(inputValue.IMAGE.height || 40, 120)}px`,
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <span>{t('No icon selected')}</span>
                                )}
                            </div>
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
    
    // 积木配置状态
    const [blockConfig, setBlockConfig] = useState({ ...DefaultBlockConfig });
    const effectiveFilterTargets = Array.isArray(blockConfig.filter) && blockConfig.filter.length > 0
        ? blockConfig.filter
        : ALL_FILTER_TARGETS;

    const [EditBlockIndex, setEditBlockIndex] = useState(0);
    const [isEditingBlock, setEditingBlock] = useState(false);
    const canEditParts = true;

    // 拖拽状态
    const [dragIndex, setDragIndex] = useState(null);
    const [insertIndex, setInsertIndex] = useState(null);
    const [dragPreviewItem, setDragPreviewItem] = useState(null);
    const [dragPreviewPosition, setDragPreviewPosition] = useState({ x: 0, y: 0 });
    const domViewRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const dragPointerYRef = useRef(0);
    const dragPointerOffsetRef = useRef({ x: 0, y: 0 });
    const dragIndexRef = useRef(null);
    const insertIndexRef = useRef(null);

    useEffect(() => {
        dragIndexRef.current = dragIndex;
    }, [dragIndex]);

    useEffect(() => {
        insertIndexRef.current = insertIndex;
    }, [insertIndex]);

    // 从 storage 获取颜色
    const getColors = () => ({
        primary: returnValue("comments").color[0],
        secondary: returnValue("comments").color[1],
        tertiary: returnValue("comments").color[2],
    });

    const svgHTML = renderBlockToHTML(nowSvgBlock);

    const updateSVG = () => {
        // 合并 type 默认配置和用户自定义配置
        const typeDefaultConfig = getConfigForBlockType(blockType);
        const mergedConfig = { ...typeDefaultConfig, ...blockConfig };

        // 扩展级别的 blockIconURI 作为 fallback
        if (!mergedConfig.blockIconURI) {
            const extBlockIconURI = returnValue("comments").blockIconURI;
            if (extBlockIconURI) {
                mergedConfig.blockIconURI = extBlockIconURI;
            }
        }

        const newBlock = {
            type: blockType,
            colors: getColors(),
            parts: prepareBlockForDisplay({ parts: blockPart }).parts,
            blockConfig: mergedConfig
        };
        setSvgBlock(newBlock);
    };

    useEffect(() => {
        updateSVG();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockType, blockPart, blockConfig]);

    useEffect(() => {
        if (props.initialBlock) {
            setBlocktype(props.initialBlock.type || BlockType.STACK);
            setBlockPart(props.initialBlock.parts || []);
            // 加载已有的 blockConfig 或使用默认配置
            if (props.initialBlock.blockConfig) {
                setBlockConfig({ ...DefaultBlockConfig, ...props.initialBlock.blockConfig });
            } else {
                setBlockConfig(getConfigForBlockType(props.initialBlock.type || BlockType.STACK));
            }
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
            Object.entries(returnValue('blocks')).forEach(([name]) => {
                console.log(props.editingIndex)
                if(name === blockName.trim() && props.editingIndex !== name) {
                    alert(t('Block ID already exists!'))
                    return
                }
            })
            const typeDefaultConfig = getConfigForBlockType(blockType);
            const mergedConfig = { ...typeDefaultConfig, ...blockConfig };
            
            props.onSave(blockName.trim(), {
                type: blockType,
                parts: blockPart,
                blockConfig: mergedConfig
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

    const clearAutoScroll = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const getInsertIndexFromPointer = (clientY) => {
        if (!domViewRef.current) return 0;
        const rows = domViewRef.current.querySelectorAll('[data-part-row="true"]');
        for (let i = 0; i < rows.length; i += 1) {
            const rect = rows[i].getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            if (clientY < middleY) return i;
        }
        return rows.length;
    };

    // 自动滚动逻辑
    const autoScroll = (clientY) => {
        if (!domViewRef.current) return;
        const container = domViewRef.current;
        const rect = container.getBoundingClientRect();
        const scrollZone = 50; // 触发滚动的边缘区域大小
        const scrollSpeed = 8; // 滚动速度

        clearAutoScroll();

        // 检查是否在顶部边缘
        if (clientY < rect.top + scrollZone && clientY > rect.top) {
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop -= scrollSpeed;
                setInsertIndex(getInsertIndexFromPointer(dragPointerYRef.current));
            }, 16);
        }
        // 检查是否在底部边缘
        else if (clientY > rect.bottom - scrollZone && clientY < rect.bottom) {
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop += scrollSpeed;
                setInsertIndex(getInsertIndexFromPointer(dragPointerYRef.current));
            }, 16);
        }
    };

    const finishDrag = () => {
        clearAutoScroll();
        document.body.style.userSelect = '';
        const currentDragIndex = dragIndexRef.current;
        const currentInsertIndex = insertIndexRef.current;
        setDragPreviewItem(null);
        if (currentDragIndex === null || currentInsertIndex === null || currentInsertIndex === undefined) {
            setDragIndex(null);
            setInsertIndex(null);
            return;
        }

        setBlockPart((prevParts) => {
            if (currentDragIndex < 0 || currentDragIndex >= prevParts.length) {
                return prevParts;
            }
            const newPart = [...prevParts];
            const [draggedItem] = newPart.splice(currentDragIndex, 1);
            let targetIndex = currentInsertIndex;
            if (currentInsertIndex > currentDragIndex) {
                targetIndex -= 1;
            }
            const safeTargetIndex = Math.max(0, Math.min(targetIndex, newPart.length));
            newPart.splice(safeTargetIndex, 0, draggedItem);
            return newPart;
        });
        setDragIndex(null);
        setInsertIndex(null);
    };

    const handlePartMouseDown = (e, index) => {
        if (e.button !== 0) return;
        if (e.target.closest('button, input, select, textarea, label')) return;
        e.preventDefault();
        const rowRect = e.currentTarget.getBoundingClientRect();
        dragPointerOffsetRef.current = {
            x: e.clientX - rowRect.left,
            y: e.clientY - rowRect.top
        };
        dragPointerYRef.current = e.clientY;
        setDragPreviewPosition({
            x: e.clientX - dragPointerOffsetRef.current.x,
            y: e.clientY - dragPointerOffsetRef.current.y
        });
        setDragPreviewItem(blockPart[index]);
        setDragIndex(index);
        setInsertIndex(index);
    };

    useEffect(() => {
        if (dragIndex === null) return;
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e) => {
            dragPointerYRef.current = e.clientY;
            setDragPreviewPosition({
                x: e.clientX - dragPointerOffsetRef.current.x,
                y: e.clientY - dragPointerOffsetRef.current.y
            });
            setInsertIndex(getInsertIndexFromPointer(e.clientY));
            autoScroll(e.clientY);
        };

        const handleMouseUp = () => {
            finishDrag();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            clearAutoScroll();
            document.body.style.userSelect = '';
            setDragPreviewItem(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragIndex]);

    const handlePartsScroll = () => {
        if (dragIndexRef.current === null) return;
        setInsertIndex(getInsertIndexFromPointer(dragPointerYRef.current));
    };

    const renderDropGap = (gapIndex) => (
        <div
            className={`${styles.dropGap} ${styles.dropGapVisible} ${insertIndex === gapIndex ? styles.dropGapActive : ''}`}
        >
            <div className={styles.dropGapLine} />
        </div>
    );

    const renderPartSummary = (item) => {
        if (typeof item === "object") {
            const summaryValue = Array.isArray(item.value)
                ? `${item.value[0]?.name || ''}...`
                : item.inputType === InputType.IMAGE
                    ? (item.value?.alt || t('Image'))
                    : item.value;
            return (
                <code className={styles.partCode}>
                    {getTypeName(item.inputType)}{item.inputType !== InputType.BOOLEAN && ":"} {summaryValue}
                </code>
            );
        }
        if (item === "_NextBrach_") {
            return <code className={styles.partCode}>{t('New Brach')}</code>;
        }
        return <code className={styles.partCode}>{item}</code>;
    };

    const addBrach = () => {
        setBlockPart(
            [
                ...blockPart,
                NEXT_BRANCH_MARKER
            ]
        )
    }

    const getTypeName = value => {
        switch (value) {
            case "textNumber":
                return t("Text or Number")
            case "text":
                return t("Text")
            case "number":
                return t("Number")
            case "angle":
                return t("Angle")
            case "color":
                return t("Color")
            case "matrix":
                return t("Matrix")
            case "note":
                return t("Note")
            case "dropdown":
                return t("Dropdown")
            case "dropdownReadOnly":
                return t("Read Only Dropdown")
            case "boolean":
                return t("Boolean")
            case "image":
                return t("Image")
            case "costume":
                return t("Costume")
            case "sound":
                return t("Sound")
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
                    <>
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
                                                const newType = e.target.value;
                                                setBlocktype(newType);
                                                // 自动更新配置为该类型的默认配置
                                                setBlockConfig(getConfigForBlockType(newType));
                                            }}
                                        >
                                            <option value={BlockType.STACK}>{t('stack')}</option>
                                            <option value={BlockType.HAT}>{t('hat')}</option>
                                            <option value={BlockType.EVENT}>{t('event')}</option>
                                            <option value={BlockType.ROUND}>{t('repoter')}</option>
                                            <option value={BlockType.BOOLEAN}>{t('boolean')}</option>
                                            <hr />
                                            <option value={BlockType.C_BLOCK}>{t('C block')}</option>
                                        </select>
                                    </div>

                                    {/* 积木配置面板 */}
                                    <div className={styles.configSection}>
                                        <div className={styles.sectionTitle}>{t('Block Config')}</div>
                                        
                                        {/* 连接配置 - 仅对非 reporter 类型显示 */}
                                        {blockType !== BlockType.ROUND && blockType !== BlockType.BOOLEAN && blockType !== BlockType.HAT && blockType !== BlockType.EVENT && (
                                            <div className={styles.formRow}>
                                                <label className={styles.formLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!blockConfig.hasNextConnection}
                                                        onChange={e => setBlockConfig({
                                                            ...blockConfig,
                                                            hasNextConnection: !e.target.checked
                                                        })}
                                                    />
                                                    {t('End Block')}
                                                </label>
                                            </div>
                                        )}
                                        
                                        {/* C型积木配置 */}
                                        {blockType === BlockType.C_BLOCK && (
                                            <div className={styles.formRow}>
                                                <label className={styles.formLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={blockConfig.isLoop}
                                                        onChange={e => setBlockConfig({
                                                            ...blockConfig,
                                                            isLoop: e.target.checked
                                                        })}
                                                    />
                                                    {t('Loop')}
                                                </label>
                                            </div>
                                        )}
                                        <div className={styles.formRow}>
                                            <label className={styles.formLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={blockConfig.isAsync}
                                                    onChange={e => setBlockConfig({
                                                        ...blockConfig,
                                                        isAsync: e.target.checked
                                                    })}
                                                />
                                                {t('Async Block')}
                                            </label>
                                        </div>

                                        <div className={styles.formRow}>
                                            <label className={styles.formLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!blockConfig.blockAllThreads}
                                                    onChange={e => setBlockConfig({
                                                        ...blockConfig,
                                                        blockAllThreads: e.target.checked
                                                    })}
                                                />
                                                {t('Block all threads')}
                                            </label>
                                        </div>

                                        <div className={styles.formRow}>
                                            <label className={styles.formLabel}>{t('Target Filter')}</label>
                                            <div className={styles.optionList}>
                                                <label className={styles.formLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={effectiveFilterTargets.includes('sprite')}
                                                        onChange={e => {
                                                            const next = e.target.checked
                                                                ? Array.from(new Set([...effectiveFilterTargets, 'sprite']))
                                                                : effectiveFilterTargets.filter(target => target !== 'sprite');
                                                            if (next.length === 0) return;
                                                            setBlockConfig({
                                                                ...blockConfig,
                                                                filter: next.length === ALL_FILTER_TARGETS.length ? [] : next
                                                            });
                                                        }}
                                                    />
                                                    {t('Show on Sprite')}
                                                </label>
                                                <label className={styles.formLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={effectiveFilterTargets.includes('stage')}
                                                        onChange={e => {
                                                            const next = e.target.checked
                                                                ? Array.from(new Set([...effectiveFilterTargets, 'stage']))
                                                                : effectiveFilterTargets.filter(target => target !== 'stage');
                                                            if (next.length === 0) return;
                                                            setBlockConfig({
                                                                ...blockConfig,
                                                                filter: next.length === ALL_FILTER_TARGETS.length ? [] : next
                                                            });
                                                        }}
                                                    />
                                                    {t('Show on Stage')}
                                                </label>
                                            </div>
                                        </div>

                                        {/* 积木图标 */}
                                        <div className={styles.formRow}>
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = e => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = event => {
                                                                setBlockConfig({
                                                                    ...blockConfig,
                                                                    blockIconURI: event.target.result
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                style={{ marginRight: '8px' }}
                                            >
                                                {t('Block Icon')}
                                            </button>
                                            {blockConfig.blockIconURI && (
                                                <button
                                                    onClick={() => setBlockConfig({
                                                        ...blockConfig,
                                                        blockIconURI: null
                                                    })}
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    {t('Clear')}
                                                </button>
                                            )}
                                        </div>

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
                                        {blockType === BlockType.C_BLOCK && (
                                            <button onClick={() => {
                                                addBrach()
                                            }}>
                                                {t('Add Brach')}
                                            </button>
                                        )}
                                        <button onClick={() => {
                                            saveBlock()
                                        }}>
                                            {t('Save Block')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.domView} ref={domViewRef} onScroll={handlePartsScroll}>
                                <div className={styles.sectionCard}>
                                    <div className={styles.sectionTitle}>{t('Block Parts')}</div>
                                    {blockPart.length === 0 ? (
                                        <div className={styles.emptyParts}>{t('No parts yet. Add text or input to start building.')}</div>
                                    ) : (
                                        <div className={styles.partsList}>
                                            {renderDropGap(0)}
                                            {blockPart.map((item, index) => (
                                                <Fragment key={`${typeof item}-${index}`}>
                                                    <div
                                                        className={`${styles.partRow} ${dragIndex === index ? styles.dragging : ''}`}
                                                        data-part-row="true"
                                                        onMouseDown={(e) => handlePartMouseDown(e, index)}
                                                    >
                                                        <div className={styles.partIndex}>#{index + 1}</div>
                                                        <div className={styles.partContent}>
                                                            {typeof item === "object" ? (
                                                                <code className={styles.partCode}>
                                                                    {getTypeName(item.inputType)}{item.inputType !== InputType.BOOLEAN && ":"} {Array.isArray(item.value) ? ((item.value[0]?.name || '') + '...') : (item.inputType === InputType.IMAGE ? (item.value?.alt || 'Image') : item.value)}
                                                                </code>
                                                            ) : (
                                                                item === "_NextBrach_" ? (
                                                                    <>
                                                                        <code className={styles.partCode}>
                                                                                {t('New Brach')}
                                                                        </code>
                                                                        {!(blockType === BlockType.C_BLOCK || blockType === BlockType.C_BLOCK_END) && (
                                                                            <Tip
                                                                                    title={t("This Block can't use New Brach.")}
                                                                            />
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={item}
                                                                        onChange={e => {
                                                                            updateTextPart(index, e.target.value)
                                                                        }}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                        <div className={styles.partActions}>
                                                            <button onClick={() => {
                                                                setBlockPart(moveUp(blockPart, index, index))
                                                            }}>{t('move to top')}</button>
                                                            <button onClick={() => {
                                                                removePart(index)
                                                            }}>{t('Remove')}</button>
                                                            {typeof item !== "string" && (
                                                                <button onClick={() => {
                                                                    setEditingBlock(true)
                                                                    setEditBlockIndex(index);
                                                                    setActiveTab("add_input")
                                                                }}>{t('Modify')}</button>
                                                            )}

                                                        </div>
                                                    </div>
                                                    {renderDropGap(index + 1)}
                                                </Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {dragIndex !== null && dragPreviewItem !== null && (
                            <div
                                className={styles.dragPreview}
                                style={{
                                    transform: `translate(${dragPreviewPosition.x}px, ${dragPreviewPosition.y}px)`
                                }}
                            >
                                <div className={`${styles.partRow} ${styles.dragPreviewCard}`}>
                                    <div className={styles.partIndex}>#{dragIndex + 1}</div>
                                    <div className={styles.partContent}>
                                        {renderPartSummary(dragPreviewItem)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )
                }
                {
                    activeTab === 'add_input' && (
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
                    )
                }

            </Modal >
        </div >
    )
}

export default NewBlock;
