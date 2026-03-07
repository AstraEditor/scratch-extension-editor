import { getAllValue } from "./storage"
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
        Branches: "Scratch.BlockType.CONDITIONAL"
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
        let isCondition = false;
        let isEvent = false;

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
                blockType = Type.Blocks.Branches;
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

        data.parts.forEach(data => {
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
                        data.value.forEach(data => {
                            menu.push({
                                text: `Scratch.translate("${data.name}")`,
                                value: data.value
                            })
                        })
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
        if (isCondition) return { opcode: id, blockType, branchCount: brachCount.toString(), text: blockText, arguments: blockValue }
        else if (isEvent) return { opcode: id, blockType, isEdgeActivated: false, text: `Scratch.translate("${blockText}")`, arguments: blockValue }
        return { opcode: id, blockType, text: `Scratch.translate("${blockText}")`, arguments: blockValue }
    }

    const spawnExtensionBlocks = () => {
        const Blocks = Extension.blocks;
        const returnList = [];
        Object.keys(Blocks).forEach((opcode, index) => {
            returnList.push(spawnBlock(opcode, Object.values(Blocks)[index]))
        });
        return returnList
    }
    const spawnBlockJS = () => {
        const Blocks = Object.values(Extension.blocks);
        const final = [];
        Blocks.forEach((blk, index) => {
            const id = Object.keys(Extension.blocks)[index]
            if (blk.type === BlockType.EVENT) {
                // 事件积木的生成不同，参考 https://docs.turbowarp.org/development/extensions/hats
                // 因此这里忽略
            } else {
                final.push(`${id} (args) {`)
                let indexOfInput = 0;
                blk.parts.forEach(blkPart => {
                    if (typeof blkPart === 'object') {
                        final.push(`const ${blkPart.id || `input_${indexOfInput}`} = args.${blkPart.id || `input_${indexOfInput}`};`)
                        indexOfInput += 1;
                    }
                })
                final.push(`const OPCODE = "${Extension.comments.id}_${id}";`)
                final.push(blk.code)
                final.push(`}`)
            }
            console.log()
        })
        return final
    }

    const spawnEventBlockJS = () => {
        const Blocks = Object.values(Extension.blocks);
        const final = [];
        Blocks.forEach(blk => {
            if (blk.type === BlockType.EVENT) {
                // 因为事件的触发没有确定的语法，所以直接加入
                final.push(blk.code)
            }
        })
        return final
    }
    let ExtensionText = `
// Name: ${Extension.comments.name}
// ID: ${Extension.comments.id}
// Description: ${Extension.comments.description}
// By: ${Extension.comments.author}
// License: ${Extension.comments.license}

/* Built by Astras Blocktory*/

(function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("${Extension.comments.name} must be run unsandboxed");
    }
    const VM = Scratch.vm;
    class ${Extension.comments.id} {
        constructor(runtime){
            this.runtime = runtime;
        }
        getInfo() {
            return {
                name: "${Extension.comments.name}",
                id: "${Extension.comments.id}",
                color1: "${Extension.comments.color[0]}",
                color2: "${Extension.comments.color[1]}",
                color3: "${Extension.comments.color[2]}",
                blocks: ${replaceClass(JSON.stringify(spawnExtensionBlocks()))},
                menus: ${JSON.stringify(menus)}
            }
        }
        ${spawnBlockJS().join('\n')}
    }
    ${spawnEventBlockJS().join('\n')}
    Scratch.extensions.register(new ${Extension.comments.id}());
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
