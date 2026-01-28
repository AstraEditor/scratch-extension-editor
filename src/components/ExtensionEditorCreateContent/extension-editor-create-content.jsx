import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import './extension-editor-create-content.css';

const messages = defineMessages({
    nameLabel: {
        defaultMessage: 'Extension Name',
        description: 'Label for extension name input',
        id: 'tw.extensionEditorCreate.nameLabel'
    },
    namePlaceholder: {
        defaultMessage: 'My Extension',
        description: 'Placeholder for extension name input',
        id: 'tw.extensionEditorCreate.namePlaceholder'
    },
    idLabel: {
        defaultMessage: 'Extension ID',
        description: 'Label for extension ID input',
        id: 'tw.extensionEditorCreate.idLabel'
    },
    idPlaceholder: {
        defaultMessage: 'myextension',
        description: 'Placeholder for extension ID input',
        id: 'tw.extensionEditorCreate.idPlaceholder'
    },
    idHint: {
        defaultMessage: 'Must be lowercase, no spaces, only letters, numbers, and underscores',
        description: 'Hint for extension ID input',
        id: 'tw.extensionEditorCreate.idHint'
    },
    colorLabel: {
        defaultMessage: 'Extension Color',
        description: 'Label for extension color picker',
        id: 'tw.extensionEditorCreate.colorLabel'
    },
    color1Label: {
        defaultMessage: 'Primary Color',
        description: 'Label for primary color',
        id: 'tw.extensionEditorCreate.color1Label'
    },
    color2Label: {
        defaultMessage: 'Secondary Color',
        description: 'Label for secondary color',
        id: 'tw.extensionEditorCreate.color2Label'
    },
    color3Label: {
        defaultMessage: 'Tertiary Color',
        description: 'Label for tertiary color',
        id: 'tw.extensionEditorCreate.color3Label'
    },
    cancelButton: {
        defaultMessage: 'Cancel',
        description: 'Button to cancel',
        id: 'tw.extensionEditorCreate.cancelButton'
    },
    createButton: {
        defaultMessage: 'Create',
        description: 'Button to create the extension',
        id: 'tw.extensionEditorCreate.createButton'
    },
    nameError: {
        defaultMessage: 'Please enter a name',
        description: 'Error message when name is empty',
        id: 'tw.extensionEditorCreate.nameError'
    },
    idError: {
        defaultMessage: 'Please enter a valid ID (lowercase letters, numbers, and underscores only)',
        description: 'Error message when ID is invalid',
        id: 'tw.extensionEditorCreate.idError'
    }
});

class ExtensionEditorCreateContent extends React.Component {
    handleNameChange = (name) => {
        // Auto-generate ID from name if ID is empty
        const newId = this.state.id === '' && name ? 
            name.toLowerCase().replace(/[^a-z0-9_]/g, '_') : 
            this.state.id;
        this.props.onNameChange && this.props.onNameChange(name, newId);
    };

    handleIdChange = (id) => {
        this.props.onIdChange && this.props.onIdChange(id);
    };

    handleColorChange = (colorKey, color) => {
        this.props.onColorChange && this.props.onColorChange(colorKey, color);
    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.onCreate && this.props.onCreate();
        }
    };

    render() {
        return (
            <div className="extension-editor-create-content">
                <div className="extension-editor-create-container">
                    <div className="extension-editor-create-form">
                        <div className="extension-editor-create-formGroup">
                            <label className="extension-editor-create-label">
                                <FormattedMessage {...messages.nameLabel} />
                            </label>
                            <input
                                type="text"
                                className="extension-editor-create-input"
                                placeholder={this.props.intl.formatMessage(messages.namePlaceholder)}
                                value={this.props.name}
                                onChange={(e) => this.handleNameChange(e.target.value)}
                                onKeyPress={this.handleKeyPress}
                            />
                            {this.props.errors.name && (
                                <div className="extension-editor-create-error">{this.props.errors.name}</div>
                            )}
                        </div>

                        <div className="extension-editor-create-formGroup">
                            <label className="extension-editor-create-label">
                                <FormattedMessage {...messages.idLabel} />
                            </label>
                            <input
                                type="text"
                                className="extension-editor-create-input"
                                placeholder={this.props.intl.formatMessage(messages.idPlaceholder)}
                                value={this.props.id}
                                onChange={(e) => this.handleIdChange(e.target.value)}
                                onKeyPress={this.handleKeyPress}
                            />
                            <div className="extension-editor-create-hint">
                                <FormattedMessage {...messages.idHint} />
                            </div>
                            {this.props.errors.id && (
                                <div className="extension-editor-create-error">{this.props.errors.id}</div>
                            )}
                        </div>

                        <div className="extension-editor-create-formGroup">
                            <label className="extension-editor-create-label">
                                <FormattedMessage {...messages.colorLabel} />
                            </label>
                            <div className="extension-editor-create-colorPickers">
                                <div className="extension-editor-create-colorPicker">
                                    <label className="extension-editor-create-colorLabel">
                                        <FormattedMessage {...messages.color1Label} />
                                    </label>
                                    <input
                                        type="color"
                                        className="extension-editor-create-colorInput"
                                        value={this.props.colors.color1}
                                        onChange={(e) => this.handleColorChange('color1', e.target.value)}
                                    />
                                </div>
                                <div className="extension-editor-create-colorPicker">
                                    <label className="extension-editor-create-colorLabel">
                                        <FormattedMessage {...messages.color2Label} />
                                    </label>
                                    <input
                                        type="color"
                                        className="extension-editor-create-colorInput"
                                        value={this.props.colors.color2}
                                        onChange={(e) => this.handleColorChange('color2', e.target.value)}
                                    />
                                </div>
                                <div className="extension-editor-create-colorPicker">
                                    <label className="extension-editor-create-colorLabel">
                                        <FormattedMessage {...messages.color3Label} />
                                    </label>
                                    <input
                                        type="color"
                                        className="extension-editor-create-colorInput"
                                        value={this.props.colors.color3}
                                        onChange={(e) => this.handleColorChange('color3', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="extension-editor-create-footer">
                        <button
                            className="extension-editor-create-button"
                            onClick={this.props.onCancel}
                        >
                            <FormattedMessage {...messages.cancelButton} />
                        </button>
                        <button
                            className="extension-editor-create-button extension-editor-create-primaryButton"
                            onClick={this.props.onCreate}
                        >
                            <FormattedMessage {...messages.createButton} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ExtensionEditorCreateContent.propTypes = {
    intl: intlShape,
    name: PropTypes.string,
    id: PropTypes.string,
    colors: PropTypes.object,
    errors: PropTypes.object,
    onNameChange: PropTypes.func,
    onIdChange: PropTypes.func,
    onColorChange: PropTypes.func,
    onCreate: PropTypes.func,
    onCancel: PropTypes.func
};

export default injectIntl(ExtensionEditorCreateContent);