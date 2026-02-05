import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages} from 'react-intl';
import './extension-editor-settings-content.css';

const messages = defineMessages({
    editorOptions: {
        defaultMessage: 'Editor Options',
        description: 'Title for editor options section',
        id: 'tw.extensionEditorSettings.editorOptions'
    },
    fontSize: {
        defaultMessage: 'Font size',
        description: 'Label for font size setting',
        id: 'tw.extensionEditorSettings.fontSize'
    },
    done: {
        defaultMessage: 'Done',
        description: 'Button text to close settings',
        id: 'tw.extensionEditorSettings.done'
    }
});

const defaultIntl = {
    formatMessage: message => message.defaultMessage || ''
};

class ExtensionEditorSettingsContent extends React.Component {
    handleFontSizeChange = (e) => {
        const newFontSize = parseInt(e.target.value, 10);
        if (this.props.onFontSizeChange) {
            this.props.onFontSizeChange(newFontSize);
        }
    };

    render () {
        const intl = this.props.intl || defaultIntl;
        return (
            <div className="extension-editor-settings-content">
                <div className="extension-editor-settings-body">
                    <div className="extension-editor-settings-section">
                        <h3>{intl.formatMessage(messages.editorOptions)}</h3>

                        <div className="extension-editor-settings-setting">
                            <label>
                                <span className="extension-editor-settings-label">
                                    {intl.formatMessage(messages.fontSize)}
                                </span>
                                <span className="extension-editor-settings-value">{this.props.fontSize}px</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="40"
                                value={this.props.fontSize}
                                onChange={this.handleFontSizeChange}
                                className="extension-editor-settings-range"
                            />
                        </div>
                    </div>

                    <div className="extension-editor-settings-footer">
                        <button className="extension-editor-settings-button" onClick={this.props.onClose}>
                            {intl.formatMessage(messages.done)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ExtensionEditorSettingsContent.propTypes = {
    intl: PropTypes.object,
    onClose: PropTypes.func,
    fontSize: PropTypes.number,
    onFontSizeChange: PropTypes.func
};

export default ExtensionEditorSettingsContent;
