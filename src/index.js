import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './components/main/main';
import reportWebVitals from './reportWebVitals';
import {
    init,
    returnValue,
    getAllValue,
    setValueTo,
    setAllValue
} from './extension/storage'
import { initTheme } from './lib/theme.js';
import { detectBrowserLanguage } from './i18n/index.js';

const monacoLanguage = (() => {
    const lang = detectBrowserLanguage();
    if (lang === 'zh') return 'zh-cn';
    return 'en';
})();


// 配置 Monaco 编辑器加载器（使用本地静态资源，避免 CDN 导致加载失败）
import { loader } from '@monaco-editor/react';


// 初始化存储
init();
initTheme();

// 使用 PUBLIC_URL 确保路径在开发和生产环境中都正确
const publicUrl = process.env.PUBLIC_URL || '';
const monacoBasePath = `${publicUrl}/vs`;

// 检查 loader 是否存在
if (loader && typeof loader.config === 'function') {
    loader.config({
        paths: {
            vs: monacoBasePath
        },
        'vs/nls': {
            availableLanguages: {
                '*': monacoLanguage
            }
        }
    });
}

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

if (process.env.NODE_ENV === 'development') {
    window.storage = {
        get: returnValue,
        getAll: getAllValue,
        set: setValueTo,
        setAll: setAllValue
    };
}
  

import ToastContainer from './components/toast/toast.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
    <ToastContainer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
