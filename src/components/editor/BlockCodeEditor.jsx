import { useRef, useMemo, forwardRef } from 'react';
import MonacoEditorWrapper from './MonacoEditorWrapper.jsx';
import { BlockType, InputType } from '../../lib/blockSvgRenderer.js';
import { useTranslation, BLOCK_TYPE_ID } from '../../i18n';
import { returnValue } from '../../extension/storage.js';
import VMAPI from './vm-api.js';
import VMAPI_CN from './vm-api-cn.js';
import SCRATCH_API from './scratch-api.js';
import SCRATCH_API_CN from './scratch-api-cn.js';

/**
 * 专门用于编辑 Block 代码的 Monaco 编辑器组件
 * 封装了所有 block 相关的类型定义和语法高亮逻辑
 * 
 * @param {object} props
 * @param {string} props.value - 代码内容
 * @param {function} props.onChange - 内容变化回调
 * @param {object} props.block - 当前编辑的 block 对象
 * @param {string} props.blockName - 当前编辑的 block 名称
 * @param {string} props.height - 编辑器高度
 * @param {object} ref - 暴露的方法：insertText, getValue, setValue, focus
 */
const BlockCodeEditor = forwardRef(({ value, onChange, block, blockName, height = '100%' }, ref) => {
    const { t } = useTranslation();

    // 生成 inputIds 用于高亮
    const inputIds = useMemo(() => {
        if (!block || !block.parts) return [];
        const ids = [];
        block.parts.forEach((part, idx) => {
            if (typeof part === 'object' && part !== null) {
                ids.push(part.id || `input_${idx}`);
            }
        });
        return ids;
    }, [block]);

    // 生成类型定义
    const extraLibs = useMemo(() => {
        if (!block || !block.parts) return [];

        const libs = [];
        const inputDefs = [];

        // 生成 input 类型定义
        let inputIdx = 0;
        block.parts.forEach(part => {
            if (typeof part === 'object' && part !== null) {
                const inputId = part.id || `input_${inputIdx}`;
                const inputType = part.inputType;

                let typeStr = 'any';
                if (inputType === InputType.NUMBER) {
                    typeStr = 'number';
                } else if (inputType === InputType.TEXT || inputType === InputType.TEXT_NUMBER) {
                    typeStr = 'string';
                } else if (inputType === InputType.BOOLEAN) {
                    typeStr = 'boolean';
                } else if (inputType === InputType.DROPDOWN || inputType === InputType.DROPDOWN_READONLY) {
                    typeStr = 'scratchDropdown';
                }

                inputDefs.push('/**');
                inputDefs.push(` * Type: ${t(BLOCK_TYPE_ID[part.inputType])}`);
                inputDefs.push(' *');
                if (inputType !== InputType.BOOLEAN) {
                    inputDefs.push(` * Default Value: ${part.value}`);
                }
                inputDefs.push(' */');
                inputDefs.push(`declare const ${inputId}: ${typeStr};`);
                inputIdx++;
            }
        });

        // 添加 OPCODE 定义（非 EVENT 类型）
        if (block.type !== BlockType.EVENT) {
            const extID = returnValue("comments")?.id || '';
            inputDefs.push('/**');
            inputDefs.push(' * Return the opcode of this block');
            inputDefs.push(` * @returns {string} "${extID}_${blockName || ''}"`);
            inputDefs.push(' */');
            inputDefs.push('declare const OPCODE: string;');
        }

        if (inputDefs.length > 0) {
            libs.push({ content: inputDefs.join('\n'), name: 'inputs.d.ts' });
        }

        // 添加 VM API 类型定义
        const lang = localStorage.getItem("app_language");
        libs.push({ 
            content: lang === "zh" ? VMAPI_CN : VMAPI, 
            name: 'vm-api.d.ts' 
        });
        libs.push({ 
            content: lang === "zh" ? SCRATCH_API_CN : SCRATCH_API, 
            name: 'scratch-api.d.ts' 
        });

        return libs;
    }, [block, blockName, t]);

    return (
        <MonacoEditorWrapper
            ref={ref}
            height={height}
            value={value}
            onChange={onChange}
            inputIds={inputIds}
            extraLibs={extraLibs}
        />
    );
});

BlockCodeEditor.displayName = 'BlockCodeEditor';

export default BlockCodeEditor;
