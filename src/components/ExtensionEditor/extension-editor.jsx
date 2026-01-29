import React from 'react';
import PropTypes from 'prop-types';
import * as monaco from 'monaco-editor';
import './extension-editor.css';

import tutorial from './tutorial.png';
import blocks from './blocks.svg';

class ExtensionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: props.initialCode || getDefaultTemplate(),
      isEditorReady: false,
      fontSize: props.fontSize || 14
    };
    this.editorContainer = React.createRef();
    this.editor = null;
    this.lastTheme = null; // 用于存储上一次的主题
  }

  componentDidMount() {
    // 配置 Monaco Editor worker
    if (typeof window !== 'undefined') {
      window.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
          // 使用 require.ensure 的方式加载 worker
          if (label === 'json') {
            return './editor.worker.js';
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return './editor.worker.js';
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './editor.worker.js';
          }
          if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.js';
          }
          return './editor.worker.js';
        }
      };
    }
    this.initEditor();

    // 监听 localStorage 的变化（用于跨标签页同步）
    this.handleStorageChange = this.handleStorageChange.bind(this);
    window.addEventListener('storage', this.handleStorageChange);

    // 轮询检查主题变化（用于当前标签页）
    this.lastTheme = this.getEditorTheme();
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
            theme = 'dark';
            break;
          case 'dark':
            theme = 'dark';
            break;
          case 'light':
            theme = 'light';
            break;
          default:
            theme = 'dark';
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

  render() {
    return (
      <div className="extension-editor-container">
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
            title={this.props.wizardActive ? "切换到积木预览" : "切换到制作向导"}
          >
            <img className="extension-wizard-toggle-icon" src={this.props.wizardActive ? blocks : tutorial}/>
          </button>
        )}
      </div>
    );
  }
}
function getDefaultTemplate() {
  return `// Scratch 扩展模板
// 在这里编写你的扩展代码

class MyExtension {
  constructor(runtime) {
    this.runtime = runtime;
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
          blockType: 'command',
          text: '你好 [MESSAGE]',
          arguments: {
            MESSAGE: {
              type: 'string',
              defaultValue: '世界'
            }
          }
        },
        {
          opcode: 'getRandomNumber',
          blockType: 'reporter',
          text: '随机数 [MIN] 到 [MAX]',
          arguments: {
            MIN: {
              type: 'number',
              defaultValue: 1
            },
            MAX: {
              type: 'number',
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

// 导出扩展
Scratch.extensions.register(new MyExtension());
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
  wizardActive: PropTypes.bool
};

export default ExtensionEditor;