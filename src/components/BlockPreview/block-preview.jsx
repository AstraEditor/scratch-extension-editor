import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import './block-preview.css';

const messages = defineMessages({
    loadingExtension: {
        defaultMessage: 'Loading extension...',
        description: 'Loading extension message',
        id: 'tw.extensionEditorTabs.loadingExtension'
    },
    loadingPleaseWait: {
        defaultMessage: 'Please wait',
        description: 'Please wait message',
        id: 'tw.extensionEditorTabs.loadingPleaseWait'
    },
    loadFailed: {
        defaultMessage: 'Load failed',
        description: 'Load failed message',
        id: 'tw.extensionEditorTabs.loadFailed'
    },
    checkSyntax: {
        defaultMessage: 'Please check the code syntax and try again',
        description: 'Check syntax suggestion',
        id: 'tw.extensionEditorTabs.checkSyntax'
    },
    runExtensionFirst: {
        defaultMessage: 'Please run the extension first',
        description: 'Run extension first message',
        id: 'tw.extensionEditorTabs.runExtensionFirst'
    },
    runExtensionButton: {
        defaultMessage: 'Click "Run Extension" button to load block preview',
        description: 'Run extension button hint',
        id: 'tw.extensionEditorTabs.runExtensionButton'
    },
    extensionNotLoaded: {
        defaultMessage: 'Extension not loaded',
        description: 'Extension not loaded message',
        id: 'tw.extensionEditorTabs.extensionNotLoaded'
    },
    noBlocksDefined: {
        defaultMessage: 'No blocks defined',
        description: 'No blocks defined message',
        id: 'tw.extensionEditorTabs.noBlocksDefined'
    },
    noBlocksXML: {
        defaultMessage: 'No blocks XML',
        description: 'No blocks XML message',
        id: 'tw.extensionEditorTabs.noBlocksXML'
    },
    renderFailed: {
        defaultMessage: 'Render failed',
        description: 'Render failed message',
        id: 'tw.extensionEditorTabs.renderFailed'
    },
    checkBlockDefinition: {
        defaultMessage: 'Please check if block definition is correct',
        description: 'Check block definition suggestion',
        id: 'tw.extensionEditorTabs.checkBlockDefinition'
    }
});

class BlockPreview extends React.Component {
    constructor(props) {
        super(props);
        this.flyoutContainer = React.createRef();
        this.previewWorkspace = null;
        this.previewFlyout = null;
    }

    componentDidMount() {
        if (this.props.vm) {
            this.props.vm.addListener('BLOCKSINFO_UPDATE', this.renderBlockPreview);
        }
        this.renderBlockPreview();
    }

    componentDidUpdate(prevProps) {
        // 当 vm 变化时，重新添加监听器
        if (prevProps.vm !== this.props.vm) {
            if (prevProps.vm) {
                prevProps.vm.removeListener('BLOCKSINFO_UPDATE', this.renderBlockPreview);
            }
            if (this.props.vm) {
                this.props.vm.addListener('BLOCKSINFO_UPDATE', this.renderBlockPreview);
            }
        }

        // 监听 props 变化，触发重新渲染
        if (prevProps.extensionCode !== this.props.extensionCode ||
            prevProps.isLoading !== this.props.isLoading ||
            prevProps.loadError !== this.props.loadError ||
            prevProps.activeTabId !== this.props.activeTabId ||
            prevProps.vm !== this.props.vm ||
            prevProps.ScratchBlocks !== this.props.ScratchBlocks) {
            this.renderBlockPreview();
        }
    }

    componentWillUnmount() {
        this.disposeFlyout();
        if (this.props.vm) {
            this.props.vm.removeListener('BLOCKSINFO_UPDATE', this.renderBlockPreview);
        }
    }

    disposeFlyout = () => {
        if (this.previewFlyout) {
            this.previewFlyout = null;
        }
        if (this.previewWorkspace) {
            this.previewWorkspace.dispose();
            this.previewWorkspace = null;
        }
        if (this.flyoutContainer.current) {
            this.flyoutContainer.current.innerHTML = '';
        }
    };

    renderBlockPreview = () => {
        const { vm, ScratchBlocks, extensionCode, isLoading, loadError, intl } = this.props;
        const container = this.flyoutContainer.current;

        if (!container) return;

        const formatMessage = intl ? intl.formatMessage : (msg) => msg.defaultMessage;

        if (isLoading) {
            const loadingText = formatMessage(messages.loadingExtension);
            const waitText = formatMessage(messages.loadingPleaseWait);
            container.innerHTML = `
                <div class="extension-editor-block-preview-loading">
                    <div style="font-size: 14px; margin-bottom: 10px;">${loadingText}</div>
                    <div style="font-size: 12px;">${waitText}</div>
                </div>
            `;
            return;
        }

        if (loadError) {
            const loadFailedText = formatMessage(messages.loadFailed);
            const checkSyntaxText = formatMessage(messages.checkSyntax);
            container.innerHTML = `
                <div class="extension-editor-block-preview-error">
                    <div style="font-size: 14px; margin-bottom: 10px; color: #ff4444;">✕ ${loadFailedText}</div>
                    <div style="font-size: 12px; margin-bottom: 8px; color: #ff4444;">${loadError}</div>
                    <div style="font-size: 11px; opacity: 0.7;">${checkSyntaxText}</div>
                </div>
            `;
            return;
        }

        if (!vm || !ScratchBlocks) {
            const runExtensionText = formatMessage(messages.runExtensionFirst);
            const runButtonHint = formatMessage(messages.runExtensionButton);
            container.innerHTML = `
                <div class="extension-editor-block-preview-empty">
                    <div style="font-size: 14px; margin-bottom: 10px;">🔄 ${runExtensionText}</div>
                    <div style="font-size: 12px;">${runButtonHint}</div>
                </div>
            `;
            return;
        }

        if (!vm.runtime || !vm.runtime._blockInfo || vm.runtime._blockInfo.length === 0) {
            const runExtensionText = formatMessage(messages.runExtensionFirst);
            const runButtonHint = formatMessage(messages.runExtensionButton);
            container.innerHTML = `
                <div class="extension-editor-block-preview-empty">
                    <div style="font-size: 14px; margin-bottom: 10px;">🔄 ${runExtensionText}</div>
                    <div style="font-size: 12px;">${runButtonHint}</div>
                </div>
            `;
            return;
        }

        // 从代码中提取扩展ID
        if (!extensionCode) {
            container.innerHTML = '';
            return;
        }

        const idMatch = extensionCode.match(/id:\s*['"]([^'"]+)['"]/);
        if (!idMatch) {
            container.innerHTML = '';
            return;
        }

        const extensionId = idMatch[1];
        const blockInfo = vm.runtime._blockInfo;
        const extensionInfo = blockInfo.find(b => b.id === extensionId);

        if (!extensionInfo || !extensionInfo.blocks) {
            const notLoadedText = formatMessage(messages.extensionNotLoaded);
            const runButtonHint = formatMessage(messages.runExtensionButton);
            container.innerHTML = `
                <div class="extension-editor-block-preview-empty">
                    <div style="font-size: 14px; margin-bottom: 10px;">${notLoadedText}</div>
                    <div style="font-size: 12px;">${runButtonHint}</div>
                </div>
            `;
            console.warn('[BlockPreview] Extension info not found:', extensionId);
            console.warn('[BlockPreview] Available extensions:', blockInfo.map(b => b.id));
            return;
        }

        this.disposeFlyout();

        try {
            // 定义 block json
            const jsonBlocks = extensionInfo.blocks
                .filter(b => b.json)
                .map(b => b.json);

            if (!jsonBlocks.length) {
                const noBlocksText = formatMessage(messages.noBlocksDefined);
                container.innerHTML = `
                    <div class="extension-editor-block-preview-empty">
                        <div style="font-size: 14px;">${noBlocksText}</div>
                    </div>
                `;
                console.warn('[BlockPreview] No blocks to define');
                return;
            }

            ScratchBlocks.defineBlocksWithJsonArray(jsonBlocks);

            // 准备 toolbox XML
            const extensionBlocksXML = extensionInfo.blocks
                .filter(b => b.xml)
                .map(b => b.xml)
                .join('');

            if (!extensionBlocksXML) {
                const noXMLText = formatMessage(messages.noBlocksXML);
                container.innerHTML = `
                    <div class="extension-editor-block-preview-empty">
                        <div style="font-size: 14px;">${noXMLText}</div>
                    </div>
                `;
                console.warn('[BlockPreview] No blocks XML');
                return;
            }

            // 构建完整的toolbox XML
            let iconURI = '';
            if (extensionInfo.blockIconURI) {
                iconURI = `iconURI="${extensionInfo.blockIconURI}"`;
            }
            const toolboxXML = `<xml><category name="${extensionInfo.name}" id="${extensionInfo.id}" colour="${extensionInfo.color1}" secondaryColour="${extensionInfo.color2}" ${iconURI}>${extensionBlocksXML}</category></xml>`;

            // 创建 Workspace
            const workspace = ScratchBlocks.inject(container, {
                rtl: false,
                scrollbars: false,
                trashcan: false,
                sounds: false,
                toolbox: toolboxXML,
                zoom: {
                    controls: false,
                    wheel: false,
                    startScale: 0.85,
                    maxScale: 0.85,
                    minScale: 0.85
                }
            });

            if (workspace) {
                const flyout = workspace.getFlyout();
                if (flyout) {
                    this.previewFlyout = flyout;
                    if (flyout.setWidth) {
                        flyout.setWidth(450);
                    }
                    if (flyout.reflow) {
                        flyout.reflow();
                    }
                    if (flyout.position) {
                        flyout.position();
                    }
                    console.log('[BlockPreview] Flyout created successfully, blocks:', extensionBlocksXML);
                } else {
                    console.warn('[BlockPreview] Flyout not created');
                }
            }
            this.previewWorkspace = workspace;
        } catch (error) {
            console.error('[BlockPreview] Error rendering block preview:', error);
            const renderFailedText = formatMessage(messages.renderFailed);
            const checkBlockText = formatMessage(messages.checkBlockDefinition);
            container.innerHTML = `
                <div class="extension-editor-block-preview-error">
                    <div style="font-size: 14px; margin-bottom: 10px; color: #ff4444;">✕ ${renderFailedText}</div>
                    <div style="font-size: 12px; margin-bottom: 8px; color: #ff4444;">${error.message}</div>
                    <div style="font-size: 11px; opacity: 0.7;">${error.stack || checkBlockText}</div>
                </div>
            `;
        }
    };

    render() {
        return (
            <div className="extension-editor-block-preview">
                <div className="extension-editor-block-preview-container" ref={this.flyoutContainer}>
                    {/* Flyout will be rendered here */}
                </div>
            </div>
        );
    }
}

BlockPreview.propTypes = {
    intl: PropTypes.object,
    vm: PropTypes.object,
    ScratchBlocks: PropTypes.object,
    extensionCode: PropTypes.string,
    isLoading: PropTypes.bool,
    loadError: PropTypes.string,
    activeTabId: PropTypes.string
};

export default BlockPreview;