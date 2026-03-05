// 国际化模块
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app_language';

// 默认语言
const DEFAULT_LANGUAGE = 'en';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
];

// 语言包 - 使用英文文本作为键，只需要翻译非英文语言
const translations = {
    zh: {
        // Home
        'Welcome to Astras Blocktory': '欢迎使用 Astras Blocktory',
        'What would you like to do?': '您想要做什么？',
        'Create New Extension': '创建新扩展',
        'Load Extension (.ab)': '加载扩展 (.ab)',
        'Failed to load project: ': '加载项目失败: ',

        // NewProject
        'Create extension': '创建扩展',
        'Name': '名称',
        'Description': '描述',
        'Author': '作者',
        'License': '许可证',
        'Custom ID?': '自定义ID?',
        'Extension id': '扩展ID',
        'Custom color': '自定义颜色',
        'Enable Translate': '启用翻译',
        'Done': '完成',
        'Invalid extension name!': '扩展名称无效!',
        'Invalid extension ID!': '扩展ID无效!',
        'Custom': '自定义',

        // Editor
        'Blocks': '积木',
        'Code': '代码',
        'Create new Block': '创建新积木',
        'Output': '输出',
        'Save': '保存',
        'Setting': '设置',
        'Loading editor...': '加载编辑器中...',
        'Flyout': '列表',
        'Back': '返回',
        'Editor Settings': '编辑器设置',
        'Monaco Settings': 'Monaco 设置',
        'Basic': '基础',
        'Advanced JSON': '高级 JSON',
        'Appearance': '外观',
        'Editor Behavior': '编辑行为',
        'JavaScript / TypeScript': 'JavaScript / TypeScript',
        'Theme': '主题',
        'Font Size': '字体大小',
        'Line Height': '行高',
        'Font Family': '字体族',
        'Minimap': '缩略图',
        'Enable Cursor Smooth Animation': '平滑光标',
        'Word Wrap': '自动换行',
        'Off': '关闭',
        'On': '开启',
        'Word Wrap Column': '按列换行',
        'Bounded': '受限换行',
        'Render Whitespace': '空白字符显示',
        'None': '不显示',
        'Boundary': '边界',
        'Selection': '选区',
        'Trailing': '行尾',
        'All': '全部',
        'Cursor Blinking': '光标闪烁',
        'Tab Size': 'Tab 宽度',
        'Insert Spaces': '使用空格缩进',
        'Smooth Scrolling': '平滑滚动',
        'Mouse Wheel Zoom': '滚轮缩放',
        'Format On Type': '输入时格式化',
        'Format On Paste': '粘贴时格式化',
        'Bracket Pair Colorization': '括号对着色',
        'Indentation Guides': '缩进引导线',
        'Bracket Pair Guides': '括号对引导线',
        'Suggest On Trigger Characters': '触发字符提示',
        'Quick Suggestions': '快速建议',
        'Check JS': '检查 JS',
        'Strict Mode': '严格模式',
        'Script Target': '脚本目标',
        'Advanced mode supports full Monaco config via JSON!': '高级模式可通过 JSON 配置完整 Monaco 选项!',
        'Invalid JSON. Please check syntax.': 'JSON 格式错误，请检查语法。',
        'Cancel': '取消',
        'Reset Defaults': '恢复默认',
        'Format JSON': '格式化 JSON',
        'Apply': '应用',

        // NewBlock
        'New Block': '新建积木',
        'Block Preview': '积木预览',
        'ID': 'ID',
        'Enter ID (a-z, A-Z only)': '输入ID (仅 a-z, A-Z)',
        'Block Type': '积木类型',
        'Add Text': '添加文本',
        'Add Input': '添加输入',
        'Save Block': '保存积木',
        'Invalid Block ID!': '积木ID无效!',
        'Block Parts': '积木内容',
        'No parts yet. Add text or input to start building.': '还没有内容，先添加文本或输入。',
        'If the Addon is not enabled, the background of text and numbers will be consistent in AstraEditor.':"如果没有启用插件，文字和数字的背景在 AstraEditor 是一样的",

        // NewInput
        'Add input': '添加输入',
        'Input Preview': '输入预览',
        'Mode': '模式',
        'Text': '文本',
        'Number': '数字',
        'Text and Number': '文本和数字',
        'Dropdown': '下拉菜单',
        'Boolean': '布尔值',
        'Default Input': '默认输入',
        'read only': '只读',
        'Options': '选项',
        'Default Option':"默认选项",

        // Output Project
        'Output Project': '输出项目',
        'Loading...': '加载中...',

        // Block Types
        'stack': '命令积木',
        'hat': '帽子积木',
        'repoter': '返回值积木',
        'boolean': '布尔积木',
        'C block': 'C型积木',

        // NewBlock additional
        'Text or Number': '文字或数字',
        'Read Only Dropdown': '只读下拉菜单',

        // Common
        'Remove': '删除',
        'move to top': '移至顶部',
        'Modify': '修改',

        //Edit Block
        'Edit Block': "编辑积木",
        'Type: ': '类型：',
        'Found ': "找到了 ",
        " Input(s).":" 个输入项"
    },
};

// 获取当前语言
export const getCurrentLanguage = () => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
};

// 设置语言
export const setLanguage = (lang) => {
    if (lang === 'en' || translations[lang]) {
        localStorage.setItem(STORAGE_KEY, lang);
        window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
        return true;
    }
    return false;
};

// 获取翻译文本 - 直接使用英文文本作为键
export const t = (text) => {
    const lang = getCurrentLanguage();
    if (lang === 'en') {
        return text; // 英文直接返回原文
    }
    return translations[lang]?.[text] || text;
};

// React Hook - 自动响应语言变化
export const useTranslation = () => {
    const [language, setLanguageState] = useState(getCurrentLanguage());

    useEffect(() => {
        const handleLanguageChange = (e) => {
            setLanguageState(e.detail);
        };
        window.addEventListener('languageChange', handleLanguageChange);
        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

    const translate = useCallback((text) => {
        if (language === 'en') {
            return text; // 英文直接返回原文
        }
        return translations[language]?.[text] || text;
    }, [language]);

    return { t: translate, language };
};

// 导出所有翻译（用于调试）
export const getAllTranslations = () => {
    const lang = getCurrentLanguage();
    if (lang === 'en') return {};
    return translations[lang] || {};
};

export default { t, getCurrentLanguage, setLanguage, SUPPORTED_LANGUAGES, useTranslation };