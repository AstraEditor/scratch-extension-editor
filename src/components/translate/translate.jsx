import { useState, useEffect, useCallback } from "react";
import { returnValue, setValueTo } from "../../extension/storage";
import { InputType, renderBlockToHTML, renderConstList } from "../../lib/blockSvgRenderer";
import { prepareBlockForDisplay } from '../editor/blockUtils.js';
import { useTranslation } from '../../i18n';
import styles from './translate.module.css';
import back from '../main/back.svg';

// 支持的翻译目标语言 (MyMemory API)
const TRANSLATE_LANGUAGES = [
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'pt-PT', name: 'Português (Portugal)' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ไทย' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'uk', name: 'Українська' },
    { code: 'cs', name: 'Čeština' },
];

// MyMemory Translation API
// 文档：https://mymemory.translated.net/doc/spec.php
const translateText = async (text, targetLang) => {
    if (!text || text.trim() === '') return text;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        }

        // 配额用完时返回提示
        if (data && data.responseStatus === 403) {
            throw new Error('Translation quota exceeded');
        }

        return text;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
};

const Translate = props => {
    const { t } = useTranslation();

    // 状态
    const [targetLang, setTargetLang] = useState('zh-CN');
    const [translations, setTranslations] = useState({}); // { "original text": "translated text" }
    const [allTexts, setAllTexts] = useState([]); // 所有需要翻译的文本
    const [blockTextMap, setBlockTextMap] = useState({}); // { blockId: [texts] }
    const [jsTexts, setJsTexts] = useState([]); // 来自 publicJS 的文本列表
    const [blockCodeTexts, setBlockCodeTexts] = useState({}); // 来自积木代码的文本
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateProgress, setTranslateProgress] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [showOnlyUntranslated, setShowOnlyUntranslated] = useState(false);
    const [editingTexts, setEditingTexts] = useState(new Set()); // 正在编辑的文本

    // 获取所有需要翻译的文本
    const getAllTexts = useCallback(() => {
        const textSet = new Set();
        const blockMap = {};
        const jsTexts = []; // 来自 publicJS 的文本
        const blockCodeTexts = {}; // { blockId: [texts] } 来自积木代码的文本
        const canJoin = value => {
            return typeof value === 'string' && renderConstList.indexOf(value) === -1;
        };

        // 从积木中提取文本
        Object.entries(returnValue('blocks')).forEach(([name, blk]) => {
            if (!blk || blk === "---") return;
            // 文字标签
            if (blk.type === "label") {
                blockMap[name] = [];
                if (blk.text && canJoin(blk.text)) {
                    textSet.add(blk.text);
                    blockMap[name].push(blk.text);
                }
                return;
            }
            if (!blk.parts) return;
            blockMap[name] = [];
            blk.parts.forEach(blkPart => {
                if (typeof blkPart === 'object') {
                    switch (blkPart.inputType) {
                        case InputType.TEXT:
                        case InputType.TEXT_NUMBER:
                            if (canJoin(blkPart.value)) {
                                textSet.add(blkPart.value);
                                blockMap[name].push(blkPart.value);
                            }
                            break;
                        case InputType.DROPDOWN:
                        case InputType.DROPDOWN_READONLY:
                            if (Array.isArray(blkPart.value)) {
                                blkPart.value.forEach(v => {
                                    if (v && typeof v === 'object' && canJoin(v.name)) {
                                        textSet.add(v.name);
                                        blockMap[name].push(v.name);
                                    }
                                });
                            }
                            break;
                        default:
                            break;
                    }
                } else if (typeof blkPart === 'string' && canJoin(blkPart)) {
                    textSet.add(blkPart);
                    blockMap[name].push(blkPart);
                }
            });

            // 从积木代码中提取 Scratch.translate() 调用
            if (blk.code) {
                const codeTexts = extractTranslateCalls(blk.code);
                if (codeTexts.length > 0) {
                    blockCodeTexts[name] = codeTexts;
                    codeTexts.forEach(text => {
                        textSet.add(text);
                    });
                }
            }
        });

        // 从 publicJS 中提取 Scratch.translate() 调用的文本
        const publicJS = returnValue('publicJS') || '';
        if (publicJS) {
            const codeTexts = extractTranslateCalls(publicJS);
            codeTexts.forEach(text => {
                if (text && text.trim()) {
                    textSet.add(text);
                    jsTexts.push(text);
                }
            });
        }

        return { texts: Array.from(textSet), blockMap, jsTexts, blockCodeTexts };
    }, []);

    // 从代码中提取 Scratch.translate() 调用
    const extractTranslateCalls = (code) => {
        const texts = [];
        if (!code) return texts;

        // 匹配 Scratch.translate("...") 和 Scratch.translate('...')
        const translateRegex = /Scratch\.translate\s*\(\s*(['"`])((?:\\.|(?!\1)[^\\])*?)\1\s*\)/g;
        let match;
        while ((match = translateRegex.exec(code)) !== null) {
            const text = match[2]
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
            if (text && text.trim()) {
                texts.push(text);
            }
        }
        return texts;
    };

    // 初始化
    useEffect(() => {
        const { texts, blockMap, jsTexts: extractedJsTexts, blockCodeTexts: extractedBlockCodeTexts } = getAllTexts();
        setAllTexts(texts);
        setBlockTextMap(blockMap);
        setJsTexts(extractedJsTexts || []);
        setBlockCodeTexts(extractedBlockCodeTexts || {});

        // 加载已有的翻译
        const savedTranslate = returnValue('translate') || [];
        const savedMap = {};
        savedTranslate.forEach(item => {
            if (item && item.id) {
                savedMap[item.id] = item.string || {};
            }
        });
        setTranslations(savedMap);
    }, [getAllTexts]);

    // 保存翻译
    const saveTranslations = () => {
        const translateData = Object.entries(translations).map(([lang, strings]) => ({
            id: lang,
            string: strings
        }));
        setValueTo('translate', translateData);
    };


    // 翻译单个文本
    const handleTranslateOne = async (originalText) => {
        setIsTranslating(true);
        try {
            const translated = await translateText(originalText, targetLang);
            setTranslations(prev => ({
                ...prev,
                [targetLang]: {
                    ...prev[targetLang],
                    [originalText]: translated
                }
            }));
        } catch (error) {
            alert(t('Translation failed') || '翻译失败');
        }
        setIsTranslating(false);
    };

    // 翻译所有文本
    const handleTranslateAll = async () => {
        setIsTranslating(true);
        setTranslateProgress(0);

        const newTranslations = { ...translations[targetLang] };
        const total = allTexts.length;

        for (let i = 0; i < total; i++) {
            const text = allTexts[i];
            if (!newTranslations[text]) {
                try {
                    const translated = await translateText(text, targetLang);
                    newTranslations[text] = translated;
                    setTranslations(prev => ({
                        ...prev,
                        [targetLang]: newTranslations
                    }));
                } catch (error) {
                    newTranslations[text] = text; // 失败时保留原文
                }
                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            setTranslateProgress(Math.round((i + 1) / total * 100));
        }

        setIsTranslating(false);
    };

    // 手动编辑翻译
    const handleEditTranslation = (originalText, newValue) => {
        setTranslations(prev => {
            const updated = {
                ...prev,
                [targetLang]: {
                    ...prev[targetLang],
                    [originalText]: newValue
                }
            };
            // 如果清空了翻译，删除该条目
            if (newValue.trim() === '') {
                delete updated[targetLang][originalText];
            }
            return updated;
        });
    };

    // 输入框失去焦点时，从编辑集合中移除
    const handleInputBlur = (originalText) => {
        setEditingTexts(prev => {
            const newSet = new Set(prev);
            newSet.delete(originalText);
            return newSet;
        });
    };

    // 输入框获得焦点时，添加到编辑集合
    const handleInputFocus = (originalText) => {
        setEditingTexts(prev => new Set(prev).add(originalText));
    };

    // 获取已翻译的文本（如果有的话）
    const getTranslatedText = (originalText) => {
        return translations[targetLang]?.[originalText] || originalText;
    };

    // 准备带有翻译的积木数据用于显示
    const prepareBlockWithTranslations = (blockData) => {
        const translatedBlock = JSON.parse(JSON.stringify(blockData));

        const translatePart = (part) => {
            if (typeof part === 'string') {
                return getTranslatedText(part);
            }
            if (part && typeof part === 'object') {
                const translatedPart = { ...part };
                switch (part.inputType) {
                    case InputType.TEXT:
                    case InputType.TEXT_NUMBER:
                        if (translations[targetLang]?.[part.value]) {
                            translatedPart.value = translations[targetLang][part.value];
                        }
                        break;
                    case InputType.DROPDOWN:
                    case InputType.DROPDOWN_READONLY:
                        if (Array.isArray(part.value)) {
                            translatedPart.value = part.value.map(v => ({
                                ...v,
                                name: translations[targetLang]?.[v.name] || v.name
                            }));
                        }
                        break;
                    default:
                        break;
                }
                return translatedPart;
            }
            return part;
        };

        if (translatedBlock.parts) {
            translatedBlock.parts = translatedBlock.parts.map(translatePart);
        }
        if (translatedBlock.branchParts) {
            translatedBlock.branchParts = translatedBlock.branchParts.map(branch =>
                branch.map(translatePart)
            );
        }

        return translatedBlock;
    };

    // 过滤显示的文本
    const filteredTexts = allTexts.filter(text => {
        if (typeof text !== 'string') return false;
        const matchesSearch = text.toLowerCase().includes(searchFilter.toLowerCase());
        const isUntranslated = !translations[targetLang]?.[text];
        const isBeingEdited = editingTexts.has(text);
        // 如果正在编辑，始终显示；否则按"仅显示未翻译"过滤
        return matchesSearch && (isBeingEdited || !showOnlyUntranslated || isUntranslated);
    });

    // 渲染积木预览（带翻译）
    const renderBlockPreview = (blockId, blockData) => {
        const translatedBlock = prepareBlockWithTranslations(blockData);
        return (
            <div
                key={blockId}
                className={styles.blockPreview}
                dangerouslySetInnerHTML={{
                    __html: renderBlockToHTML(prepareBlockForDisplay(translatedBlock))
                }}
            />
        );
    };

    // 统计信息
    const translatedCount = Object.keys(translations[targetLang] || {}).filter(k => allTexts.includes(k)).length;
    const totalCount = allTexts.length;

    return (
        <div className={styles.translateContainer}>
            {/* 头部 */}
            <div className={styles.header}>
                <img className={styles.backButton} onClick={() => { props.close(); saveTranslations() }} src={back} alt="Back" />
                <h2>{t('Translation Manager')}</h2>
            </div>

            {/* 工具栏 */}
            <div className={styles.toolbar}>
                <div className={styles.langSelect}>
                    <label>{t('Target Language')}:</label>
                    <select
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                    >
                        {TRANSLATE_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder={t('Search texts...')}
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                    />
                </div>

                <div className={styles.filterToggle}>
                    <label>
                        <input
                            type="checkbox"
                            checked={showOnlyUntranslated}
                            onChange={e => setShowOnlyUntranslated(e.target.checked)}
                        />
                        {t('Show only untranslated')}
                    </label>
                </div>

                <div className={styles.progressInfo}>
                    {translatedCount} / {totalCount} {t('translated')}
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(translatedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className={styles.actionBar}>
                <button
                    className={styles.translateAllBtn}
                    onClick={handleTranslateAll}
                    disabled={isTranslating || allTexts.length === 0}
                >
                    {isTranslating
                        ? `${t('Translating...')} ${translateProgress}%`
                        : t('Translate All')
                    }
                </button>
            </div>

            {/* 主内容区 */}
            <div className={styles.mainContent}>
                {/* 文本列表 */}
                <div className={styles.textListPanel}>
                    <div className={styles.panelHeader}>
                        {t('Texts to Translate')}
                        <span className={styles.countBadge}>{filteredTexts.length}</span>
                    </div>
                    <div className={styles.textList}>
                        {filteredTexts.length === 0 ? (
                            <div className={styles.emptyState}>
                                {t('No texts found')}
                            </div>
                        ) : (
                            filteredTexts.map(text => {
                                const isFromJs = jsTexts.includes(text);
                                // 找出该文本来自哪些积木的代码
                                const fromBlockIds = Object.entries(blockCodeTexts)
                                    .filter(([_, texts]) => texts.includes(text))
                                    .map(([blockId]) => blockId);
                                const isFromBlockCode = fromBlockIds.length > 0;
                                return (
                                    <div key={text} className={styles.textItem}>
                                        <div className={styles.originalText}>
                                            <span className={styles.textLabel}>{t('Original')}:</span>
                                            <code>{text}</code>
                                            {isFromJs && (
                                                <span className={styles.jsBadge} title={t('From JavaScript code')}>
                                                    JS
                                                </span>
                                            )}
                                            {isFromBlockCode && fromBlockIds.map(blockId => (
                                                <span key={blockId} className={styles.codeBadge} title={t('From block code')}>
                                                    {blockId}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={styles.translatedText}>
                                            <span className={styles.textLabel}>{t('Translation')}:</span>
                                            <input
                                                type="text"
                                                value={translations[targetLang]?.[text] || ''}
                                                onChange={e => handleEditTranslation(text, e.target.value)}
                                                onFocus={() => handleInputFocus(text)}
                                                onBlur={() => handleInputBlur(text)}
                                                placeholder={t('Enter translation')}
                                            />
                                            <button
                                                className={styles.translateBtn}
                                                onClick={() => handleTranslateOne(text)}
                                                disabled={isTranslating}
                                                title={t('Auto translate')}
                                            >
                                                <TranslateIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 积木预览面板 */}
                <div className={styles.blockPreviewPanel}>
                    <div className={styles.panelHeader}>
                        {t('Block Preview')}
                    </div>
                    <div className={styles.blockList}>
                        {Object.entries(returnValue('blocks')).map(([blockId, blockData]) => {
                            const blockTexts = blockTextMap[blockId] || [];
                            const hasMatchingText = blockTexts.some(text =>
                                typeof text === 'string' && text.toLowerCase().includes(searchFilter.toLowerCase())
                            );
                            if (searchFilter && !hasMatchingText) return null;
                            if (blockData === "---") return null;

                            return (
                                <div key={blockId} className={styles.blockItem}>
                                    <div className={styles.blockId}>
                                        <code>{blockId}</code>
                                    </div>
                                    {blockData && blockData.type === "label" ? (
                                        <div className={styles.labelPreview}>
                                            <span className={styles.labelText}>{getTranslatedText(blockData.text || '')}</span>
                                        </div>
                                    ) : (
                                        renderBlockPreview(blockId, blockData)
                                    )}
                                    <div className={styles.blockTexts}>
                                        {blockTexts.map((txt, idx) => (
                                            <div key={idx} className={styles.blockTextItem}>
                                                <span className={styles.original}>{txt}</span>
                                                {translations[targetLang]?.[txt] && (
                                                    <span className={styles.translated}>
                                                        → {translations[targetLang][txt]}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 翻译图标组件
const TranslateIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3M22 22l-5-10-5 10M14 18h6" />
    </svg>
);

export default Translate;
