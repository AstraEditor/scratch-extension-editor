/**
 * 热重载服务 - 通过 postMessage 或 Desktop IPC 与 scratch-gui 通信
 * 
 * 使用方式：
 * 1. scratch-gui 打开 scratch-extension-editor 窗口
 * 2. 编辑完成后点击"热重载"按钮
 * 3. 通过 window.opener.postMessage 或 Desktop IPC 发送扩展代码
 * 4. scratch-gui 接收消息，卸载旧扩展并加载新扩展
 */

import { spawnExtension } from './spawn.js';
import { returnValue } from './storage.js';

const HOT_RELOAD_MESSAGE_TYPE = 'astra-extension-hot-reload';

class HotReloadService {
    /**
     * 检查是否在 Desktop 环境中
     */
    isDesktop() {
        const isDesktop = typeof window.IsDesktop !== 'undefined' && window.IsDesktop;
        console.log("IsDesktop:", isDesktop);
        return isDesktop;
    }

    /**
     * 检查是否可以与编辑器窗口通信
     */
    canCommunicate() {
        // Desktop 环境总是可以通信（通过 IPC）
        if (this.isDesktop()) {
            return typeof window.DesktopExtensionEditor !== 'undefined';
        }
        // Web 环境：通过 window.opener
        return window.opener && !window.opener.closed;
    }

    /**
     * 发送热重载消息
     */
    sendHotReloadMessage(data) {
        if (this.isDesktop()) {
            // Desktop 环境：使用 IPC
            window.DesktopExtensionEditor.hotReload(data);
        } else {
            // Web 环境：使用 postMessage
            const targetOrigin = window.opener ? window.opener.location.origin : '*';
            window.opener.postMessage(data, targetOrigin);
        }
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
            this.sendHotReloadMessage({
                type: HOT_RELOAD_MESSAGE_TYPE,
                extensionId,
                code: extensionCode
            });

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

    /**
     * 执行热重载
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async hotReloadFSC(ext) {
        if (!this.canCommunicate()) {
            return {
                success: false,
                error: '无法与编辑器窗口通信。请确保从 Scratch 编辑器打开此窗口。'
            };
        }

        try {
            // 发送热重载消息
            this.sendHotReloadMessage({
                type: HOT_RELOAD_MESSAGE_TYPE,
                extensionId: ext.id,
                code: ext.extension
            });

            return { success: true };
        } catch (error) {
            console.error('Hot reload failed:', error);
            return {
                success: false,
                error: error.message || '热重载失败'
            };
        }
    }
}

// 导出单例
const hotReloadService = new HotReloadService();
export default hotReloadService;

// 也导出常量，供 scratch-gui 使用
export { HOT_RELOAD_MESSAGE_TYPE };