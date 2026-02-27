import { getAllValue } from "./storage"


export function spawnExtension() {
    const Extension = getAllValue();
    
    const spawnExtensionBlocks = () => {
        const Blocks = Extension.blocks;
        const returnList = [];
        Object.keys(Blocks).forEach(blocks => {
            returnList.push(blocks)
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
                blocks: ${JSON.stringify(spawnExtensionBlocks())}
            }
        }
    }
    Scratch.extensions.register(new ${Extension.comments.id}());
}

`
    return ExtensionText
}