const FSC_URL = "localhost:8000"; // FSC默认端口

export default function fscWS() {
    if (typeof WebSocket === "undefined") {
        return alert("WebSocketServer is not supported in this environment.");
    }

    var ws = new WebSocket(`ws://${FSC_URL}/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) || {};
        if (data.type === "ok") {
            loadFSCExtension();
        }
    }
}

const loadFSCExtension = () => {
    fetch(`http://${FSC_URL}/meta`)
        .then(res => res.json())
        .then(meta => {
            return fetch(`http://${FSC_URL}${meta.extensionUrl}`)
                .then(res => res.text())
                .then(code => ({ ...meta, extension: code }));
        })
        .then(projectObject => {
            window.dispatchEvent(
                new CustomEvent("fsc-extension-loaded", {
                    detail: projectObject
                })
            );
            console.log("Loaded new FSC Extension!");
        })
        .catch(err => { throw new Error("Failed to fetch FSC extension: " + err.message) });
}
