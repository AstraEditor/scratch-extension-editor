export default function fscWS() {
    if (typeof WebSocket === "undefined") {
        return alert("WebSocketServer is not supported in this environment.");
    }

    const url = "localhost:8000"; // FSC默认端口
    var ws = new WebSocket(`ws://${url}/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) || {};
        if (data.type === "ok") {
            // 获取扩展
            fetch(`http://${url}`)
                .then(url => {
                    return url.text()
                }).then(ext => {
                    console.log(ext)
                })
                .catch(err => console.error(err))

        }
    }
}