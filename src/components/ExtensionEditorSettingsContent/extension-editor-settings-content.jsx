import PropTypes from 'prop-types';
import React from 'react';
import './extension-editor-settings-content.css';

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
                        <h3>{this.props.FormattedMessage('editorOptions')}</h3>

                        <div className="extension-editor-settings-setting">
                            <label>
                                <span className="extension-editor-settings-label">
                                    {this.props.FormattedMessage('fontSize')}
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
                            {this.props.FormattedMessage('done')}
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
