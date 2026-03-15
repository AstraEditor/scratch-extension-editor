let comments;
let blocks;
let publicJS;
let translate;

export function init() {
    comments = {
        "name": "A Extension",
        "id": "aExtension",
        "description": "a extension",
        "color": ["#0099ff", "#0066ff", "#0033ff"],
        "author": "a person",
        "license": "MPL-2.0",
    };
    blocks = {};
    publicJS = "";
    translate = [];
}

export function returnValue(value) {
    switch (value) {
        case "comments":
            return comments;
        case "blocks":
            return blocks;
        case "publicJS":
            return publicJS;
        case "translate":
            return translate;
        default:
            throw new Error("Undefined value to return")
    }
}

export function setValueTo(item, value) {
    switch (item) {
        case "comments":
            comments = value;
            break
        case "blocks":
            blocks = value;
            break
        case "publicJS":
            publicJS = value;
            break
        case "translate":
            translate = value;
            break
        default:
            throw new Error("Undefined value to set")
    }
}

export function getAllValue() {
    return {
        comments,
        blocks,
        publicJS,
        translate,
    }
}

export function setAllValue(data) {
    if (data.comments) comments = data.comments;
    if (data.blocks) blocks = data.blocks;
    if (data.publicJS) publicJS = data.publicJS;
    if (data.translate) translate = data.translate;
}