import { getAllValue, returnValue } from "./storage"
import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";

import { BlockType } from "../lib/blockSvgRenderer.js";

const Type = {
    Blocks: {
        Command: "Scratch.BlockType.COMMAND",
        Hat: "Scratch.BlockType.HAT",
        Event: "Scratch.BlockType.EVENT",
        Boolean: "Scratch.BlockType.BOOLEAN",
        Report: "Scratch.BlockType.REPORTER",
        Branches: "Scratch.BlockType.CONDITIONAL",
        Loop: "Scratch.BlockType.LOOP",
    },

    Arguments: {
        String: "Scratch.ArgumentType.STRING",
        Number: "Scratch.ArgumentType.NUMBER",
        Boolean: "Scratch.ArgumentType.BOOLEAN"
    }

}
const replaceClass = Ext => {
    let returnExt = Ext;
    Object.values(Type.Blocks).forEach(value => {
        returnExt = returnExt.replaceAll(`"${value}"`, value);
    });
    Object.values(Type.Arguments).forEach(value => {
        returnExt = returnExt.replaceAll(`"${value}"`, value);
    });
    return returnExt;
}

export async function spawnExtension() {
    const Extension = getAllValue();
    console.clear();
    console.log("Ready to Spawn Extension:")
    console.log(Extension)

    let menus = {};

    const spawnBlock = (id, data) => {
        if (!data) data = {};
        
        let isCondition = false;
        let isEvent = false;
        let isEnd = false;
        let isLoop = false;
        
        if (data.blockConfig) { 
            if (!data.blockConfig.hasNextConnection) isEnd = true;
            if (data.blockConfig.isLoop) isLoop = true;
        }

        let blockType;
        switch (data.type) {
            case BlockType.STACK:
                blockType = Type.Blocks.Command;
                break
            case BlockType.HAT:
                blockType = Type.Blocks.Hat;
                break
            case BlockType.EVENT:
                blockType = Type.Blocks.Event;
                isEvent = true;
                break
            case BlockType.BOOLEAN:
                blockType = Type.Blocks.Boolean;
                break
            case BlockType.ROUND:
                blockType = Type.Blocks.Report;
                break
            case BlockType.C_BLOCK:
            case BlockType.C_BLOCK_END:
                if (data.type === BlockType.C_BLOCK_END) isEnd = true;

                if (isLoop) blockType = Type.Blocks.Loop;
                else blockType = Type.Blocks.Branches;

                isCondition = true;
                break
            default:
                blockType = Type.Blocks.Command;
                break
        }

        // 加入的文本
        let blockText;
        if (isCondition) {
            blockText = [""];
        } else {
            blockText = "";
        }
        let blockValue = {};
        let indexOfinput = 0;
        let brachCount = 1;
        if (!blockType) blockType = Type.Blocks.Command;
        
        // 安全处理 parts
        const parts = data.parts || [];
        parts.forEach(data => {
            let inputID = data.id || `input_${indexOfinput}`;
            if (typeof data === "string") {
                // 下一个分支
                if (data === "_NextBrach_") {
                    brachCount += 1;
                    if (isCondition) {
                        blockText[blockText.length - 1] = `Scratch.translate("${blockText[blockText.length - 1]}")`;
                        blockText.push("");
                    } //防止哪个人给不是分支加这个导致爆炸
                } else {
                    if (isCondition) blockText[blockText.length - 1] += data;
                    else blockText += data;
                }
            }
            if (typeof data === "object") {
                indexOfinput += 1;
                if (isCondition) blockText[blockText.length - 1] += `[${inputID}]`;
                else blockText += `[${inputID}]`;
                let argument = {};
                let menu;
                switch (data.inputType) {
                    case "text":
                    case "textNumber":
                        argument["type"] = Type.Arguments.String;
                        argument["defaultValue"] = `Scratch.translate("${data.value}")`
                        break
                    case "number":
                        {
                            const numericValue = Number(data.value);
                            argument["type"] = Type.Arguments.Number;
                            argument["defaultValue"] = Number.isFinite(numericValue) ? numericValue : 0;
                        }
                        break
                    case "dropdown":
                    case "dropdownReadOnly":
                        argument["type"] = Type.Arguments.String;
                        argument["menu"] = inputID
                        menu = [];
                        // 安全处理 dropdown value
                        if (Array.isArray(data.value)) {
                            data.value.forEach(item => {
                                if (item && typeof item === 'object') {
                                    menu.push({
                                        text: `Scratch.translate("${item.name || ''}")`,
                                        value: item.value || ''
                                    });
                                }
                            });
                        }
                        menus[inputID] = {
                            acceptReporters: (data.inputType === "dropdown"), // 关键区别
                            items: menu
                        };
                        break;
                    case "boolean":
                        argument["type"] = Type.Arguments.Boolean;
                        break
                    default:
                        argument["type"] = Type.Arguments.String;
                        break

                }
                blockValue[inputID] = argument;
            }
        })
        if (isCondition) {
            blockText[blockText.length - 1] = `Scratch.translate("${blockText[blockText.length - 1]}")`;
        }
        //是否是分支
        if (isCondition) return { opcode: id, blockType, branchCount: brachCount.toString(), isTerminal: isEnd ,text: blockText, arguments: blockValue  }
        else if (isEvent) return { opcode: id, blockType, isEdgeActivated: false, text: `Scratch.translate("${blockText}")`, isTerminal: isEnd, arguments: blockValue }
        return { opcode: id, blockType, text: `Scratch.translate("${blockText}")`, isTerminal: isEnd, arguments: blockValue }
    }

    const spawnExtensionBlocks = () => {
        const Blocks = Extension.blocks || {};
        const returnList = [];
        Object.keys(Blocks).forEach((opcode) => {
            const blockData = Blocks[opcode];
            if (blockData) {
                returnList.push(spawnBlock(opcode, blockData));
            }
        });
        return returnList;
    }
    const spawnBlockJS = () => {
        const Blocks = Extension.blocks || {};
        const final = [];
        Object.keys(Blocks).forEach((id, index) => {
            const blk = Blocks[id];
            if (!blk) return;
            
            if (blk.type === BlockType.EVENT) {
                // 事件积木的生成不同，参考 https://docs.turbowarp.org/development/extensions/hats
                // 因此这里忽略
            } else {
                final.push(`${id} (args) {`)
                let indexOfInput = 0;
                if (blk.parts && Array.isArray(blk.parts)) {
                    blk.parts.forEach(blkPart => {
                        if (typeof blkPart === 'object') {
                            final.push(`const ${blkPart.id || `input_${indexOfInput}`} = args.${blkPart.id || `input_${indexOfInput}`};`)
                            indexOfInput += 1;
                        }
                    })
                }
                final.push(blk.code || '')
                final.push(`}`)
            }
        })
        return final;
    }

    const getAllOPCODEConst = () => {
        const ids = [];
        const blocksData = returnValue('blocks') || {};
        const commentsData = returnValue('comments') || {};
        
        Object.keys(blocksData).forEach((name) => {
            const id = (commentsData['id'] || 'extension') + '_' + name;
            const text = `const ${id} = "${id}"`;
            ids.push(text);
        });

        return ids.join('\n');
    }

    const spawnTranslate = () => {
        const translateList = returnValue('translate') || [];
        const returnList = {};
        const convert = {
            'zh-CN': 'zh-cn'
        }
        translateList.forEach(value => {
            if (!value || !value.id) return; // 跳过无效条目
            const langKey = convert[value.id] || value.id;
            returnList[langKey] = {};
            // 直接使用 string 属性中的 key（原始代码中已包含下划线）
            const stringObj = value.string;
            if (stringObj && typeof stringObj === 'object') {
                Object.entries(stringObj).forEach(([id, str]) => {
                    returnList[langKey][id] = str;
                });
            }
        });
        return returnList;
    }
    console.log(1)
    
    // 安全获取 comments 数据
    const extComments = Extension.comments || {};
    const extName = extComments.name || 'Untitled Extension';
    const extId = extComments.id || 'untitledExtension';
    const extDesc = extComments.description || '';
    const extAuthor = extComments.author || '';
    const extLicense = extComments.license || 'MPL-2.0';
    const extColor = extComments.color || ['#0FBD8C', '#0DA57A', '#0B8E69'];
    
    let ExtensionText = `
// Name: ${extName}
// ID: ${extId}
// Description: ${extDesc}
// By: ${extAuthor}
// License: ${extLicense}

/* Built by AstraBlocktory*/
Scratch.translate.setup(${JSON.stringify(spawnTranslate())});
(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("${extName} must be run unsandboxed");
    }
    const VM = Scratch.vm;

    // opcode constants for all blocks
    ${getAllOPCODEConst()}

    // Public JS
    ${Extension.publicJS || ''}
    
    class ${extId} {
        getInfo() {
            return {
                name: "${extName}",
                id: "${extId}",
                color1: "${extColor[0] || '#0FBD8C'}",
                color2: "${extColor[1] || '#0DA57A'}",
                color3: "${extColor[2] || '#0B8E69'}",
                blocks: ${replaceClass(JSON.stringify(spawnExtensionBlocks()))},
                menus: ${JSON.stringify(menus)}
            }
        }
        ${spawnBlockJS().join('\n')}
    }
    Scratch.extensions.register(new ${extId}());
})(Scratch)

`
    ExtensionText = ExtensionText.replace(
        /"Scratch\.translate\(\\"((?:[^"\\]|\\.)*)\\"\)"/g,
        'Scratch.translate("$1")'
    );

    const options = {
        parser: 'babel',
        plugins: [parserBabel, parserEstree],
        printWidth: 80,
        tabWidth: 4,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
    };
    let result = ExtensionText;
    try {
        result = await prettier.format(ExtensionText, options);
    } catch (error) {
        console.error('格式化失败:', error);
    }
    return result
}
