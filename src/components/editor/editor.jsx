import { useState, useRef, useEffect } from 'react';
import styles from './editor.module.css'
import MonacoEditor from '@monaco-editor/react';
import NewBlock from '../newBlock/newBlock';
import OutputProject from '../outputProject/outputProject.jsx';
import MonacoSettingsModal from './monacoSettingsModal.jsx';
import { renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import { getAllValue, setValueTo, returnValue } from '../../extension/storage.js';
import { useTranslation } from '../../i18n';
import { VscSettingsGear } from "react-icons/vsc";
import { SiTiddlywiki } from 'react-icons/si';

const VSCODE_DARK_PLUS = {
    base: 'vs-dark',
    inherit: true,
    semanticHighlighting: true,
    rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'function', foreground: 'DCDCAA' }
    ],
    colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorCursor.foreground': '#AEAFAD',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editor.wordHighlightBackground': '#575757B8',
        'editor.wordHighlightStrongBackground': '#004972B8'
    }
};

const MONACO_SETTINGS_KEY = 'monaco_editor_settings';

const DEFAULT_MONACO_CONFIG = {
    theme: 'vscode-dark-plus',
    options: {
        minimap: { enabled: true },
        fontSize: 14,
        lineHeight: 22,
        scrollBeyondLastLine: false,
        mouseWheelZoom: true,
        automaticLayout: true,
        semanticHighlighting: { enabled: true },
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        wordWrap: 'off',
        renderWhitespace: 'selection',
        smoothScrolling: false,
        tabSize: 4,
        insertSpaces: true,
        formatOnType: false,
        formatOnPaste: false,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        // 增加中文字体回退，避免中文字符显示为方块
        fontFamily: "'Cascadia Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', monospace",
        cursorSmoothCaretAnimation: "on"
    },
    languageService: {
        compilerOptions: {
            target: 'ESNext',
            allowNonTsExtensions: true,
            allowJs: true,
            checkJs: true,
            strict: false
        },
        diagnosticsOptions: {
            noSemanticValidation: false,
            noSyntaxValidation: false
        }
    }
};

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = (base, override) => {
    if (!isPlainObject(base) || !isPlainObject(override)) return override;

    const output = { ...base };
    Object.keys(override).forEach((key) => {
        if (isPlainObject(base[key]) && isPlainObject(override[key])) {
            output[key] = deepMerge(base[key], override[key]);
        } else {
            output[key] = override[key];
        }
    });
    return output;
};

const normalizeMonacoConfig = (config) => {
    if (!isPlainObject(config)) return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
    return deepMerge(DEFAULT_MONACO_CONFIG, config);
};

const cloneMonacoConfig = (config) => JSON.parse(JSON.stringify(config));

const loadMonacoConfig = () => {
    try {
        const raw = localStorage.getItem(MONACO_SETTINGS_KEY);
        if (!raw) return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
        return normalizeMonacoConfig(JSON.parse(raw));
    } catch {
        return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
    }
};

const applyLanguageServiceSettings = (monaco, monacoConfig) => {
    const compilerOptions = {
        ...(monacoConfig.languageService?.compilerOptions || {})
    };
    if (typeof compilerOptions.target === 'string') {
        const targetValue = monaco.languages.typescript.ScriptTarget[compilerOptions.target];
        if (typeof targetValue === 'number') {
            compilerOptions.target = targetValue;
        }
    }
    const diagnosticsOptions = monacoConfig.languageService?.diagnosticsOptions || {};

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
};


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

const saveProject = () => {
    const project = getAllValue();
    const download = document.createElement('a'); //创建下载
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    download.href = URL.createObjectURL(blob);
    download.download = (project[0 /* Comments */]?.name || "project") + ".ab";
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
    URL.revokeObjectURL(download.href);

}
const Editor = props => {
    const { t } = useTranslation();
    const [leftWidth, setLeftWidth] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef(null);
    const monacoApiRef = useRef(null);
    const [isMonacoSettingsOpen, setMonacoSettingsOpen] = useState(false);
    const [monacoConfig, setMonacoConfig] = useState(() => loadMonacoConfig());
    const monacoOptions = monacoConfig.options;

    useEffect(() => {
        localStorage.setItem(MONACO_SETTINGS_KEY, JSON.stringify(monacoConfig));
    }, [monacoConfig]);

    useEffect(() => {
        if (!monacoApiRef.current) return;
        applyLanguageServiceSettings(monacoApiRef.current, monacoConfig);
    }, [monacoConfig]);

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

    const handleMonacoBeforeMount = (monaco) => {
        monaco.editor.defineTheme('vscode-dark-plus', VSCODE_DARK_PLUS);
        applyLanguageServiceSettings(monaco, monacoConfig);
    };

    const handleMonacoMount = (editor, monaco) => {
        monacoApiRef.current = monaco;
        applyLanguageServiceSettings(monaco, monacoConfig);
    };


    const [isCreatingBlock, setCreatBlock] = useState(false)
    const [isSaveBlock, setSaveBlock] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null);

    const [isEditingBlock, setEditingBlock] = useState(null); //保存Block对象

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
            {isMonacoSettingsOpen && (
                <MonacoSettingsModal
                    close={() => {
                        setMonacoSettingsOpen(false);
                    }}
                    config={monacoConfig}
                    defaultConfig={DEFAULT_MONACO_CONFIG}
                    onApply={(nextConfig) => {
                        setMonacoConfig(normalizeMonacoConfig(nextConfig));
                    }}
                />
            )}
            <div className={styles.blocks} style={isEditingBlock ? { width: `${leftWidth}%` } : { width: `100%` }}>
                {/* 积木区 */}
                {isEditingBlock === null ? (<>
                    <div className={styles.Tabs}>
                        <button className={styles.Button} onClick={() => {
                            setEditingIndex(null);
                            setCreatBlock(true)
                        }}>{t('Create new Block')}</button>
                        <button className={styles.Button} onClick={() => {
                            setSaveBlock(true)
                        }}>{t('Output')}</button>
                        <button className={styles.Button} onClick={() => {
                            saveProject()
                        }}>{t('Save')}</button>
                    </div>
                    <h1>{t('Blocks')}</h1>
                    <div>

                        <h3>{t('Flyout')}:</h3>
                        {Object.entries(getAllValue().blocks || {}).map(([name, blk]) => (
                            <div
                                key={name}
                                className={styles.blockPreview}
                                style={{ marginBottom: '24px', cursor: 'pointer' }}
                            >
                                <div style={{ fontSize: '22px', color: '#666' }}>opcode: "{name}"</div>
                                <div className={styles.Block}>
                                    <div onClick={() => {
                                        setEditingBlock(blk)
                                    }} className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(blk)) }} />
                                    <div className={styles.Settings} onClick={() => {
                                        setEditingIndex(name);
                                        setCreatBlock(true);
                                    }} ><VscSettingsGear /></div>
                                </div>
                            </div>

                        ))}


                    </div>
                </>
                ) : (
                    <div className={styles.editBlock}>
                        <h1>{t('Edit Block')}</h1>
                        <div className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(isEditingBlock)) }} />
                        <span className={styles.FonudTip}>{
                            t("Type: ") +
                            t(isEditingBlock.type) //给出类型
                        }</span>
                        <span className={styles.FonudTip}>{t('Found ') + isEditingBlock.parts.filter(item => typeof item === 'object' && item !== null).length.toString() + t(" Input(s).")}</span>
                        <div className={styles.sectionCard}>
                            {
                                isEditingBlock.parts.map((part, index) => (
                                    <div className={styles.part}>
                                        {t(part.inputType)}
                                    </div>
                                ))
                            }
                        </div>
                        <button onClick={() => {
                            setEditingBlock(null);
                        }} >{t('Back')}</button>
                    </div>
                )}
            </div>
            {isEditingBlock && (<>
                <div
                    className={styles.resizer}
                    onMouseDown={handleMouseDown}
                />
                <div className={styles.code} style={{ width: `${100 - leftWidth}%` }}>
                    {/* 代码区 */}
                    <div className={styles.codeHeader}>
                        <h1>{t('Code')}</h1>
                        <button
                            className={styles.editorSettingsButton}
                            onClick={() => {
                                setMonacoSettingsOpen(true);
                            }}
                        >
                            <VscSettingsGear />
                            <span>{t('Editor Settings')}</span>
                        </button>
                    </div>
                    <div className={styles.editorHost}>
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="javascript"
                            theme={monacoConfig.theme || 'vscode-dark-plus'}
                            beforeMount={handleMonacoBeforeMount}
                            onMount={handleMonacoMount}
                            loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                            options={monacoOptions}
                        />
                    </div>
                </div>
            </>)}

        </div>
    )
}
export default Editor