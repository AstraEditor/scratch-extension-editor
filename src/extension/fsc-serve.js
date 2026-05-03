import { toast } from "../components/toast/toast";
import { t } from "../i18n";

const FSC_URL = "localhost:8000"; // FSC默认端口

export default function fscWS() {
    if (typeof WebSocket === "undefined") {
        toast.error(t('WebSocket is not supported in this environment.'));
        return;
    }

    var ws = new WebSocket(`ws://${FSC_URL}/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) || {};
        if (data.type === "ok") {
            loadFSCExtension();
        }
    }
    ws.onerror = e => {
        toast.error(t('FSC WebSocket connection failed'));
    }
}

const loadFSCExtension = () => {
    fetch(`http://${FSC_URL}/meta`)
        .then(res => res.json())
        .then(meta => {
            toast.info(t('Fetching FSC extension...'));
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
            toast.success(t('FSC extension loaded'));
        })
        .catch(err => { toast.error(t('Failed to fetch FSC extension') + ': ' + err.message) });
}
