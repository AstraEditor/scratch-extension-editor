/**
 * 积木相关工具函数
 */
import { returnValue, getAllValue, setAllValue } from '../../extension/storage.js';
import {t} from '../../i18n/index.js'

/**
 * 预处理积木数据，用于显示（数组类型的 value 取第一项，颜色从 storage 获取）
 */
export const prepareBlockForDisplay = (blockData) => {
    if (!blockData) return blockData;
    const colors = returnValue("comments").color;
    return {
        ...blockData,
        colors: {
            primary: colors[0],
            secondary: colors[1],
            tertiary: colors[2],
        },
        parts: blockData.parts ? blockData.parts.map(part => {
            if (part && typeof part === 'object' && Array.isArray(part.value)) {
                return { ...part, value: part.value[0].name || '' }; // 加个name给下拉框
            }
            return part;
        }) : []
    };
};

/**
 * 保存项目为 JSON 文件
 */
export const saveProject = () => {
    const project = getAllValue();
    const download = document.createElement('a');
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    download.href = URL.createObjectURL(blob);
    download.download = (project[0 /* Comments */]?.name || "project") + ".ab";
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
    URL.revokeObjectURL(download.href);
};

/**
 * 加载项目
 * @param e 事件
 * @param loaded 加载完成的操作
 */

export const loadProject = (e, loaded) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            setAllValue(data);
            loaded();
        } catch (err) {
            alert(t('Failed to load project: ') + err.message);
        }
    };
    reader.readAsText(file);
};