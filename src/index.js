import ExtensionEditor from './components/ExtensionEditor';
import React from 'react';
import ReactDOM from 'react-dom';

export default ExtensionEditor;

// 导出 React 和 ReactDOM 供示例页面使用
export { React, ReactDOM };

// 将 React 和 ReactDOM 挂载到 window 上以便使用
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}