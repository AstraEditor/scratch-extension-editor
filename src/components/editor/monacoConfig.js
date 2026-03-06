/**
 * Monaco 编辑器配置
 */

export const VSCODE_DARK_PLUS = {
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

export const MONACO_SETTINGS_KEY = 'monaco_editor_settings';

export const DEFAULT_MONACO_CONFIG = {
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

export const normalizeMonacoConfig = (config) => {
    if (!isPlainObject(config)) return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
    return deepMerge(DEFAULT_MONACO_CONFIG, config);
};

export const cloneMonacoConfig = (config) => JSON.parse(JSON.stringify(config));

export const loadMonacoConfig = () => {
    try {
        const raw = localStorage.getItem(MONACO_SETTINGS_KEY);
        if (!raw) return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
        return normalizeMonacoConfig(JSON.parse(raw));
    } catch {
        return cloneMonacoConfig(DEFAULT_MONACO_CONFIG);
    }
};

export const applyLanguageServiceSettings = (monaco, monacoConfig) => {
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
