import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import './extension-editor-storage-content.css';

const defaultFormatMessage = (message) => message.defaultMessage || '';

const messages = defineMessages({
    storedExtensions: {
        defaultMessage: 'Stored Extensions',
        description: 'Title of storage manager',
        id: 'tw.extensionEditorTabs.storedExtensions'
    },
    noStoredExtensions: {
        defaultMessage: 'No stored extensions found',
        description: 'Message when no extensions are stored',
        id: 'tw.extensionEditorTabs.noStoredExtensions'
    },
    load: {
        defaultMessage: 'Load',
        description: 'Button to load an extension',
        id: 'tw.extensionEditorTabs.loadExtension'
    },
    deleteExtension: {
        defaultMessage: 'Delete',
        description: 'Button to delete an extension',
        id: 'tw.extensionEditorTabs.deleteExtension'
    },
    clearAll: {
        defaultMessage: 'Clear All',
        description: 'Button to clear all extensions',
        id: 'tw.extensionEditorTabs.clearAll'
    },
    lastModified: {
        defaultMessage: 'Last modified: ',
        description: 'Label for last modified date',
        id: 'tw.extensionEditorTabs.lastModified'
    },
    closeButton: {
        defaultMessage: 'Close',
        description: 'Button to close the storage manager',
        id: 'tw.extensionEditorTabs.closeButton'
    }
});

class ExtensionEditorStorageContent extends React.Component {
    constructor(props) {
        super(props);
        this.formatMessage = props.formatMessage || defaultFormatMessage;
    }

    handleDeleteFromStorage = async (extensionId) => {
        if (this.props.onDeleteFromStorage) {
            await this.props.onDeleteFromStorage(extensionId);
        }
    };

    handleClearAllStorage = async () => {
        if (!confirm(this.formatMessage(messages.clearAll) + '?')) {
            return;
        }
        
        if (this.props.onClearAllStorage) {
            await this.props.onClearAllStorage();
        }
    };

    render() {
        const { savedExtensions = [] } = this.props;

        return (
            <div className="extension-editor-storage-content">
                <div className="extension-editor-storage-container">
                    <div className="extension-editor-storage-body">
                        <h2><FormattedMessage {...messages.storedExtensions} /></h2>
                        
                        {savedExtensions.length === 0 ? (
                            <div className="extension-editor-storage-empty">
                                <FormattedMessage {...messages.noStoredExtensions} />
                            </div>
                        ) : (
                            <div className="extension-editor-storage-list">
                                {savedExtensions.map(extension => (
                                    <div key={extension.id} className="extension-editor-storage-item">
                                        <div className="extension-editor-storage-item-info">
                                            <div className="extension-editor-storage-item-name">{extension.name}</div>
                                            <div className="extension-editor-storage-item-date">
                                                <FormattedMessage {...messages.lastModified} />
                                                {new Date(extension.updatedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="extension-editor-storage-item-actions">
                                            <button
                                                className="extension-editor-storage-load-button"
                                                onClick={() => this.props.onLoadFromStorage(extension)}
                                            >
                                                <FormattedMessage {...messages.load} />
                                            </button>
                                            <button
                                                className="extension-editor-storage-delete-button"
                                                onClick={() => this.handleDeleteFromStorage(extension.id)}
                                            >
                                                <FormattedMessage {...messages.deleteExtension} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="extension-editor-storage-footer">
                        {savedExtensions.length > 0 && (
                            <button
                                className="extension-editor-storage-clear-all-button"
                                onClick={this.handleClearAllStorage}
                            >
                                <FormattedMessage {...messages.clearAll} />
                            </button>
                        )}
                        <button
                            className="extension-editor-storage-close-button"
                            onClick={this.props.onClose}
                        >
                            <FormattedMessage {...messages.closeButton} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ExtensionEditorStorageContent.propTypes = {
    formatMessage: PropTypes.func,
    onClose: PropTypes.func,
    savedExtensions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        code: PropTypes.string,
        updatedAt: PropTypes.number
    })),
    onLoadFromStorage: PropTypes.func,
    onDeleteFromStorage: PropTypes.func,
    onClearAllStorage: PropTypes.func
};

export default ExtensionEditorStorageContent;