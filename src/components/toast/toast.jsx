import { useState, useEffect, useCallback } from 'react';
import styles from './toast.module.css';

let toastId = 0;
let listeners = [];

const notify = (toast) => {
    listeners.forEach(fn => fn(toast));
};

/**
 * Toast 消息 API
 *
 * toast.info('消息内容')
 * toast.success('成功')
 * toast.error('失败')
 * toast.show({ type: 'info', message: '...', duration: 3000 })
 */
const toast = {
    show(options) {
        const id = ++toastId;
        const config = typeof options === 'string' ? { message: options } : options;
        notify({
            id,
            type: config.type || 'info',
            message: config.message,
            duration: config.duration ?? 3500,
        });
        return id;
    },
    info(message, duration) {
        return this.show({ type: 'info', message, duration });
    },
    success(message, duration) {
        return this.show({ type: 'success', message, duration });
    },
    error(message, duration) {
        return this.show({ type: 'error', message, duration: duration ?? 6000 });
    },
    warning(message, duration) {
        return this.show({ type: 'warning', message, duration });
    },
};

export { toast };

/**
 * Toast 容器组件 —— 放在 App 根节点
 */
export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, { ...toast, leaving: false }]);
        };
        listeners.push(listener);
        return () => { listeners = listeners.filter(fn => fn !== listener); };
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 260);
    }, []);

    useEffect(() => {
        const timers = toasts
            .filter(t => !t.leaving && t.duration > 0)
            .map(t => setTimeout(() => dismiss(t.id), t.duration));
        return () => timers.forEach(clearTimeout);
    }, [toasts, dismiss]);

    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map(t => (
                <div key={t.id} className={`${styles.toast} ${styles[t.type]} ${t.leaving ? styles.leaving : ''}`}>
                    <span className={styles.message}>{t.message}</span>
                    <button className={styles.dismiss} onClick={() => dismiss(t.id)}>×</button>
                </div>
            ))}
        </div>
    );
}
