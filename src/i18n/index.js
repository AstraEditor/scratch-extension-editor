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

// 语言包
const translations = {
    en: {
        // Home
        'home.title': 'Welcome to Astras Blocktory',
        'home.whatToDo': 'What would you like to do?',
        'home.newExtension': 'Create New Extension',
        'home.loadExtension': 'Load Extension (.ab)',
        'home.loadFailed': 'Failed to load project: ',

        // NewProject
        'newProject.title': 'Create extension',
        'newProject.name': 'Name',
        'newProject.description': 'Description',
        'newProject.author': 'Author',
        'newProject.license': 'License',
        'newProject.customID': 'Custom ID?',
        'newProject.extensionID': 'Extension id',
        'newProject.customColor': 'Custom color',
        'newProject.enableTranslate': 'Enable Translate',
        'newProject.done': 'Done',
        'newProject.invalidName': 'Invalid extension name!',
        'newProject.invalidID': 'Invalid extension ID!',
        'newProject.customLicense': 'Custom',

        // Editor
        'editor.blocks': 'Blocks',
        'editor.code': 'Code',
        'editor.createBlock': 'Create new Block',
        'editor.output': 'Output',
        'editor.save': 'Save',
        'editor.setting': 'Setting',
        'editor.loading': 'Loading editor...',
        'editor.flyout': 'Flyout',

        // NewBlock
        'newBlock.title': 'New Block',
        'newBlock.blockPreview': 'Block Preview',
        'newBlock.opcode': 'Opcode (ID)',
        'newBlock.opcodePlaceholder': 'Enter opcode (a-z, A-Z only)',
        'newBlock.blockType': 'Block Type',
        'newBlock.addText': 'Add Text',
        'newBlock.addInput': 'Add Input',
        'newBlock.saveBlock': 'Save Block',
        'newBlock.invalidName': 'Invalid Block Name!',

        // NewInput
        'newInput.title': 'Add input',
        'newInput.preview': 'Input Preview',
        'newInput.mode': 'Mode',
        'newInput.textAndNumber': 'Text and Number',
        'newInput.dropdown': 'DropDown',
        'newInput.boolean': 'Boolean',
        'newInput.defaultInput': 'Default Input',
        'newInput.readonly': 'read only',
        'newInput.options': 'Options',
        'newInput.back': 'Back',
        'newInput.done': 'Done',

        // Output Project
        'output.title': 'Output Project',
        'output.loading': 'Loading...',

        // Block Types
        'blockType.stack': 'stack',
        'blockType.hat': 'hat',
        'blockType.round': 'repoter',
        'blockType.boolean': 'boolean',
        'blockType.cblock': 'C block',

        // Common
        'common.remove': 'Remove',
        'common.moveToTop': 'move to top',
    },
    zh: {
        // Home
        'home.title': '欢迎使用 Astras Blocktory',
        'home.whatToDo': '您想要做什么？',
        'home.newExtension': '创建新扩展',
        'home.loadExtension': '加载扩展 (.ab)',
        'home.loadFailed': '加载项目失败: ',

        // NewProject
        'newProject.title': '创建扩展',
        'newProject.name': '名称',
        'newProject.description': '描述',
        'newProject.author': '作者',
        'newProject.license': '许可证',
        'newProject.customID': '自定义ID?',
        'newProject.extensionID': '扩展ID',
        'newProject.customColor': '自定义颜色',
        'newProject.enableTranslate': '启用翻译',
        'newProject.done': '完成',
        'newProject.invalidName': '扩展名称无效!',
        'newProject.invalidID': '扩展ID无效!',
        'newProject.customLicense': '自定义',

        // Editor
        'editor.blocks': '积木',
        'editor.code': '代码',
        'editor.createBlock': '创建新积木',
        'editor.output': '输出',
        'editor.save': '保存',
        'editor.setting': '设置',
        'editor.loading': '加载编辑器中...',
        'editor.flyout': '列表',

        // NewBlock
        'newBlock.title': '新建积木',
        'newBlock.blockPreview': '积木预览',
        'newBlock.opcode': 'opcode (ID)',
        'newBlock.opcodePlaceholder': '输入Opcode (仅 a-z, A-Z)',
        'newBlock.blockType': '积木类型',
        'newBlock.addText': '添加文本',
        'newBlock.addInput': '添加输入',
        'newBlock.saveBlock': '保存积木',
        'newBlock.invalidName': '积木名称无效!',

        // NewInput
        'newInput.title': '添加输入',
        'newInput.preview': '输入预览',
        'newInput.mode': '模式',
        'newInput.textAndNumber': '文本和数字',
        'newInput.dropdown': '下拉菜单',
        'newInput.boolean': '布尔值',
        'newInput.defaultInput': '默认输入',
        'newInput.readonly': '只读',
        'newInput.options': '选项',
        'newInput.back': '返回',
        'newInput.done': '完成',

        // Output Project
        'output.title': '输出项目',
        'output.loading': '加载中...',

        // Block Types
        'blockType.stack': '命令积木',
        'blockType.hat': '帽子积木',
        'blockType.round': '返回值积木',
        'blockType.boolean': '布尔积木',
        'blockType.cblock': 'C型积木',

        // Common
        'common.remove': '删除',
        'common.moveToTop': '移至顶部',
    },
};

// 获取当前语言
export const getCurrentLanguage = () => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
};

// 设置语言
export const setLanguage = (lang) => {
    if (translations[lang]) {
        localStorage.setItem(STORAGE_KEY, lang);
        window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
        return true;
    }
    return false;
};

// 获取翻译文本
export const t = (id) => {
    const lang = getCurrentLanguage();
    return translations[lang]?.[id] || translations[DEFAULT_LANGUAGE]?.[id] || id;
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

    const translate = useCallback((id) => {
        return translations[language]?.[id] || translations[DEFAULT_LANGUAGE]?.[id] || id;
    }, [language]);

    return { t: translate, language };
};

// 导出所有翻译（用于调试）
export const getAllTranslations = () => {
    const lang = getCurrentLanguage();
    return translations[lang] || translations[DEFAULT_LANGUAGE];
};

export default { t, getCurrentLanguage, setLanguage, SUPPORTED_LANGUAGES, useTranslation };
