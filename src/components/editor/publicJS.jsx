import {
    loadMonacoConfig
} from './monacoConfig.js';
import MonacoEditor from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { t } from '../../i18n'
import { returnValue, setValueTo, getAllValue } from '../../extension/storage.js';
import styles from './publicJS.module.css'
import { BlockType, renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import { prepareBlockForDisplay } from './blockUtils.js';
import { VscChevronUp, VscRunBelow } from "react-icons/vsc";
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


export const Block = props => {
    const handleToggle = () => {
        props.setExpand();
    };

    const fullOpcode = returnValue('comments')['id'] + '_' + props.name;

    return (
        <div key={props.name} className={styles.blockPreview}>
            <div className={styles.intro}>
                <div>
                    <div style={{ fontSize: '16px', color: '#666' }}>opcode: "{props.name}"</div>
                    <div style={{ fontSize: '16px', color: '#666' }}>{t('full opcode')}: "{fullOpcode}"</div>
                </div>
                <div>
                    <div className={styles.chevron} onClick={handleToggle}>
                        <div style={{
                            transform: props.expand ? "rotate(180deg)" : "rotate(0deg)",
                            transition: 'transform 0.2s ease'
                        }}>
                            <VscChevronUp />
                        </div>
                    </div>
                    <div className={styles.chevron} onClick={() => {
                        props.insert(`Scratch.vm.runtime.startHats('${fullOpcode}');`)
                    }} title={t("Insert Run Code")}>{props.blk.type === BlockType.EVENT && (
                        <VscRunBelow />
                    )}</div>
                </div>
            </div>
            <div className={styles.Block}>
                <div className={styles.OnceBlockPreview} dangerouslySetInnerHTML={{ __html: renderBlockToHTML(prepareBlockForDisplay(props.blk)) }} />
            </div>
            <div className={`${styles.expandableContent} ${props.expand ? styles.expanded : ''}`}>
                <div className={styles.expandableInner} style={!props.expand ? {
                    overflow: 'hidden'
                } : {}}>
                    <hr className={styles.hr} />
                    {props.blk.code ? (
                        <div className={styles.codeEditorContainer}>
                            {props.renderEditor(props.blk.code)}
                        </div>
                    ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>{t('No code')}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
const Editor = props => {
    const [monacoConfig,] = useState(() => loadMonacoConfig());
    const [BlockCode, setBlockCode] = useState(() => returnValue('publicJS'));  // Monaco 中的代码

    // 布局状态
    const [leftWidth, setLeftWidth] = useState(400);
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    // Monaco 编辑器状态
    const monacoApiRef = useRef(null);
    const editorRef = useRef(null);  // Monaco editor 实例
    const [isMonacoMounted, setIsMonacoMounted] = useState(false);  // 追踪 Monaco 是否挂载
    const inputIdsRef = useRef([]);
    const decorationsRef = useRef([]);
    const extraLibRegistryRef = useRef([]);

    const [expandBlockIndex, setExpandBlockIndex] = useState(-1);

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

    // 切换展开状态
    const handleToggleExpand = (index) => {
        setExpandBlockIndex(prev => prev === index ? -1 : index);
    };

    useEffect(() => {
        setTimeout(() => {
            updateDecorations();
        }, 100);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 导入IDs
    useEffect(() => {
        const ids = [];

        Object.entries(returnValue('blocks')).forEach(([name, blk]) => {
            const id = returnValue('comments')['id'] + '_' + name;
            delete ids[id];
            ids.push(id);
        });

        inputIdsRef.current = ids;
    }, []);

    // 拖拽调整宽度
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return;
            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            const newLeftWidth = e.clientX - rect.left;
            if (newLeftWidth >= 150 && newLeftWidth <= 900) {
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

    const handleMouseDown = (e) => {
        isDragging.current = true;
        e.preventDefault();
    };

    const updateDecorations = () => {
        if (monacoApiRef.current && editorRef.current && inputIdsRef.current.length > 0) {
            updateIdentifierDecorations({
                monaco: monacoApiRef.current,
                editor: editorRef.current,
                decorationsRef,
                identifiers: inputIdsRef.current,
                hoverLabel: 'Scratch Opcode'
            });
        }
    };

    // Monaco 内容变化时更新状态和存储
    const handleCodeChange = (value) => {
        const nextValue = value ?? '';
        setBlockCode(nextValue);
        updateDecorations();
        setValueTo("publicJS", nextValue);
    };

    const handleMonacoMount = (editor, monaco) => {
        monacoApiRef.current = monaco;
        editorRef.current = editor;
        applyEditorDiagnostics(monaco, monacoConfig, {
            ignoredCodes: FUNCTION_BODY_DIAGNOSTIC_CODES,
            baseDiagnosticsOptions: {
                noSemanticValidation: true,
                noSuggestionDiagnostics: true
            }
        });
        // 应用主题
        const theme = monacoConfig.theme || 'vscode-dark-plus';
        monaco.editor.setTheme(theme);
        setIsMonacoMounted(true);  // 标记 Monaco 已挂载
    };

    const handleMonacoBeforeMount = (monaco) => {
        defineEditorTheme(monaco);
        applyEditorDiagnostics(monaco, monacoConfig, {
            ignoredCodes: FUNCTION_BODY_DIAGNOSTIC_CODES,
            baseDiagnosticsOptions: {
                noSemanticValidation: true,
                noSuggestionDiagnostics: true
            }
        });
    };

    useEffect(() => {
        if (!isMonacoMounted || !monacoApiRef.current) return;

        const timer = window.setTimeout(() => {
            const blocks = returnValue('blocks') || {};
            const extensionId = returnValue('comments')?.id || 'extension';
            inputIdsRef.current = Object.keys(blocks).map(name => `${extensionId}_${name}`);

            syncExtraLibs(
                monacoApiRef.current,
                extraLibRegistryRef,
                buildSharedMonacoLibs({
                    blocks,
                    extensionId,
                    publicJS: BlockCode
                })
            );
            updateDecorations();
        }, 120);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [BlockCode, isMonacoMounted]);

    useEffect(() => () => {
        disposeExtraLibs(extraLibRegistryRef);
    }, []);

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


    return (
        <div className={styles.JSEditor} ref={containerRef}>
            <div className={styles.Manage} style={{ width: `${leftWidth}px` }}>
                <button className={styles.Button} onClick={() => props.back()}>
                    <span>{t('Back')}</span>
                </button>
                <div className={styles.Blocks}>
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
                                    path={`file:///public-preview/${name}.js`}
                                    theme={monacoConfig.theme || 'vscode-dark-plus'}
                                    beforeMount={(monaco) => handleReadonlyMonacoBeforeMount(monaco, blk)}
                                    loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                                    options={{ ...monacoConfig.options, readOnly: true, minimap: { enabled: false }, fixedOverflowWidgets: true }}
                                    value={value}
                                />
                            )}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.resizer} onMouseDown={handleMouseDown} />
            <div className={styles.Editor}>
                <MonacoEditor
                    height="100%"
                    defaultLanguage="javascript"
                    path="file:///public-editor/public-js.js"
                    theme={monacoConfig.theme || 'vscode-dark-plus'}
                    loading={<div style={{ color: '#888', padding: '20px' }}>{t('Loading editor...')}</div>}
                    options={{ ...monacoConfig.options, fixedOverflowWidgets: true }}
                    onChange={handleCodeChange}
                    beforeMount={handleMonacoBeforeMount}
                    onMount={handleMonacoMount}
                    value={BlockCode}
                />
            </div>
        </div>
    )
}

export default Editor
