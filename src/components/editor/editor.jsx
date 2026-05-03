import { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css'
import MonacoEditor from '@monaco-editor/react';
import NewBlock from '../newBlock/newBlock';
import NewProject from '../newProject/newProject';
import OutputProject from '../outputProject/outputProject.jsx';
import Modal from '../modal/modal';
import MonacoSettingsModal from './monacoSettingsModal.jsx';
import InputPart from './InputPart';
import { BlockType, renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import {
    getAllValue,
    getHistoryState,
    redo,
    returnValue,
    setValueTo,
    undo
} from '../../extension/storage.js';
import { useTranslation, BLOCK_TYPE_ID } from '../../i18n';
import { VscSettingsGear, VscEdit, VscClose, VscAdd, VscFileCode, VscGitFetch, VscArchive, VscJson, VscRefresh, VscArrowLeft, VscArrowRight, VscGrabber, VscColorMode } from "react-icons/vsc";
import { MdOutlineTranslate } from "react-icons/md";
import { Block } from './publicJS.jsx';

import Tip from '../tip/tip.jsx';

import TranslateTab from '../translate/translate.jsx'
import PublicJSeditor from './publicJS.jsx';

import { IoIosTimer } from "react-icons/io";
import { MdLoop } from "react-icons/md";
import { AiOutlineStop } from "react-icons/ai";



import {
    DEFAULT_MONACO_CONFIG,
    loadMonacoConfig,
    normalizeMonacoConfig,
    MONACO_SETTINGS_KEY
} from './monacoConfig.js';
import {
    FUNCTION_BODY_DIAGNOSTIC_CODES,
    ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES,
    applyEditorDiagnostics,
    buildSharedMonacoLibs,
    defineEditorTheme,
    disposeExtraLibs,
    syncExtraLibs,
    updateIdentifierDecorations
} from './monacoHelpers.js';
import { prepareBlockForDisplay, saveProject, loadProject } from './blockUtils.js';
import hotReloadService from '../../extension/HotReloadService.js';
import { useTheme } from '../../lib/theme.js';
import { toast } from '../toast/toast.jsx';

const Editor = props => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

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
    const [isProjectInfoOpen, setProjectInfoOpen] = useState(false);
    const [isOpenPublicJSeditor, setOpenPublicJSeditor] = useState(false);
    const [isOpenTranslate, setOpenTranslate] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isHotReloading, setHotReloading] = useState(false);  // 热重载状态
    // eslint-disable-next-line no-unused-vars
    const [_blockVersion, setBlockVersion] = useState(0);
    const [isEditingBlock, setEditingBlock] = useState(null);
    const [editingBlockName, setEditingBlockName] = useState(null);  // 当前编辑的 block 名称
    const [blockCode, setBlockCode] = useState('');  // Monaco 中的代码
    const [historyState, setHistoryState] = useState(() => getHistoryState());
    const [draggingBlockName, setDraggingBlockName] = useState(null);
    const [dragOverBlockName, setDragOverBlockName] = useState(null);

    // 输入框高亮状态
    const [highlightedInput, setHighlightedInput] = useState(null);
    const previewRef = useRef(null);

    // Input ID 列表用于语法高亮
    const inputIdsRef = useRef([]);
    const decorationsRef = useRef([]);
    const extraLibRegistryRef = useRef([]);

    // 展开状态
    const [isHideIndex, setHideIndex] = useState(null);

    // 保存 Monaco 配置
    useEffect(() => {
        localStorage.setItem(MONACO_SETTINGS_KEY, JSON.stringify(monacoConfig));
    }, [monacoConfig]);

    // 应用 Monaco 语言服务配置
    useEffect(() => {
        if (!monacoApiRef.current) return;
        const ignoredCodes = [
            ...FUNCTION_BODY_DIAGNOSTIC_CODES,
            ...(isEditingBlock?.blockConfig?.isAsync ? ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES : [])
        ];
        applyEditorDiagnostics(monacoApiRef.current, monacoConfig, { ignoredCodes });
    }, [monacoConfig, isEditingBlock?.blockConfig?.isAsync]);

    const syncEditorStateFromStorage = () => {
        setHistoryState(getHistoryState());
        setBlockVersion(v => v + 1);

        if (!editingBlockName) return;

        const currentBlock = returnValue('blocks')?.[editingBlockName];
        if (currentBlock) {
            setEditingBlock(currentBlock);
            setBlockCode(currentBlock.code || '');
        } else {
            setEditingBlock(null);
            setEditingBlockName(null);
            setBlockCode('');
        }
    };

    useEffect(() => {
        const handleHistoryChange = () => {
            syncEditorStateFromStorage();
        };
        window.addEventListener('astra-storage-history-change', handleHistoryChange);
        return () => window.removeEventListener('astra-storage-history-change', handleHistoryChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingBlockName]);


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

    const getBlockTypeLabel = (inputType) => t(BLOCK_TYPE_ID[inputType] || inputType);

    const handleMonacoBeforeMount = (monaco) => {
        defineEditorTheme(monaco);
        applyEditorDiagnostics(monaco, monacoConfig, {
            ignoredCodes: FUNCTION_BODY_DIAGNOSTIC_CODES
        });
    };

    // 更新装饰器（内容变化时）
    const updateDecorations = () => {
        if (monacoApiRef.current && editorRef.current && inputIdsRef.current.length > 0) {
            updateIdentifierDecorations({
                monaco: monacoApiRef.current,
                editor: editorRef.current,
                decorationsRef,
                identifiers: inputIdsRef.current,
                hoverLabel: 'Scratch Input'
            });
        }
    };

    const handleMonacoMount = (editor, monaco) => {
        monacoApiRef.current = monaco;
        editorRef.current = editor;
        const ignoredCodes = [
            ...FUNCTION_BODY_DIAGNOSTIC_CODES,
            ...(isEditingBlock?.blockConfig?.isAsync ? ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES : [])
        ];
        applyEditorDiagnostics(monaco, monacoConfig, { ignoredCodes });
        // 应用主题（确保自定义主题生效）
        monaco.editor.setTheme(monacoConfig.theme || 'vscode-dark-plus');
        setIsMonacoMounted(true);  // 标记 Monaco 已挂载
    };

    const handleReadonlyMonacoBeforeMount = (monaco, block) => {
        defineEditorTheme(monaco);
        applyEditorDiagnostics(monaco, monacoConfig, {
            ignoredCodes: [
                ...FUNCTION_BODY_DIAGNOSTIC_CODES,
                ...(block?.blockConfig?.isAsync ? ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES : [])
            ],
            baseDiagnosticsOptions: {
                noSemanticValidation: true,
                noSuggestionDiagnostics: true
            }
        });
    };

    useEffect(() => {
        if (!isMonacoMounted || !monacoApiRef.current || !isEditingBlock) return;

        const blocks = returnValue('blocks') || {};
        const extensionId = returnValue('comments')?.id || 'extension';
        const inputIds = [];
        let inputIdx = 0;

        (isEditingBlock.parts || []).forEach(part => {
            if (typeof part === 'object' && part !== null) {
                inputIds.push(part.id || `input_${inputIdx}`);
                inputIdx += 1;
            }
        });

        const opcodeIds = Object.keys(blocks).map(name => `${extensionId}_${name}`);
        inputIdsRef.current = [...inputIds, ...opcodeIds];

        syncExtraLibs(
            monacoApiRef.current,
            extraLibRegistryRef,
            buildSharedMonacoLibs({
                block: isEditingBlock,
                blocks,
                extensionId,
                translateType: getBlockTypeLabel,
                includeBlockInputs: true,
                publicJS: returnValue('publicJS') || ''
            })
        );

        const ignoredCodes = [
            ...FUNCTION_BODY_DIAGNOSTIC_CODES,
            ...(isEditingBlock.blockConfig?.isAsync ? ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES : [])
        ];
        applyEditorDiagnostics(monacoApiRef.current, monacoConfig, { ignoredCodes });
        updateDecorations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMonacoMounted, isEditingBlock, monacoConfig]);

    useEffect(() => () => {
        disposeExtraLibs(extraLibRegistryRef);
    }, []);

    // 当 blockCode 变化时更新高亮（处理初始加载的情况）
    useEffect(() => {
        setTimeout(() => {
            if (isMonacoMounted && editorRef.current && inputIdsRef.current.length > 0) {
                // 使用 requestAnimationFrame 确保 Monaco 已完成渲染
                requestAnimationFrame(() => {
                    updateDecorations();
                });
            }
        }, [100])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockCode, isMonacoMounted]);

    const handleSaveBlock = (blockName, blockData) => {
        const allBlocks = getAllValue().blocks || {};
        // 编辑模式下保留原有积木的 code 字段
        const existingBlock = allBlocks[blockName] || {};
        const savedBlock = editingIndex !== null
            ? { ...existingBlock, ...blockData }
            : blockData;
        setValueTo("blocks", { ...allBlocks, [blockName]: savedBlock });
        setEditingIndex(null);
    };

    // 热重载处理
    const handleHotReload = async () => {
        if (isHotReloading) return;

        setHotReloading(true);
        try {
            const result = await hotReloadService.hotReload();
            if (result.success) {
                toast.error(t('Extension hot reload successful!'));
            } else {
                toast.error(t('Hot reload failed: ') + (result.error || t('Unknown error')));
            }
        } catch (error) {
            toast.error(t('Hot reload failed: ') + error.message);
        } finally {
            setHotReloading(false);
        }
    };

    const handleUndoProject = () => {
        undo();
    };

    const handleRedoProject = () => {
        redo();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeElement = document.activeElement;
            if (activeElement?.closest?.('.monaco-editor')) {
                return;
            }

            const modifierPressed = e.ctrlKey || e.metaKey;
            if (!modifierPressed) return;

            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
        const nextValue = value ?? '';
        setBlockCode(nextValue);
        // 更新装饰器高亮
        updateDecorations();
        // 自动保存（防抖可以后续添加）
        if (editingBlockName) {
            const blocks = returnValue("blocks");
            if (blocks[editingBlockName]) {
                blocks[editingBlockName] = {
                    ...blocks[editingBlockName],
                    code: nextValue
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

    // 在光标位置插入文本
    const handleInsertAtCursor = (text) => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const position = editor.getPosition();  // 获取当前光标位置

        // 使用 executeEdits 在光标位置插入文本
        editor.executeEdits('insert-input', [{
            range: new monacoApiRef.current.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
            ),
            text: text,
            forceMoveMarkers: true
        }]);

        // 让编辑器获得焦点
        editor.focus();
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
                    onInsert={handleInsertAtCursor}
                />
            );
        });
    };

    // 返回这个积木是否可以使用编辑器
    const canUseEditor = (blk) => {
        if (!blk) return false;

        if (blk["type"] === BlockType.EVENT) {
            return false
        }
        return true
    }

    const [expandBlockIndex, setExpandBlockIndex] = useState(-1);
    const [blockTab, setBlockTab] = useState(1);
    // 切换展开状态
    const handleToggleExpand = (index) => {
        setExpandBlockIndex(prev => prev === index ? -1 : index);
    };

    const handleBlockDragStart = (e, name) => {
        setDraggingBlockName(name);
        setDragOverBlockName(name);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', name);
    };

    const handleBlockDragOver = (e, name) => {
        e.preventDefault();
        if (dragOverBlockName !== name) {
            setDragOverBlockName(name);
        }
    };

    const handleBlockDrop = (e, targetName) => {
        e.preventDefault();
        const sourceName = draggingBlockName || e.dataTransfer.getData('text/plain');
        setDraggingBlockName(null);
        setDragOverBlockName(null);
        if (!sourceName || sourceName === targetName) return;

        const entries = Object.entries(returnValue('blocks') || {});
        const fromIndex = entries.findIndex(([name]) => name === sourceName);
        const toIndex = entries.findIndex(([name]) => name === targetName);
        if (fromIndex < 0 || toIndex < 0) return;

        const nextEntries = [...entries];
        const [movedEntry] = nextEntries.splice(fromIndex, 1);
        nextEntries.splice(toIndex, 0, movedEntry);
        setValueTo('blocks', Object.fromEntries(nextEntries));
    };

    const handleBlockDragEnd = () => {
        setDraggingBlockName(null);
        setDragOverBlockName(null);
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
                    editingIndex={editingIndex}
                />
            )}
            {isSaveBlock && (
                <OutputProject close={() => setSaveBlock(false)} />
            )}
            {isProjectInfoOpen && (
                <Modal
                    title={t('Edit extension info')}
                    width="min(1080px, 94vw)"
                    height="min(760px, 90vh)"
                    close={() => setProjectInfoOpen(false)}
                >
                    <NewProject
                        variant="modal"
                        initialData={returnValue('comments')}
                        initializeStorage={false}
                        formTitle={t('Edit extension info')}
                        submitLabel={t('Save')}
                        showPreviewHeading={false}
                        close={() => setProjectInfoOpen(false)}
                        Done={() => setProjectInfoOpen(false)}
                    />
                </Modal>
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
            <div className={styles.blocks} style={isEditingBlock && canUseEditor(isEditingBlock) ? { width: `${leftWidth}%` } : { width: `100%` }}>
                {isEditingBlock === null && !isOpenPublicJSeditor && !isOpenTranslate ? (
                    <>
                        {/* 工具栏 */}
                        <div className={styles.Tabs}>
                            <button
                                className={styles.projectInfoButton}
                                onClick={() => setProjectInfoOpen(true)}
                                title={t('Edit extension info')}
                                aria-label={t('Edit extension info')}
                            >
                                <div className={styles.topBarTitle}>
                                    <span className={styles.projectName}>{returnValue('comments')?.name || 'Astra Blocktory'}</span>
                                    <span className={styles.projectId}>{returnValue('comments')?.id || 'extension'}</span>
                                </div>
                                <VscEdit className={styles.projectInfoIcon} />
                            </button>
                            <div className={styles.toolbarGroups}>
                                <div className={styles.toolGroup}>
                                    <button
                                        className={styles.Button}
                                        onClick={handleUndoProject}
                                        disabled={!historyState.canUndo}
                                        title={`${t('Undo')} Ctrl+Z`}
                                    >
                                        <VscArrowLeft /><span>{t('Undo')}</span>
                                    </button>
                                    <button
                                        className={styles.Button}
                                        onClick={handleRedoProject}
                                        disabled={!historyState.canRedo}
                                        title={`${t('Redo')} Ctrl+Y`}
                                    >
                                        <VscArrowRight /><span>{t('Redo')}</span>
                                    </button>
                                </div>
                                <div className={styles.toolGroup}>
                                    <button className={styles.Button} onClick={() => {
                                        setEditingIndex(null);
                                        setCreatBlock(true);
                                    }}><VscAdd /><span>{t('Create new Block')}</span></button>
                                    <button className={styles.Button} onClick={() => setSaveBlock(true)}><VscFileCode /><span>{t('Output')}</span></button>
                                    <button className={styles.Button} onClick={saveProject}><VscGitFetch /><span>{t('Save')}</span></button>
                                    <button className={styles.Button} onClick={() => document.getElementById('file-input').click()}><VscArchive /><span>{t('Load')}</span></button>
                                    <button className={styles.Button} onClick={() => setOpenPublicJSeditor(true)}>
                                        <VscJson /><span>{t('Public JS')}</span>
                                    </button>
                                </div>
                                <div className={styles.toolGroup}>
                                    <input id="file-input" type="file" accept=".ab,.json" style={{ display: 'none' }} onChange={(e) => loadProject(e, () => { props.loaded() })} />
                                    <button className={styles.Button} onClick={() => setMonacoSettingsOpen(true)}>
                                        <VscSettingsGear /><span>{t('Editor Settings')}</span>
                                    </button>
                                    <button className={styles.Button} onClick={() => setOpenTranslate(true)}>
                                        <MdOutlineTranslate /><span>{t('Translate')}</span>
                                    </button>
                                    <button
                                        className={styles.Button}
                                        onClick={() => {
                                            const nextTheme = toggleTheme();
                                            setMonacoConfig(prev => ({
                                                ...prev,
                                                theme: nextTheme === 'light' ? 'vs' : 'vscode-dark-plus'
                                            }));
                                        }}
                                        title={t(theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
                                    >
                                        <VscColorMode />
                                        <span>{t(theme === 'dark' ? 'Dark Mode' : 'Light Mode')}</span>
                                    </button>
                                    <button
                                        className={styles.Button}
                                        onClick={handleHotReload}
                                        disabled={isHotReloading}
                                        title={t('Hot reload extension to Scratch editor')}
                                    >
                                        <VscRefresh /><span>{isHotReloading ? t('Reloading...') : t('Hot Reload')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 积木列表 */}
                        <div className={styles.TitleOfMain}>
                            <h1>{t('Blocks')}</h1>
                            <h3>{t('Flyout')}:</h3>
                        </div>
                        <div>
                            {Object.entries(getAllValue().blocks || {}).map(([name, blk]) => {
                                if (blk === "---") {
                                    return (
                                        <div
                                            key={name}
                                            className={`${styles.blockDivider} ${draggingBlockName === name ? styles.blockDragging : ''} ${dragOverBlockName === name && draggingBlockName !== name ? styles.blockDragOver : ''}`}
                                            draggable
                                            onDragStart={e => handleBlockDragStart(e, name)}
                                            onDragOver={e => handleBlockDragOver(e, name)}
                                            onDrop={e => handleBlockDrop(e, name)}
                                            onDragEnd={handleBlockDragEnd}
                                        >
                                            <span className={styles.blockDividerLabel}>{t('Divider')}</span>
                                            <button
                                                className={styles.blockDividerRemove}
                                                onClick={() => handleDeleteBlock(name)}
                                                title={t('Remove')}
                                            ><VscClose /></button>
                                        </div>
                                    );
                                }
                                if (blk && blk.type === BlockType.LABEL) {
                                    return (
                                        <div
                                            key={name}
                                            className={`${styles.labelPreview} ${draggingBlockName === name ? styles.blockDragging : ''} ${dragOverBlockName === name && draggingBlockName !== name ? styles.blockDragOver : ''}`}
                                            draggable
                                            onDragStart={e => handleBlockDragStart(e, name)}
                                            onDragOver={e => handleBlockDragOver(e, name)}
                                            onDrop={e => handleBlockDrop(e, name)}
                                            onDragEnd={handleBlockDragEnd}
                                        >
                                            <div className={styles.labelContent}>
                                                <span className={styles.labelText}>{blk.text || name}</span>
                                            </div>
                                            <div className={styles.labelActions}>
                                                <button onClick={() => handleDeleteBlock(name)} title={t('Remove')}><VscClose /></button>
                                                <button onClick={() => { setEditingIndex(name); setCreatBlock(true); }} title={t('Edit Block')}><VscSettingsGear /></button>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                <div
                                    key={name}
                                    className={`${styles.blockPreview} ${draggingBlockName === name ? styles.blockDragging : ''} ${dragOverBlockName === name && draggingBlockName !== name ? styles.blockDragOver : ''}`}
                                    style={{ marginBottom: '24px' }}
                                    draggable
                                    onDragStart={e => handleBlockDragStart(e, name)}
                                    onDragOver={e => handleBlockDragOver(e, name)}
                                    onDrop={e => handleBlockDrop(e, name)}
                                    onDragEnd={handleBlockDragEnd}
                                >
                                    <div style={{ fontSize: '22px', color: '#666' }}>opcode: "{name}"</div>
                                    <div className={styles.Block}>
                                        <div>
                                            <div className={styles.dragHandle} title={t('Drag to sort')}>
                                                <VscGrabber />
                                            </div>
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
                                        <div className={styles.blockConfig}>
                                            {(blk.blockConfig.isAsync || false) && <IoIosTimer title={t('Async Block')} />}
                                            {blk.blockConfig.isLoop || false && <MdLoop title={t('Loop Block')} />}
                                            {!blk.blockConfig.hasNextConnection || false && <AiOutlineStop title={t('Stop Block')} />}
                                        </div>
                                        <div className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(blk)) }} />
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </>
                ) : isOpenPublicJSeditor ? (
                    <>
                        <PublicJSeditor
                            back={() => setOpenPublicJSeditor(false)}
                        />
                    </>
                ) : isOpenTranslate ? (
                    <TranslateTab
                        close={() => setOpenTranslate(false)}
                    />
                ) : (
                    /* 编辑积木视图 */
                    <div className={styles.editBlock}>
                        <h1>{t('Code')}</h1>
                        <div className={styles.selectTab}>
                            <button className={styles.selectTabButton} onClick={() => { setBlockTab(1) }}>{t('Block')}</button>
                            <button className={styles.selectTabButton} onClick={() => { setBlockTab(2) }}>{t('Public')}</button>
                        </div>
                        {blockTab === 1 && <><div ref={previewRef} className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(isEditingBlock)) }} />
                            <span className={styles.FonudTip}>
                                {t("Type: ") + t(isEditingBlock.type)}
                            </span>
                            {isEditingBlock.type === BlockType.EVENT && (
                                <Tip
                                    title={t("Event block use different grammar.")}
                                >
                                    <a href='https://docs.turbowarp.org/development/extensions/hats'>See https://docs.turbowarp.org/development/extensions/hats</a>
                                </Tip>
                            )}
                            <span className={styles.FonudTip}>
                                {t('Found ') + isEditingBlock.parts.filter(item => typeof item === 'object' && item !== null).length.toString() + t(" Input(s).")}
                            </span>
                            <div className={styles.sectionCard}>
                                {renderInputParts()}
                            </div></>}
                        {blockTab === 2 && <>
                            {Object.keys(getAllValue().blocks).length === 0 ? (<>
                                <span className={styles.Nothing}>{t('Empty flyout')}</span>
                            </>) : Object.entries(getAllValue().blocks || {}).map(([name, blk], index) => (
                                <Block
                                    key={name}
                                    name={name}
                                    blk={blk}
                                    index={index}
                                    expand={index === expandBlockIndex}
                                    setExpand={() => handleToggleExpand(index)}
                                    insert={handleInsertAtCursor}
                                    renderEditor={(value) => (
                                        <MonacoEditor
                                            height="300px"
                                            defaultLanguage="javascript"
                                            path={`file:///readonly-blocks/${name}.js`}
                                            theme={monacoConfig.theme || 'vscode-dark-plus'}
                                            beforeMount={(monaco) => handleReadonlyMonacoBeforeMount(monaco, blk)}
                                            loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                                            options={{ ...monacoConfig.options, readOnly: true, minimap: { enabled: false }, fixedOverflowWidgets: true }}
                                            value={value}
                                        />
                                    )}
                                />
                            ))}
                        </>}

                        <div className={styles.DoneButtonDiv}><button className={styles.DoneButton} onClick={handleBack}>{t('Done')}</button></div>

                    </div>
                )}
            </div>

            {/* 代码编辑区 */}
            {isEditingBlock && canUseEditor(isEditingBlock) && (
                <>
                    <div className={styles.resizer} onMouseDown={handleMouseDown} />
                    <div className={styles.code} style={{ width: `${100 - leftWidth}%` }}>
                        <div className={styles.editorHost}>
                            <MonacoEditor
                                height="100%"
                                defaultLanguage="javascript"
                                path={`file:///active-block/${editingBlockName || 'block'}.js`}
                                theme={monacoConfig.theme || 'vscode-dark-plus'}
                                value={blockCode}
                                onChange={handleCodeChange}
                                beforeMount={handleMonacoBeforeMount}
                                onMount={handleMonacoMount}
                                loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                                options={{ ...monacoConfig.options, fixedOverflowWidgets: true }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Editor;
