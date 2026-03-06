/**
 * 输入框部件组件
 */
import { useState, useEffect } from 'react';
import { useTranslation, BLOCK_TYPE_ID } from '../../i18n';
import { VscEye, VscChevronUp } from "react-icons/vsc";
import styles from './editor.module.css';

const InputPart = ({ part, index, onHighlight, onClearHighlight, isHideIndex, setHide, onUpdateId }) => {
    const { t } = useTranslation();
    const defaultId = `input_${index}`;
    const [inputId, setInputId] = useState(part.id || defaultId);

    // 同步外部 part.id 变化
    useEffect(() => {
        setInputId(part.id || defaultId);
    }, [part.id, defaultId]);

    // 处理 ID 变更
    const handleIdChange = (e) => {
        const newId = e.target.value;
        setInputId(newId);
    };

    // 失焦时保存 ID
    const handleIdBlur = () => {
        // 验证 ID 格式：只允许字母、数字、下划线，且不能以数字开头
        const validId = inputId.replace(/^[0-9]+/, '').replace(/[^a-zA-Z0-9_]/g, '') || defaultId;
        setInputId(validId);
        if (onUpdateId) {
            onUpdateId(index, validId);
        }
    };

    return (
        <div className={styles.part}>
            {typeof part === 'object' && (
                <div className={styles.valuePart}>
                    <div className={styles.valuePartTitle}>
                        <div>
                            <span className={styles.valuePartIndex}>#{index + 1}</span>
                            {t(BLOCK_TYPE_ID[part.inputType])}
                            <small style={{ marginLeft: '8px', opacity: 0.6 }}>({part.id || defaultId})</small>
                        </div>
                        <div className={styles.valuePartSettings}>
                            <div
                                onMouseEnter={onHighlight}
                                onMouseLeave={onClearHighlight}
                                style={{ cursor: 'pointer' }}
                                title={t("Seek")}
                                className={styles.valuePartButtons}
                            >
                                <VscEye />
                            </div>
                            <div
                                onClick={() => setHide(index)}
                                style={{ cursor: 'pointer' }}
                                title={t("Setting")}
                                className={styles.valuePartButtons}
                            >
                                <div style={{
                                    transform: isHideIndex === index && "rotate(180deg)",
                                    transition: 'transform 0.2s ease'
                                }}>
                                    <VscChevronUp />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.expandableContent} ${isHideIndex === index ? styles.expanded : ''}`}>
                        <div className={styles.expandableInner}>
                            <hr className={styles.hr} />
                            <div className={styles.idEditor}>
                                <label>{t('Input ID')}:</label>
                                <input
                                    type="text"
                                    value={inputId}
                                    onChange={handleIdChange}
                                    onBlur={handleIdBlur}
                                    placeholder={defaultId}
                                    className={styles.idInput}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputPart;
