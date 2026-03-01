import { getAllValue } from "./storage"
import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";

import { BlockType } from "../lib/blockSvgRenderer.js";

const Type = {
    Blocks: {
        Command: "Scratch.BlockType.COMMAND",
        Hat: "Scratch.BlockType.HAT",
        Boolean: "Scratch.BlockType.BOOLEAN",
        Report: "Scratch.BlockType.REPORT",
        Event: "Scratch.BlockType.EVENT"
    },

    Arguments: {
        String: "Scratch.ArgumentType.STRING",
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
    console.log("Ready to Spawn Extension:")
    console.log(Extension)

    let menus = {};

    const spawnBlock = (id, data) => {
        let blockType;
        switch (data.type) {
            case BlockType.STACK:
                blockType = Type.Blocks.Command;
                break
            case BlockType.HAT:
                blockType = Type.Blocks.Hat;
                break
            case BlockType.BOOLEAN:
                blockType = Type.Blocks.Boolean;
                break
            case BlockType.ROUND:
                blockType = Type.Blocks.Report;
                break
            case BlockType.C_BLOCK:
                blockType = Type.Blocks.Event;
                break
            default:
                blockType = Type.Blocks.Command;
                break
        }

        let blockText = "";
        let blockValue = {};
        data.parts.forEach((data, index) => {
            let inputID = id + index.toString()
            if (typeof data === "string") {
                blockText += data;
            }
            if (typeof data === "object") {
                blockText += `[${inputID}]`;
                let argument = {};
                let menu;
                switch (data.inputType) {
                    case "textNumber":
                        argument["type"] = Type.Arguments.String;
                        argument["defaultValue"] = data.value;
                        break
                    case "dropdown":
                        argument["type"] = Type.Arguments.String;
                        argument["menu"] = inputID
                        menu = [];
                        data.value.forEach(data => {
                            menu.push({
                                text: data,
                                value: data
                            })
                        })
                        menus[inputID] = { acceptReporters: true, items: menu }
                        break
                    case "dropdownReadOnly":
                        argument["type"] = Type.Arguments.String;
                        argument["menu"] = inputID
                        menu = [];
                        data.value.forEach(data => {
                            menu.push({
                                text: data,
                                value: data
                            })
                        })
                        menus[inputID] = { acceptReporters: false, items: menu } // 只需修改 acceptReporters
                        break
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
        return { opcode: id, blockType, text: blockText, arguments: blockValue }
    }

    const spawnExtensionBlocks = () => {
        const Blocks = Extension.blocks;
        const returnList = [];
        Object.keys(Blocks).forEach((opcode, index) => {
            returnList.push(spawnBlock(opcode, Object.values(Blocks)[index]))
        });
        return returnList
    }

    const ExtensionText = `
// Name: ${Extension.comments.name}
// ID: ${Extension.comments.id}
// Description: ${Extension.comments.description}
// By: ${Extension.comments.author}
// License: ${Extension.comments.license}

/* Built by Astras Blocktory*/

(function(Scratch) {
    "use strict";
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
    }
    Scratch.extensions.register(new ${Extension.comments.id}());
})(Scratch)

`
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
        console.log(result);
    } catch (error) {
        console.error('格式化失败:', error);
    }
    return result
}