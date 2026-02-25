import React from 'react';
import PropTypes from 'prop-types';
import * as monaco from 'monaco-editor';
import { defineMessages } from 'react-intl';
import './extension-editor.css';

import tutorial from './tutorial.png';
import blocks from './blocks.svg';

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
      code: props.initialCode || getDefaultTemplate(),
      isEditorReady: false,
      fontSize: props.fontSize || 14,
      guiTheme: 'dark'
    };
    this.editorContainer = React.createRef();
    this.editor = null;
    this.lastTheme = null; // 用于存储上一次的主题
  }

  getExtensionEditorPublicPath() {
    if (typeof window === 'undefined') return './';
    const configured = window.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__;
    if (typeof configured !== 'string' || configured.length === 0) return './';
    return configured.endsWith('/') ? configured : `${configured}/`;
  }

  componentDidMount() {
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
    this.handleStorageChange = this.handleStorageChange.bind(this);
    window.addEventListener('storage', this.handleStorageChange);

    // 轮询检查主题变化（用于当前标签页）
    this.lastTheme = this.getEditorTheme();
    this.setState({ guiTheme: this.lastTheme });
    this.themeCheckInterval = setInterval(() => {
      const currentTheme = this.getEditorTheme();
      if (currentTheme !== this.lastTheme) {
        this.lastTheme = currentTheme;
        this.updateEditorTheme();
      }
    }, 500); // 每500ms检查一次
  }

  componentDidUpdate(prevProps) {
    // 当initialCode变化时（例如切换标签卡），更新编辑器内容
    if (prevProps.initialCode !== this.props.initialCode) {
      const newCode = this.props.initialCode || getDefaultTemplate();
      const currentCode = this.editor ? this.editor.getValue() : this.state.code;
      
      // 只有在内容确实不同时才更新编辑器，避免不必要的重置
      if (currentCode !== newCode) {
        if (this.editor) {
          // 保存当前光标位置
          const position = this.editor.getPosition();
          
          // 更新编辑器内容
          this.editor.setValue(newCode);
          
          // 恢复光标位置（如果可能）
          if (position) {
            this.editor.setPosition(position);
          }
        }
        this.setState({ code: newCode });
      }
    }
    if (prevProps.fontSize !== this.props.fontSize && this.editor) {
      this.setState({ fontSize: this.props.fontSize });
      this.editor.updateOptions({ fontSize: this.props.fontSize });
    }
  }

  getEditorTheme() {
    let theme = 'dark';
    try {
      const themeStr = localStorage.getItem('tw:theme');
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

  updateEditorTheme() {
    if (!this.editor) return;
    const currentTheme = this.getEditorTheme();
    const monacoTheme = currentTheme === 'light' ? 'vs' : 'vs-dark';
    monaco.editor.setTheme(monacoTheme);
    if (this.state.guiTheme !== currentTheme) {
      this.setState({ guiTheme: currentTheme });
    }
  }

  handleStorageChange(e) {
    // 监听 tw:theme 的变化
    if (e.key === 'tw:theme' && e.newValue !== e.oldValue) {
      this.updateEditorTheme();
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.dispose();
    }
    // 移除 localStorage 监听器
    window.removeEventListener('storage', this.handleStorageChange);
    // 清理主题检查定时器
    if (this.themeCheckInterval) {
      clearInterval(this.themeCheckInterval);
    }
  }

  initEditor() {
    if (!this.editorContainer.current) return;
    const monacoTheme = this.getEditorTheme() === 'light' ? 'vs' : 'vs-dark';
    this.editor = monaco.editor.create(this.editorContainer.current, {
      value: this.state.code,
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
    this.editor.onDidChangeModelContent(() => {
      const newCode = this.editor.getValue();
      this.setState({ code: newCode });
      if (this.props.onCodeChange) {
        this.props.onCodeChange(newCode);
      }
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

  handleRun = () => {
    if (this.props.onRun) {
      this.props.onRun(this.state.code);
    }
  };

  handleReset = () => {
    const newCode = getDefaultTemplate();
    this.setState({ code: newCode });
    if (this.editor) {
      this.editor.setValue(newCode);
    }
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
  onRun: PropTypes.func,
  onOpenExtensionEditorSettings: PropTypes.func,
  fontSize: PropTypes.number,
  onFontSizeChange: PropTypes.func,
  onToggleWizard: PropTypes.func,
  wizardActive: PropTypes.bool,
  intl: PropTypes.object
};

export default ExtensionEditor;
