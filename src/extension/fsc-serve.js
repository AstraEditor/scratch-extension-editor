export default function fscWS() {
    if (!("WebSocketServer" in window)) {
        return alert("WebSocketServer is not supported in this environment.");
    }

    var ws = new WebSocket("ws://localhost:8000/"); // FSC默认端口
    ws.onopen = () => {console.log("1")}
}