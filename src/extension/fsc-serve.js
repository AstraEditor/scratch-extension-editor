const FSC_URL = "localhost:8000"; // FSC默认端口

export default function fscWS() {
    if (typeof WebSocket === "undefined") {
        return alert("WebSocketServer is not supported in this environment.");
    }

    var ws = new WebSocket(`ws://${FSC_URL}/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) || {};
        if (data.type === "ok") {
            // 获取扩展信息
            fetch(`http://${FSC_URL}`)
                .then(url => {
                    return url.text();
                }).then(ext => {
                    processFSCUrlasObj(ext);
                })
                .catch(err => {throw new Error("Failed to fetch extension code: " + err.message)});
        }
    }
}

const processFSCUrlasObj = (url) => {
    const URL = JSON.parse(url) || "";
    if (typeof URL === "string") {
        console.error("bro, 这里的url非彼url,这里是一个对象");
        return;
    }

    let extension = ""; 
    
    // 处理URL
    fetch(`http://${FSC_URL}${URL.extensionUrl}`)
        .then(res => res.text())
        .then(code => {
            extension = code;
            const ProjectObject = {
                ...URL,
                extension
            }
            
            window.dispatchEvent( //发送广播
                new CustomEvent("fsc-extension-loaded", {
                    detail: ProjectObject
                })
            )
            console.log("Loaded new FSC Extension!");
            return "OK!";
        })
        .catch(err => {throw new Error("Failed to fetch extension code: " + err.message)});
}
