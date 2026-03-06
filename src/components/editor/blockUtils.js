/**
 * 积木相关工具函数
 */
import { returnValue, getAllValue } from '../../extension/storage.js';

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
                return { ...part, value: part.value[0] || '' };
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
