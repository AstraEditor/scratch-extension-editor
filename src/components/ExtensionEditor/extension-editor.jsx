import React from 'react';
import PropTypes from 'prop-types';
import * as monaco from 'monaco-editor';
import { defineMessages } from 'react-intl';
import './extension-editor.css';

import tutorial from './tutorial.png';
import blocks from './blocks.svg';

const THEME_STORAGE_KEY = 'tw:theme';
const LOCAL_STORAGE_CHANGE_EVENT = 'scratch-gui:local-storage-change';
const THEME_CHANGED_EVENT = 'tw:theme-changed';

let hasInstalledLocalStorageBridge = false;
const installLocalStorageBridge = () => {
  if (hasInstalledLocalStorageBridge || typeof window === 'undefined') return;
  hasInstalledLocalStorageBridge = true;

  const emitChange = (key, oldValue, newValue) => {
    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_CHANGE_EVENT, {
      detail: { key, oldValue, newValue }
    }));
  };

  try {
    const nativeSetItem = window.localStorage.setItem.bind(window.localStorage);
    const nativeRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

    window.localStorage.setItem = (key, value) => {
      const oldValue = window.localStorage.getItem(key);
      nativeSetItem(key, value);
      if (oldValue !== value) emitChange(key, oldValue, value);
    };

    window.localStorage.removeItem = key => {
      const oldValue = window.localStorage.getItem(key);
      nativeRemoveItem(key);
      if (oldValue !== null) emitChange(key, oldValue, null);
    };
  } catch (e) {
    // If localStorage is unavailable/readonly, fall back to standard storage event only.
  }
};

const messages = defineMessages({
    toggleToBlockPreview: {
        defaultMessage: 'Switch to Block Preview',
        description: 'Tooltip for switching to block preview',
        id: 'tw.extensionEditorSettings.toggleToBlockPreview'
    },
    toggleToWizard: {
        defaultMessage: 'Switch to Wizard',
        description: 'Tooltip for switching to wizard',
        id: 'tw.extensionEditorSettings.toggleToWizard'
    }
});

class ExtensionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditorReady: false,
      fontSize: props.fontSize || 14,
      guiTheme: 'dark'
    };
    this.currentCode = props.initialCode || getDefaultTemplate();
    this.editorContainer = React.createRef();
    this.editor = null;
    this.lastTheme = null; // 用于存储上一次的主题
    this.suppressModelChange = false;
    this.modelChangeDisposable = null;
    this.handleStorageChange = this.handleStorageChange.bind(this);
    this.handleLocalStorageChange = this.handleLocalStorageChange.bind(this);
    this.handleThemeChanged = this.handleThemeChanged.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
  }

  getExtensionEditorPublicPath() {
    if (typeof window === 'undefined') return './';
    const configured = window.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__;
    if (typeof configured !== 'string' || configured.length === 0) return './';
    return configured.endsWith('/') ? configured : `${configured}/`;
  }

  componentDidMount() {
    installLocalStorageBridge();

    // 配置 Monaco Editor worker
    if (typeof window !== 'undefined') {
      const publicPath = this.getExtensionEditorPublicPath();
      const getWorkerUrl = (moduleId, label) => {
        // Workers are shipped with scratch-extension-editor and served from a dedicated folder.
        if (label === 'typescript' || label === 'javascript') {
          return `${publicPath}ts.worker.js`;
        }
        return `${publicPath}editor.worker.js`;
      };

      // Monaco may call either getWorker() or getWorkerUrl() depending on version/config.
      window.MonacoEnvironment = {
        getWorkerUrl,
        getWorker: function (moduleId, label) {
          const url = getWorkerUrl(moduleId, label);
          try {
            return new Worker(url);
          } catch (e) {
            // Some environments require an absolute URL.
            try {
              const absoluteUrl = new URL(url, window.location.href).toString();
              return new Worker(absoluteUrl);
            } catch (e2) {
              // Log the original error; throw to surface failure loudly.
              // eslint-disable-next-line no-console
              console.error('[scratch-extension-editor] Failed to create Monaco worker', {
                label,
                url,
                error: e
              });
              throw e;
            }
          }
        }
      };
    }
    this.initEditor();

    // 监听 localStorage 的变化（用于跨标签页同步）
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, this.handleLocalStorageChange);
    window.addEventListener(THEME_CHANGED_EVENT, this.handleThemeChanged);
    window.addEventListener('focus', this.handleWindowFocus);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 初始化主题（当前标签页）
    this.updateEditorTheme();
  }

  componentDidUpdate(prevProps) {
    // 当initialCode变化时（例如切换标签卡），更新编辑器内容
    if (prevProps.initialCode !== this.props.initialCode) {
      const newCode = this.props.initialCode || getDefaultTemplate();
      const currentCode = this.getCurrentCode();
      
      // 只有在内容确实不同时才更新编辑器，避免不必要的重置
      if (currentCode !== newCode) {
        // 避免父组件异步回写旧值导致正在输入时光标跳动
        const isTyping = Boolean(this.editor && this.editor.hasTextFocus && this.editor.hasTextFocus());
        if (!isTyping && this.editor) {
          // 保存当前光标位置
          const position = this.editor.getPosition();
          
          // 更新编辑器内容
          this.suppressModelChange = true;
          try {
            this.editor.setValue(newCode);
          } finally {
            this.suppressModelChange = false;
          }
          this.currentCode = newCode;
          
          // 恢复光标位置（如果可能）
          if (position) {
            this.editor.setPosition(position);
          }
        } else if (!this.editor) {
          this.currentCode = newCode;
        }
      }
    }
    if (prevProps.fontSize !== this.props.fontSize && this.editor) {
      this.setState({ fontSize: this.props.fontSize });
      this.editor.updateOptions({ fontSize: this.props.fontSize });
    }
    if (prevProps.themeMode !== this.props.themeMode) {
      this.updateEditorTheme();
    }
  }

  getThemeFromProps() {
    if (this.props.themeMode === 'light' || this.props.themeMode === 'dark') {
      return this.props.themeMode;
    }
    return null;
  }

  getEditorTheme() {
    const themeFromProps = this.getThemeFromProps();
    if (themeFromProps) {
      return themeFromProps;
    }

    let theme = 'dark';
    try {
      const themeStr = localStorage.getItem(THEME_STORAGE_KEY);
      if (themeStr) {
        const themeData = JSON.parse(themeStr);
        switch (themeData.gui) {
          case undefined:
            theme = 'light';
            break;
          case 'dark':
            theme = 'dark';
            break;
          case 'light':
            theme = 'light';
            break;
          default:
            theme = 'light';
        }
      }
    } catch (e) {
      console.error('Failed to parse theme from localStorage:', e);
      theme = 'dark';
    }
    return theme;
  }

  applyEditorTheme(theme) {
    if (!this.editor) return;
    const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';
    monaco.editor.setTheme(monacoTheme);
    this.lastTheme = theme;
    if (this.state.guiTheme !== theme) {
      this.setState({ guiTheme: theme });
    }
  }

  updateEditorTheme() {
    const currentTheme = this.getEditorTheme();
    if (!this.editor) {
      this.lastTheme = currentTheme;
      if (this.state.guiTheme !== currentTheme) {
        this.setState({ guiTheme: currentTheme });
      }
      return;
    }
    if (this.lastTheme === currentTheme && this.state.guiTheme === currentTheme) {
      return;
    }
    this.applyEditorTheme(currentTheme);
  }

  handleStorageChange(e) {
    // 监听 tw:theme 的变化
    if (e.key === THEME_STORAGE_KEY && e.newValue !== e.oldValue) {
      this.updateEditorTheme();
    }
  }
  handleLocalStorageChange(e) {
    const detail = e && e.detail ? e.detail : null;
    if (detail && detail.key === THEME_STORAGE_KEY && detail.newValue !== detail.oldValue) {
      this.updateEditorTheme();
    }
  }
  handleThemeChanged() {
    this.updateEditorTheme();
  }
  handleVisibilityChange() {
    if (!document.hidden) {
      this.updateEditorTheme();
    }
  }
  handleWindowFocus() {
    this.updateEditorTheme();
  }

  componentWillUnmount() {
    if (this.modelChangeDisposable) {
      this.modelChangeDisposable.dispose();
      this.modelChangeDisposable = null;
    }
    if (this.editor) {
      this.editor.dispose();
    }
    // 移除 localStorage 监听器
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener(LOCAL_STORAGE_CHANGE_EVENT, this.handleLocalStorageChange);
    window.removeEventListener(THEME_CHANGED_EVENT, this.handleThemeChanged);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  initEditor() {
    if (!this.editorContainer.current) return;
    const monacoTheme = this.getEditorTheme() === 'light' ? 'vs' : 'vs-dark';
    this.editor = monaco.editor.create(this.editorContainer.current, {
      value: this.currentCode,
      language: 'javascript',
      theme: monacoTheme,
      minimap: { enabled: true },
      fontSize: this.state.fontSize,
      lineNumbers: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
    });

    this.setState({ isEditorReady: true });

    // 监听编辑器内容变化
    this.modelChangeDisposable = this.editor.onDidChangeModelContent(() => {
      if (!this.editor || this.suppressModelChange) return;
      this.currentCode = this.editor.getValue();
      this.emitCodeChange(this.currentCode);
      this.emitAutoRunRequest(this.currentCode);
    });

    // 配置 JavaScript 语法高亮和智能提示
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      reactNamespace: 'React',
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });
  }
  getCurrentCode() {
    if (this.editor) {
      return this.editor.getValue();
    }
    return this.currentCode;
  }
  emitCodeChange(code = this.currentCode) {
    if (!this.props.onCodeChange) return;
    this.props.onCodeChange(code);
  }
  emitAutoRunRequest(code = this.currentCode) {
    if (!this.props.onAutoRunRequest) return;
    this.props.onAutoRunRequest(code);
  }

  handleRun = () => {
    if (this.props.onRun) {
      this.props.onRun(this.getCurrentCode());
    }
  };

  handleReset = () => {
    const newCode = getDefaultTemplate();
    this.currentCode = newCode;
    if (this.editor) {
      this.suppressModelChange = true;
      this.editor.setValue(newCode);
      this.suppressModelChange = false;
    }
    this.emitCodeChange(newCode);
  };

  handleToggleSettings = () => {
    if (this.props.onOpenExtensionEditorSettings) {
      this.props.onOpenExtensionEditorSettings();
    }
  };

  getToggleTitle = () => {
    if (!this.props.intl) {
      return this.props.wizardActive ? "Switch to Block Preview" : "Switch to Wizard";
    }
    return this.props.intl.formatMessage(
      this.props.wizardActive ? messages.toggleToBlockPreview : messages.toggleToWizard
    );
  };

  render() {
    return (
      <div className="extension-editor-container" data-theme={this.state.guiTheme}>
        <div className="extension-editor-wrapper">
          <div
            ref={this.editorContainer}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {this.props.onToggleWizard && (
          <button
            className="extension-wizard-toggle"
            onClick={this.props.onToggleWizard}
            title={this.getToggleTitle()}
          >
            <img className="extension-wizard-toggle-icon" src={this.props.wizardActive ? blocks : tutorial}/>
          </button>
        )}
      </div>
    );
  }
}
function getDefaultTemplate() {
  return `
(function (Scratch) {
  "use strict";

  const BlockType = Scratch.BlockType;
  const ArgumentType = Scratch.ArgumentType;

  class MyExtension {
    constructor() {
      // TurboWarp/unsandboxed extensions can access the VM through Scratch.vm.
      this.runtime = Scratch.vm && Scratch.vm.runtime;
    }
    getInfo() {
      return {
        id: 'myextension',
        name: '我的扩展',
        color1: '#FF6680',
        color2: '#FF4D6A',
        color3: '#CC3D55',
        blocks: [
          {
            opcode: 'hello',
            blockType: BlockType.COMMAND,
            text: '你好 [MESSAGE]',
            arguments: {
              MESSAGE: {
                type: ArgumentType.STRING,
                defaultValue: '世界'
              }
            }
          },
          "---",
          {
            opcode: 'getRandomNumber',
            blockType: BlockType.REPORTER,
            text: '随机数 [MIN] 到 [MAX]',
            arguments: {
              MIN: {
                type: ArgumentType.NUMBER,
                defaultValue: 1
              },
              MAX: {
                type: ArgumentType.NUMBER,
                defaultValue: 100
              }
            }
          }
        ]
      };
    }
    hello(args) {
      console.log('Hello, ' + args.MESSAGE);
    }

    getRandomNumber(args) {
      const min = args.MIN;
      const max = args.MAX;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }


  Scratch.extensions.register(new MyExtension());
})(Scratch);

`;
}

ExtensionEditor.propTypes = {
  vm: PropTypes.object,
  initialCode: PropTypes.string,
  onCodeChange: PropTypes.func,
  onAutoRunRequest: PropTypes.func,
  onRun: PropTypes.func,
  onOpenExtensionEditorSettings: PropTypes.func,
  fontSize: PropTypes.number,
  onFontSizeChange: PropTypes.func,
  themeMode: PropTypes.oneOf(['light', 'dark']),
  onToggleWizard: PropTypes.func,
  wizardActive: PropTypes.bool,
  intl: PropTypes.object
};

export default ExtensionEditor;
