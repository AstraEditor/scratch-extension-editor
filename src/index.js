import ExtensionEditor from './components/ExtensionEditor';
import ExtensionEditorSettingsContent from './components/ExtensionEditorSettingsContent';
import ExtensionEditorCreateContent from './components/ExtensionEditorCreateContent';
import ExtensionEditorStorageContent from './components/ExtensionEditorStorageContent';
import ExtensionEditorWizardPanel from './components/ExtensionEditorWizardPanel';
import BlockPreview from './components/BlockPreview';
import extensionEditorStorage from './lib/extension-editor-storage';
import React from 'react';
import ReactDOM from 'react-dom';

export default ExtensionEditor;

// 导出所有组件和服务
export { 
  ExtensionEditorSettingsContent, 
  ExtensionEditorCreateContent, 
  ExtensionEditorStorageContent,
  ExtensionEditorWizardPanel,
  BlockPreview,
  extensionEditorStorage 
};

// 导出 React 和 ReactDOM 供示例页面使用
export { React, ReactDOM };

// 将 React 和 ReactDOM 挂载到 window 上以便使用
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}