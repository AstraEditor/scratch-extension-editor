let comments;
let blocks;
let publicJS;
let translate;
let commands;

export function init() {
    comments = {
        "name": "",
        "description": "",
        "color": ["#0099ff", "#0066ff", "#0033ff"],
        "author": "",
        "license": "MPL-2.0"
    };
    blocks = {};
    publicJS = {};
    translate = {};
    commands = {};
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
        case "commands":
            return commands;
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
        case "commands":
            commands = value;
            break
        default:
            throw new Error("Undefined value to set")
    }
}

export function getAllValue() {
    return [
        comments,
        blocks,
        publicJS,
        translate,
        commands
    ]
}