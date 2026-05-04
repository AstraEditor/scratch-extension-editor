import { toast } from "../components/toast/toast";
import { t } from "../i18n";

const DEFAULT_PORT = 8000;
const STORAGE_KEY = 'fsc_port';

const getPort = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const port = parseInt(saved, 10);
    return Number.isFinite(port) && port > 0 && port < 65536 ? port : DEFAULT_PORT;
};

export const getFSCPort = getPort;

export const setFSCPort = (port) => {
    localStorage.setItem(STORAGE_KEY, port);
};

export default function fscWS(port) {
    const usePort = port || getPort();
    const FSC_URL = `localhost:${usePort}`;

    if (typeof WebSocket === "undefined") {
        toast.error(t('WebSocket is not supported in this environment.'));
        return;
    }

    var ws = new WebSocket(`ws://${FSC_URL}/ws`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) || {};
        if (data.type === "ok") {
            loadFSCExtension(FSC_URL);
        }
    }
    ws.onerror = e => {
        toast.error(t('FSC WebSocket connection failed'));
    }
}

const loadFSCExtension = (FSC_URL) => {
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
