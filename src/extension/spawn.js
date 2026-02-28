import { getAllValue } from "./storage"
import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";


export async function spawnExtension() {
    const Extension = getAllValue();

    let menus = {};

    const spawnBlock = (id, data) => {
        let blockType;
        switch (data.type) {
            case "stack":
                blockType = "command";
                break
            default:
                blockType = "command";
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
                        argument["type"] = "Scratch.ArgumentType.STRING";
                        argument["defaultValue"] = data.value;
                        break
                    case "dropdown":
                        argument["type"] = "Scratch.ArgumentType.STRING";
                        argument["menu"] = inputID
                        menu = [];
                        data.value.forEach((data, index) => {
                            menu.push({
                                text: data,
                                value: data
                            })
                        })
                        menus[inputID] = { acceptReporters: true, items: menu }
                        break
                    case "dropdownReadOnly":
                        argument["type"] = "Scratch.ArgumentType.STRING";
                        argument["menu"] = inputID
                        menu = [];
                        data.value.forEach((data, index) => {
                            menu.push({
                                text: data,
                                value: data
                            })
                        })
                        menus[inputID] = { acceptReporters: false, items: menu } // 只需修改 acceptReporters
                        break
                    case "boolean":
                        argument["type"] = "Scratch.ArgumentType.BOOLEAN";
                        break

                }
                blockValue[inputID] = argument;
            }
        })
        console.log(data)
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
                blocks: ${JSON.stringify(spawnExtensionBlocks())
                            .replaceAll("\"Scratch.ArgumentType.STRING\"", "Scratch.ArgumentType.STRING")
                            .replaceAll("\"Scratch.ArgumentType.BOOLEAN\"","Scratch.ArgumentType.BOOLEAN")
                            },
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
        console.log(result); // 展示给用户
    } catch (error) {
        console.error('格式化失败:', error);
    }
    return result
}