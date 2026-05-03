/**
 * 积木相关工具函数
 */
import { getAllValue, returnValue, setAllValue } from '../../extension/storage.js';
import {t} from '../../i18n/index.js'
import { toast } from '../toast/toast.jsx';

/**
 * 预处理积木数据，用于显示（数组类型的 value 取第一项，颜色从 storage 获取）
 */
export const prepareBlockForDisplay = (blockData) => {
    if (!blockData) return blockData;
    const colors = returnValue("comments").color;
    const extBlockIconURI = returnValue("comments").blockIconURI;

    // 合并 blockConfig，扩展级别的 blockIconURI 作为 fallback
    const blockConfig = {
        ...(blockData.blockConfig || {}),
    };
    if (!blockConfig.blockIconURI && extBlockIconURI) {
        blockConfig.blockIconURI = extBlockIconURI;
    }

    return {
        ...blockData,
        colors: {
            primary: colors[0],
            secondary: colors[1],
            tertiary: colors[2],
        },
        blockConfig,
        parts: blockData.parts ? blockData.parts.map(part => {
            if (part && typeof part === 'object' && Array.isArray(part.value)) {
                const firstValue = part.value[0];
                return {
                    ...part,
                    value: typeof firstValue === 'object' && firstValue !== null
                        ? (firstValue.name || '')
                        : (firstValue || '')
                };
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
    download.download = (project.comments.name || "project") + ".ab";
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
            toast.error(t('Failed to load project: ') + err.message);
        }
    };
    reader.readAsText(file);
};
