import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './components/main/main';
import reportWebVitals from './reportWebVitals';

// 配置 Monaco 编辑器加载器（使用本地静态资源，避免 CDN 导致加载失败）
import { loader } from '@monaco-editor/react';

const monacoBasePath = new URL('./vs', window.location.href).toString();
loader.config({
    paths: {
        vs: monacoBasePath
    },
    'vs/nls': {
        availableLanguages: {
            // 与 monaco-editor@0.55.x 的 nls 模块名保持一致，避免初始化卡住
            '*': 'zh-cn.js'
        }
    }
});

// 忽略 ResizeObserver 循环警告 （世上最铸币警告）
const debounce = (fn, delay) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
        callback = debounce(callback, 16);
        super(callback);
    }
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
