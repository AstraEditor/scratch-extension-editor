import { useEffect, useState } from 'react';
import Modal from '../modal/modal';
import styles from './monacoSettingsModal.module.css';
import { useTranslation } from '../../i18n';

import { VscSettingsGear, VscCode } from "react-icons/vsc";


const clone = (value) => JSON.parse(JSON.stringify(value));

const setPathValue = (source, path, value) => {
    const next = clone(source);
    let cursor = next;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (typeof cursor[key] !== 'object' || cursor[key] === null) {
            cursor[key] = {};
        }
        cursor = cursor[key];
    }

    cursor[path[path.length - 1]] = value;
    return next;
};

const toInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const MonacoSettingsModal = (props) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('basic');
    const [draft, setDraft] = useState(clone(props.config));
    const [jsonText, setJsonText] = useState(JSON.stringify(props.config, null, 2));
    const [error, setError] = useState('');

    useEffect(() => {
        setDraft(clone(props.config));
        setJsonText(JSON.stringify(props.config, null, 2));
        setError('');
    }, [props.config]);

    const updateDraft = (path, value) => {
        const next = setPathValue(draft, path, value);
        setDraft(next);
        setJsonText(JSON.stringify(next, null, 2));
        setError('');
    };

    const applyBasic = () => {
        props.onApply(draft);
        props.close();
    };

    const applyAdvanced = () => {
        try {
            const parsed = JSON.parse(jsonText);
            props.onApply(parsed);
            props.close();
        } catch {
            setError(t('Invalid JSON. Please check syntax.'));
        }
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 2));
            setError('');
        } catch {
            setError(t('Invalid JSON. Please check syntax.'));
        }
    };

    const resetDefault = () => {
        const next = clone(props.defaultConfig);
        setDraft(next);
        setJsonText(JSON.stringify(next, null, 2));
        setError('');
    };

    const options = draft.options || {};
    const compilerOptions = draft.languageService?.compilerOptions || {};

    return (
        <Modal
            close={props.close}
            title={t('Monaco Settings')}
            width="78%"
            height="82%"
        >
            <div className={styles.container}>
                <div className={styles.tabs}>
                    <button
                        className={`${activeTab === 'basic' ? styles.tabButtonActive : styles.tabButton}`}
                        onClick={() => setActiveTab('basic')}
                        title={t('Basic')}
                    >
                        <VscSettingsGear />
                    </button>
                    <button
                        className={`${activeTab === 'advanced' ? styles.tabButtonActive : styles.tabButton}`}
                        onClick={() => setActiveTab('advanced')}
                        title={t('Advanced JSON')}
                    >
                        <VscCode/>
                    </button>
                </div>

                {activeTab === 'basic' ? (
                    <div className={styles.content}>
                        <h3>{t('Appearance')}</h3>
                        <div className={styles.grid}>
                            <label>{t('Theme')}</label>
                            <select value={draft.theme || 'vscode-dark-plus'} onChange={(e) => updateDraft(['theme'], e.target.value)}>
                                <option value="vscode-dark-plus">VS Code Dark+</option>
                                <option value="vs-dark">VS Dark</option>
                                <option value="vs">VS Light</option>
                                <option value="hc-black">High Contrast Dark</option>
                                <option value="hc-light">High Contrast Light</option>
                            </select>

                            <label>{t('Font Size')}</label>
                            <input
                                type="number"
                                value={options.fontSize ?? 14}
                                onChange={(e) => updateDraft(['options', 'fontSize'], toInteger(e.target.value, 14))}
                            />

                            <label>{t('Line Height')}</label>
                            <input
                                type="number"
                                value={options.lineHeight ?? 22}
                                onChange={(e) => updateDraft(['options', 'lineHeight'], toInteger(e.target.value, 22))}
                            />

                            <label>{t('Font Family')}</label>
                            <input
                                type="text"
                                value={options.fontFamily ?? ''}
                                onChange={(e) => updateDraft(['options', 'fontFamily'], e.target.value)}
                            />

                            <label>{t('Minimap')}</label>
                            <input
                                type="checkbox"
                                checked={options.minimap?.enabled !== false}
                                onChange={(e) => updateDraft(['options', 'minimap', 'enabled'], e.target.checked)}
                            />

                            <label>{t('Enable Cursor Smooth Animation')}</label>
                            <input
                                type="checkbox"
                                checked={options.cursorSmoothCaretAnimation === "on"}
                                onChange={(e) => updateDraft(['options', 'cursorSmoothCaretAnimation'], e.target.checked ? "on" : "off")}
                            />
                        </div>

                        <h3>{t('Editor Behavior')}</h3>
                        <div className={styles.grid}>
                            <label>{t('Word Wrap')}</label>
                            <select
                                value={options.wordWrap ?? 'off'}
                                onChange={(e) => updateDraft(['options', 'wordWrap'], e.target.value)}
                            >
                                <option value="off">{t('Off')}</option>
                                <option value="on">{t('On')}</option>
                                <option value="wordWrapColumn">{t('Word Wrap Column')}</option>
                                <option value="bounded">{t('Bounded')}</option>
                            </select>

                            <label>{t('Render Whitespace')}</label>
                            <select
                                value={options.renderWhitespace ?? 'selection'}
                                onChange={(e) => updateDraft(['options', 'renderWhitespace'], e.target.value)}
                            >
                                <option value="none">{t('None')}</option>
                                <option value="boundary">{t('Boundary')}</option>
                                <option value="selection">{t('Selection')}</option>
                                <option value="trailing">{t('Trailing')}</option>
                                <option value="all">{t('All')}</option>
                            </select>

                            <label>{t('Cursor Blinking')}</label>
                            <select
                                value={options.cursorBlinking ?? 'blink'}
                                onChange={(e) => updateDraft(['options', 'cursorBlinking'], e.target.value)}
                            >
                                <option value="blink">blink</option>
                                <option value="smooth">smooth</option>
                                <option value="phase">phase</option>
                                <option value="expand">expand</option>
                                <option value="solid">solid</option>
                            </select>

                            <label>{t('Tab Size')}</label>
                            <input
                                type="number"
                                value={options.tabSize ?? 4}
                                onChange={(e) => updateDraft(['options', 'tabSize'], toInteger(e.target.value, 4))}
                            />

                            <label>{t('Insert Spaces')}</label>
                            <input
                                type="checkbox"
                                checked={options.insertSpaces !== false}
                                onChange={(e) => updateDraft(['options', 'insertSpaces'], e.target.checked)}
                            />

                            <label>{t('Smooth Scrolling')}</label>
                            <input
                                type="checkbox"
                                checked={!!options.smoothScrolling}
                                onChange={(e) => updateDraft(['options', 'smoothScrolling'], e.target.checked)}
                            />

                            <label>{t('Mouse Wheel Zoom')}</label>
                            <input
                                type="checkbox"
                                checked={!!options.mouseWheelZoom}
                                onChange={(e) => updateDraft(['options', 'mouseWheelZoom'], e.target.checked)}
                            />

                            <label>{t('Format On Type')}</label>
                            <input
                                type="checkbox"
                                checked={!!options.formatOnType}
                                onChange={(e) => updateDraft(['options', 'formatOnType'], e.target.checked)}
                            />

                            <label>{t('Format On Paste')}</label>
                            <input
                                type="checkbox"
                                checked={!!options.formatOnPaste}
                                onChange={(e) => updateDraft(['options', 'formatOnPaste'], e.target.checked)}
                            />

                            <label>{t('Bracket Pair Colorization')}</label>
                            <input
                                type="checkbox"
                                checked={options.bracketPairColorization?.enabled !== false}
                                onChange={(e) => updateDraft(['options', 'bracketPairColorization', 'enabled'], e.target.checked)}
                            />

                            <label>{t('Indentation Guides')}</label>
                            <input
                                type="checkbox"
                                checked={options.guides?.indentation !== false}
                                onChange={(e) => updateDraft(['options', 'guides', 'indentation'], e.target.checked)}
                            />

                            <label>{t('Bracket Pair Guides')}</label>
                            <input
                                type="checkbox"
                                checked={options.guides?.bracketPairs !== false}
                                onChange={(e) => updateDraft(['options', 'guides', 'bracketPairs'], e.target.checked)}
                            />

                            <label>{t('Suggest On Trigger Characters')}</label>
                            <input
                                type="checkbox"
                                checked={options.suggestOnTriggerCharacters !== false}
                                onChange={(e) => updateDraft(['options', 'suggestOnTriggerCharacters'], e.target.checked)}
                            />

                            <label>{t('Quick Suggestions')}</label>
                            <input
                                type="checkbox"
                                checked={options.quickSuggestions !== false}
                                onChange={(e) => updateDraft(['options', 'quickSuggestions'], e.target.checked)}
                            />
                        </div>

                        <h3>{t('JavaScript / TypeScript')}</h3>
                        <div className={styles.grid}>
                            <label>{t('Check JS')}</label>
                            <input
                                type="checkbox"
                                checked={!!compilerOptions.checkJs}
                                onChange={(e) => updateDraft(['languageService', 'compilerOptions', 'checkJs'], e.target.checked)}
                            />

                            <label>{t('Strict Mode')}</label>
                            <input
                                type="checkbox"
                                checked={!!compilerOptions.strict}
                                onChange={(e) => updateDraft(['languageService', 'compilerOptions', 'strict'], e.target.checked)}
                            />

                            <label>{t('Script Target')}</label>
                            <select
                                value={compilerOptions.target ?? 'ESNext'}
                                onChange={(e) => updateDraft(['languageService', 'compilerOptions', 'target'], e.target.value)}
                            >
                                <option value="ES5">ES5</option>
                                <option value="ES2015">ES2015</option>
                                <option value="ES2016">ES2016</option>
                                <option value="ES2017">ES2017</option>
                                <option value="ES2018">ES2018</option>
                                <option value="ES2019">ES2019</option>
                                <option value="ES2020">ES2020</option>
                                <option value="ESNext">ESNext</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.advancedHint}>{t('Advanced mode supports full Monaco config via JSON!')}</div>
                        <textarea
                            className={styles.jsonInput}
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.footer}>
                    <button onClick={props.close}>{t('Cancel')}</button>
                    <button onClick={resetDefault}>{t('Reset Defaults')}</button>
                    {activeTab === 'advanced' && (
                        <button onClick={formatJson}>{t('Format JSON')}</button>
                    )}
                    <button onClick={activeTab === 'advanced' ? applyAdvanced : applyBasic}>
                        {t('Apply')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MonacoSettingsModal;