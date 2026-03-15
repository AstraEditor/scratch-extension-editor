/**
 * 热重载服务 - 通过 postMessage 与 scratch-gui 通信
 * 
 * 使用方式：
 * 1. scratch-gui 打开 scratch-extension-editor 窗口
 * 2. 编辑完成后点击"热重载"按钮
 * 3. 通过 window.opener.postMessage 发送扩展代码
 * 4. scratch-gui 接收消息，卸载旧扩展并加载新扩展
 */

import { spawnExtension } from './spawn.js';
import { returnValue } from './storage.js';

const HOT_RELOAD_MESSAGE_TYPE = 'astra-extension-hot-reload';

class HotReloadService {
    constructor() {
        this.targetOrigin = this.detectTargetOrigin();
    }

    /**
     * 检测目标 origin（scratch-gui 的域名）
     */
    detectTargetOrigin() {
        // 如果 opener 存在，尝试获取其 origin
        if (window.opener) {
            // 对于同源页面，可以使用 '*'
            // 但为了安全，最好指定具体的 origin
            try {
                return window.opener.location.origin;
            } catch (e) {
                // 跨域时无法访问，使用 '*'
                return '*';
            }
        }
        return '*';
    }

    /**
     * 检查是否可以通过 postMessage 与父窗口通信
     */
    canCommunicate() {
        return window.opener && !window.opener.closed;
    }

    /**
     * 执行热重载
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async hotReload() {
        if (!this.canCommunicate()) {
            return {
                success: false,
                error: '无法与编辑器窗口通信。请确保从 Scratch 编辑器打开此窗口。'
            };
        }

        try {
            // 生成扩展代码
            const extensionCode = await spawnExtension();
            const extensionId = returnValue('comments')?.id;

            if (!extensionId) {
                return {
                    success: false,
                    error: '扩展 ID 不存在，请先设置扩展信息。'
                };
            }

            // 发送热重载消息
            window.opener.postMessage({
                type: HOT_RELOAD_MESSAGE_TYPE,
                extensionId,
                code: extensionCode
            }, this.targetOrigin);

            return { success: true };
        } catch (error) {
            console.error('Hot reload failed:', error);
            return {
                success: false,
                error: error.message || '热重载失败'
            };
        }
    }

    /**
     * 生成扩展代码（不发送）
     * @returns {Promise<{extensionId: string, code: string}>}
     */
    async generateCode() {
        const code = await spawnExtension();
        const extensionId = returnValue('comments')?.id;
        return { extensionId, code };
    }
}

// 导出单例
const hotReloadService = new HotReloadService();
export default hotReloadService;

// 也导出常量，供 scratch-gui 使用
export { HOT_RELOAD_MESSAGE_TYPE };