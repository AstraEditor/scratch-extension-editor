# Scratch Extension Editor

一站式 Scratch 扩展开发编辑器，基于 Monaco Editor（VS Code 核心）构建。

## 功能特性

- ✨ 基于 Monaco Editor 的强大代码编辑器
- 🎨 语法高亮和智能提示
- 📝 内置 Scratch 扩展模板
- 🚀 一键运行和测试
- 🌙 支持深色/浅色主题
- 📦 易于集成到现有项目

## 安装

```bash
npm install scratch-extension-editor
```

## 使用方法

### 基本用法

```jsx
import React from 'react';
import ExtensionEditor from 'scratch-extension-editor';

function App() {
  const handleCodeChange = (code) => {
    console.log('代码已更新:', code);
  };
  
  const handleRun = (code) => {
    // 运行扩展代码
    console.log('运行扩展:', code);
  };
  
  return (
    <ExtensionEditor
      vm={vm}
      onCodeChange={handleCodeChange}
      onRun={handleRun}
      theme="vs-dark"
    />
  );
}
```

### Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `vm` | `object` | 否 | `null` | Scratch VM 实例 |
| `initialCode` | `string` | 否 | 模板代码 | 初始代码 |
| `onCodeChange` | `function` | 否 | - | 代码变化回调 |
| `onRun` | `function` | 否 | - | 运行扩展回调 |
| `theme` | `string` | 否 | `'vs-dark'` | 编辑器主题 |

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:8080/example/index.html 查看示例

### 构建

```bash
npm run build
```

## 集成到 Scratch GUI

### 1. 安装依赖

在 `scratch-gui` 项目中：

```bash
npm install scratch-extension-editor
```

### 2. 添加新的 Tab

在 `src/reducers/editor-tab.js` 中：

```javascript
const EXTENSION_EDITOR_TAB_INDEX = 3;

export {
  EXTENSION_EDITOR_TAB_INDEX
};
```

### 3. 在 GUI 中集成

在 `src/components/gui/gui.jsx` 中：

```jsx
import ExtensionEditor from 'scratch-extension-editor';

// 在 TabList 中添加
<Tab>
  <FormattedMessage
    defaultMessage="Extension Editor"
    id="gui.gui.extensionEditorTab"
  />
</Tab>

// 在 TabPanel 中添加
<TabPanel className={tabClassNames.tabPanel}>
  <ExtensionEditor
    vm={vm}
    onCodeChange={handleCodeChange}
    onRun={handleRunExtension}
  />
</TabPanel>
```

## 扩展模板

编辑器内置了完整的 Scratch 扩展模板，包括：

- 基本扩展结构
- `getInfo()` 方法配置
- 积木定义示例
- 参数处理示例

## 许可证

GPL-3.0

## 作者

KOSHINO

## 贡献

欢迎提交 Issue 和 Pull Request！