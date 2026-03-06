import { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css'
import MonacoEditor from '@monaco-editor/react';
import NewBlock from '../newBlock/newBlock';
import OutputProject from '../outputProject/outputProject.jsx';
import MonacoSettingsModal from './monacoSettingsModal.jsx';
import InputPart from './InputPart';
import { InputType, renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import { getAllValue, setValueTo, returnValue } from '../../extension/storage.js';
import { useTranslation, BLOCK_TYPE_ID } from '../../i18n';
import { VscSettingsGear, VscEdit, VscClose } from "react-icons/vsc";
import {
    VSCODE_DARK_PLUS,
    DEFAULT_MONACO_CONFIG,
    loadMonacoConfig,
    normalizeMonacoConfig,
    applyLanguageServiceSettings,
    MONACO_SETTINGS_KEY
} from './monacoConfig.js';
import { prepareBlockForDisplay, saveProject } from './blockUtils.js';

const FUNCTION_BODY_DIAGNOSTIC_CODES = [1108];

const mergeFunctionBodyDiagnostics = (diagnosticsOptions = {}) => {
    const currentCodes = Array.isArray(diagnosticsOptions.diagnosticCodesToIgnore)
        ? diagnosticsOptions.diagnosticCodesToIgnore
        : [];
    return {
        ...diagnosticsOptions,
        diagnosticCodesToIgnore: Array.from(new Set([...currentCodes, ...FUNCTION_BODY_DIAGNOSTIC_CODES]))
    };
};

const applyBlockLanguageServiceSettings = (monaco, monacoConfig) => {
    applyLanguageServiceSettings(monaco, monacoConfig);
    const diagnosticsOptions = mergeFunctionBodyDiagnostics(
        monacoConfig.languageService?.diagnosticsOptions || {}
    );
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
};

const Editor = () => {
    const { t } = useTranslation();

    // 布局状态
    const [leftWidth, setLeftWidth] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    // Monaco 编辑器状态
    const monacoApiRef = useRef(null);
    const editorRef = useRef(null);  // Monaco editor 实例
    const [isMonacoSettingsOpen, setMonacoSettingsOpen] = useState(false);
    const [monacoConfig, setMonacoConfig] = useState(() => loadMonacoConfig());
    const [isMonacoMounted, setIsMonacoMounted] = useState(false);  // 追踪 Monaco 是否挂载

    // 积木编辑状态
    const [isCreatingBlock, setCreatBlock] = useState(false);
    const [isSaveBlock, setSaveBlock] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [blockVersion, setBlockVersion] = useState(0);
    const [isEditingBlock, setEditingBlock] = useState(null);
    const [editingBlockName, setEditingBlockName] = useState(null);  // 当前编辑的 block 名称
    const [blockCode, setBlockCode] = useState('');  // Monaco 中的代码

    // 输入框高亮状态
    const [highlightedInput, setHighlightedInput] = useState(null);
    const previewRef = useRef(null);

    // 展开状态
    const [isHideIndex, setHideIndex] = useState(null);

    // 保存 Monaco 配置
    useEffect(() => {
        localStorage.setItem(MONACO_SETTINGS_KEY, JSON.stringify(monacoConfig));
    }, [monacoConfig]);

    // 应用 Monaco 语言服务配置
    useEffect(() => {
        if (!monacoApiRef.current) return;
        applyBlockLanguageServiceSettings(monacoApiRef.current, monacoConfig);
    }, [monacoConfig]);

    // 拖拽调整宽度
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return;
            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
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

    // 高亮输入框效果
    useEffect(() => {
        if (!previewRef.current) return;
        const inputs = previewRef.current.querySelectorAll('[data-input-index]');
        inputs.forEach(input => {
            const idx = parseInt(input.getAttribute('data-input-index'));
            if (idx === highlightedInput) {
                input.style.filter = 'brightness(1.3)';
                input.style.stroke = '#ff0';
                input.style.strokeWidth = '5';
            } else {
                input.style.filter = '';
                input.style.stroke = '';
                input.style.strokeWidth = '';
            }
        });
    }, [highlightedInput, isEditingBlock]);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        e.preventDefault();
    };

    const handleMonacoBeforeMount = (monaco) => {
        monaco.editor.defineTheme('vscode-dark-plus', VSCODE_DARK_PLUS);
        applyBlockLanguageServiceSettings(monaco, monacoConfig);
    };

    // 为 Monaco 注入 input 变量定义
    const injectInputDefinitions = (monaco, block) => {
        if (!block || !block.parts) return;

        // 收集所有 input 并生成类型定义
        const inputDefs = [];
        let inputIdx = 0;
        block.parts.forEach(part => {
            if (typeof part === 'object' && part !== null) {
                const inputId = part.id || `input_${inputIdx}`;
                const inputType = part.inputType;

                // 根据类型生成不同的类型定义
                let typeStr = 'any';
                if (inputType === InputType.NUMBER) {
                    typeStr = 'number';
                } else if (inputType === InputType.TEXT || inputType === InputType.TEXT_NUMBER) {
                    typeStr = 'string';
                } else if (inputType === InputType.BOOLEAN) {
                    typeStr = 'boolean';
                } else if (inputType === InputType.DROPDOWN || inputType === InputType.DROPDOWN_READONLY) {
                    typeStr = 'scratchDropdown'
                }
                inputDefs.push(`/**`);
                inputDefs.push(`* Type: ${t(BLOCK_TYPE_ID[part.inputType])}`);
                inputDefs.push(`* `);
                if (inputType !== InputType.BOOLEAN) inputDefs.push(`* Default Value: ${part.value}`);
                inputDefs.push(`*/`);
                inputDefs.push(`declare const ${inputId}: ${typeStr};`);
                inputIdx++;
            }
        });

        // 注入全局变量定义
        if (inputDefs.length > 0) {
            const dts = inputDefs.join('\n');
            console.log(dts)
            monaco.languages.typescript.javascriptDefaults.addExtraLib(dts, 'inputs.d.ts');
        }
    };

    const handleMonacoMount = (editor, monaco) => {
        monacoApiRef.current = monaco;
        editorRef.current = editor;
        applyBlockLanguageServiceSettings(monaco, monacoConfig);
        setIsMonacoMounted(true);  // 标记 Monaco 已挂载
    };

    // 切换 block 时重新注入 input 变量定义
    useEffect(() => {
        if (isEditingBlock && isMonacoMounted && monacoApiRef.current) {
            injectInputDefinitions(monacoApiRef.current, isEditingBlock);
        }
    }, [isEditingBlock, isMonacoMounted]);

    const handleSaveBlock = (blockName, blockData) => {
        const allBlocks = getAllValue().blocks || {};
        setValueTo("blocks", { ...allBlocks, [blockName]: blockData });
        setEditingIndex(null);
    };

    // 开始编辑 block，读取代码到 Monaco
    const handleStartEditBlock = (name, block) => {
        setEditingBlock(block);
        setEditingBlockName(name);
        setBlockCode(block.code || '');  // 读取存储的代码，默认空字符串
    };

    // 保存代码到存储
    const handleSaveCode = () => {
        if (!editingBlockName || !isEditingBlock) return;
        const code = editorRef.current?.getValue() || blockCode;
        const blocks = returnValue("blocks");
        if (blocks[editingBlockName]) {
            blocks[editingBlockName] = {
                ...blocks[editingBlockName],
                code  // 保存代码
            };
            setValueTo("blocks", blocks);
        }
    };

    // Monaco 内容变化时更新状态和存储
    const handleCodeChange = (value) => {
        setBlockCode(value);
        // 自动保存（防抖可以后续添加）
        if (editingBlockName) {
            const blocks = returnValue("blocks");
            if (blocks[editingBlockName]) {
                blocks[editingBlockName] = {
                    ...blocks[editingBlockName],
                    code: value
                };
                setValueTo("blocks", blocks);
            }
        }
    };

    // 返回时保存代码
    const handleBack = () => {
        handleSaveCode();
        setEditingBlock(null);
        setEditingBlockName(null);
        setBlockCode('');
    };

    const handleDeleteBlock = (name) => {
        const sure = window.confirm(t("Are you sure to remove this block?"));
        if (!sure) return;
        const blocks = returnValue("blocks");
        delete blocks[name];
        setValueTo("blocks", blocks);
        setBlockVersion(v => v + 1);
    };

    // 更新 input 的 ID
    const handleUpdateInputId = (inputIndex, newId) => {
        if (!editingBlockName || !isEditingBlock) return;
        
        const blocks = returnValue("blocks");
        const block = blocks[editingBlockName];
        if (!block || !block.parts) return;

        // 找到对应的 input 并更新 id
        let currentIdx = 0;
        const newParts = block.parts.map(part => {
            if (typeof part === 'object' && part !== null) {
                if (currentIdx === inputIndex) {
                    currentIdx++;
                    return { ...part, id: newId };
                }
                currentIdx++;
            }
            return part;
        });

        // 更新存储和状态
        blocks[editingBlockName] = { ...block, parts: newParts };
        setValueTo("blocks", blocks);
        
        // 更新当前编辑状态
        setEditingBlock({ ...isEditingBlock, parts: newParts });
    };

    // 渲染输入框列表
    const renderInputParts = () => {
        let inputIdx = 0;
        return isEditingBlock.parts.map((part) => {
            if (typeof part !== 'object') return null;
            const currentInputIdx = inputIdx++;
            return (
                <InputPart
                    key={currentInputIdx}
                    part={part}
                    index={currentInputIdx}
                    onHighlight={() => setHighlightedInput(currentInputIdx)}
                    onClearHighlight={() => setHighlightedInput(null)}
                    isHideIndex={isHideIndex}
                    setHide={setHideIndex}
                    onUpdateId={handleUpdateInputId}
                />
            );
        });
    };

    return (
        <div className={styles.editor} ref={containerRef}>
            {/* 模态框 */}
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
                <OutputProject close={() => setSaveBlock(false)} />
            )}
            {isMonacoSettingsOpen && (
                <MonacoSettingsModal
                    close={() => setMonacoSettingsOpen(false)}
                    config={monacoConfig}
                    defaultConfig={DEFAULT_MONACO_CONFIG}
                    onApply={(nextConfig) => setMonacoConfig(normalizeMonacoConfig(nextConfig))}
                />
            )}

            {/* 积木区 */}
            <div className={styles.blocks} style={isEditingBlock ? { width: `${leftWidth}%` } : { width: `100%` }}>
                {isEditingBlock === null ? (
                    <>
                        {/* 工具栏 */}
                        <div className={styles.Tabs}>
                            <button className={styles.Button} onClick={() => {
                                setEditingIndex(null);
                                setCreatBlock(true);
                            }}>{t('Create new Block')}</button>
                            <button className={styles.Button} onClick={() => setSaveBlock(true)}>{t('Output')}</button>
                            <button className={styles.Button} onClick={saveProject}>{t('Save')}</button>
                            <button className={styles.Button} onClick={() => setMonacoSettingsOpen(true)}>
                                <span>{t('Editor Settings')}</span>
                            </button>
                        </div>

                        {/* 积木列表 */}
                        <div className={styles.TitleOfMain}>
                            <h1>{t('Blocks')}</h1>
                            <h3>{t('Flyout')}:</h3>
                        </div>
                        <div>
                            {Object.entries(getAllValue().blocks || {}).map(([name, blk]) => (
                                <div key={name} className={styles.blockPreview} style={{ marginBottom: '24px', cursor: 'pointer' }}>
                                    <div style={{ fontSize: '22px', color: '#666' }}>opcode: "{name}"</div>
                                    <div className={styles.Block}>
                                        <div>
                                            <div className={styles.Settings} onClick={() => handleDeleteBlock(name)} title={t("Remove")}>
                                                <VscClose />
                                            </div>
                                            <div className={styles.Settings} onClick={() => handleStartEditBlock(name, blk)} title={t("Write program")}>
                                                <VscEdit />
                                            </div>
                                            <div className={styles.Settings} onClick={() => {
                                                setEditingIndex(name);
                                                setCreatBlock(true);
                                            }} title={t("Edit Block")}>
                                                <VscSettingsGear />
                                            </div>
                                        </div>
                                        <div className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(blk)) }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* 编辑积木视图 */
                    <div className={styles.editBlock}>
                        <h1>{t('Code')}</h1>
                        <div ref={previewRef} className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(isEditingBlock)) }} />
                        <span className={styles.FonudTip}>
                            {t("Type: ") + t(isEditingBlock.type)}
                        </span>
                        <span className={styles.FonudTip}>
                            {t('Found ') + isEditingBlock.parts.filter(item => typeof item === 'object' && item !== null).length.toString() + t(" Input(s).")}
                        </span>
                        <div className={styles.sectionCard}>
                            {renderInputParts()}
                        </div>
                        <button onClick={handleBack}>{t('Back')}</button>
                    </div>
                )}
            </div>

            {/* 代码编辑区 */}
            {isEditingBlock && (
                <>
                    <div className={styles.resizer} onMouseDown={handleMouseDown} />
                    <div className={styles.code} style={{ width: `${100 - leftWidth}%` }}>
                        <div className={styles.editorHost}>
                            <MonacoEditor
                                height="100%"
                                defaultLanguage="javascript"
                                theme={monacoConfig.theme || 'vscode-dark-plus'}
                                value={blockCode}
                                onChange={handleCodeChange}
                                beforeMount={handleMonacoBeforeMount}
                                onMount={handleMonacoMount}
                                loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                                options={monacoConfig.options}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Editor;
