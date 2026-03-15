import {
    loadMonacoConfig,
    applyLanguageServiceSettings,
    VSCODE_DARK_PLUS
} from './monacoConfig.js';
import MonacoEditor from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { t } from '../../i18n'
import { returnValue, setValueTo, getAllValue } from '../../extension/storage.js';
import styles from './publicJS.module.css'
import { BlockType, renderBlockToHTML } from '../../lib/blockSvgRenderer.js';
import { prepareBlockForDisplay } from './blockUtils.js';
import { VscChevronUp, VscRunBelow } from "react-icons/vsc";
import VMAPI from './vm-api.js';
import VMAPI_CN from './vm-api-cn.js';
import SCRATCH_API from './scratch-api.js';
import SCRATCH_API_CN from './scratch-api-cn.js';


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
    const [, setIsMonacoMounted] = useState(false);  // 追踪 Monaco 是否挂载
    const inputIdsRef = useRef([]);
    const decorationsRef = useRef([]);

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

    // 注册 input 变量的自定义高亮
    const registerInputHighlight = (monaco, inputIds) => {
        if (!editorRef.current || inputIds.length === 0) return;

        const editor = editorRef.current;
        const model = editor.getModel();
        if (!model) return;

        // 创建装饰器：为所有 input 变量添加高亮
        const decorations = [];
        const text = model.getValue();

        // 为每个 input ID 找到所有出现的位置并添加装饰
        inputIds.forEach(inputId => {
            // 使用正则匹配变量名（单词边界）
            const regex = new RegExp(`\\b${inputId}\\b`, 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startPos = model.getPositionAt(match.index);
                const endPos = model.getPositionAt(match.index + match[0].length);

                decorations.push({
                    range: new monaco.Range(
                        startPos.lineNumber,
                        startPos.column,
                        endPos.lineNumber,
                        endPos.column
                    ),
                    options: {
                        className: 'scratch-input-highlight',
                        inlineClassName: 'scratch-input-inline',
                        hoverMessage: { value: `**Scratch Input**: ${inputId}` },
                        color: '#4fc3f7',  // 青色
                        inlineClassNameAffectsLetterSpacing: true,
                    }
                });
            }
        });

        // 应用装饰器
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
    };

    const updateDecorations = () => {
        if (monacoApiRef.current && editorRef.current && inputIdsRef.current.length > 0) {
            registerInputHighlight(monacoApiRef.current, inputIdsRef.current);
        }
    };

    // Monaco 内容变化时更新状态和存储
    const handleCodeChange = (value) => {
        setBlockCode(value);
        updateDecorations();
        setValueTo("publicJS", value);
    };

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
        const baseDiagnosticsOptions = {
            noSemanticValidation: true,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: true
        };

        const userOptions = monacoConfig.languageService?.diagnosticsOptions || {};
        const diagnosticsOptions = mergeFunctionBodyDiagnostics({
            ...baseDiagnosticsOptions,
            ...userOptions,
            noSemanticValidation: true
        });
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    };

    const handleMonacoMount = (editor, monaco) => {
        monacoApiRef.current = monaco;
        editorRef.current = editor;
        applyBlockLanguageServiceSettings(monaco, monacoConfig);
        // 应用主题
        const theme = monacoConfig.theme || 'vscode-dark-plus';
        monaco.editor.setTheme(theme);
        setIsMonacoMounted(true);  // 标记 Monaco 已挂载
    };

    const handleMonacoBeforeMount = (monaco) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false
        });
        monaco.editor.defineTheme('vscode-dark-plus', VSCODE_DARK_PLUS);
        applyBlockLanguageServiceSettings(monaco, monacoConfig);
    };

    // 为 Monaco 注入 input 变量定义
    const injectInputDefinitions = (monaco) => {
        // 收集所有 input 并生成类型定义
        const inputDefs = [];

        inputIdsRef.current.forEach(value => {
            inputDefs.push(`/**`);
            inputDefs.push(`* a block opcode: ${value}`);
            inputDefs.push(`*/`);
            inputDefs.push(`declare const ${value}: string`);
        })

        // 注入 input 变量定义
        if (inputDefs.length > 0) {
            const inputDts = inputDefs.join('\n');
            monaco.languages.typescript.javascriptDefaults.addExtraLib(inputDts, 'inputs.d.ts');
        }

        // 注入完整的 VM API 类型定义（包含 JSDoc 注释）
        switch (localStorage.getItem("app_language")) {
            case "zh":
                monaco.languages.typescript.javascriptDefaults.addExtraLib(VMAPI_CN, 'vm-api.d.ts');
                monaco.languages.typescript.javascriptDefaults.addExtraLib(SCRATCH_API_CN, 'scratch-api.d.ts');

                break
            default:
                monaco.languages.typescript.javascriptDefaults.addExtraLib(VMAPI, 'vm-api.d.ts');
                monaco.languages.typescript.javascriptDefaults.addExtraLib(SCRATCH_API, 'scratch-api.d.ts');

        }

        // 注册自定义颜色提供器，为 input 变量添加高亮
        registerInputHighlight(monaco, inputIdsRef.current);
    };

    // 切换 block 时重新注入 input 变量定义
    useEffect(() => {
        if (monacoApiRef.current) {
            injectInputDefinitions(monacoApiRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [BlockCode]);


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
                                    theme={monacoConfig.theme || 'vscode-dark-plus'}
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