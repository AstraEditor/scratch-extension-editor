import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages } from 'react-intl';
import './extension-editor-storage-content.css';

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
    },
    justNow: {
        defaultMessage: 'Just now',
        description: 'Time format for less than a minute ago',
        id: 'tw.extensionEditorTabs.timeJustNow'
    },
    minutesAgo: {
        defaultMessage: '{minutes} minutes ago',
        description: 'Time format for minutes ago',
        id: 'tw.extensionEditorTabs.timeMinutesAgo'
    },
    hoursAgo: {
        defaultMessage: '{hours} hours ago',
        description: 'Time format for hours ago',
        id: 'tw.extensionEditorTabs.timeHoursAgo'
    }
});

class ExtensionEditorStorageContent extends React.Component {
    handleDeleteFromStorage = async (extensionId) => {
        if (this.props.onDeleteFromStorage) {
            await this.props.onDeleteFromStorage(extensionId);
        }
    };

    handleClearAllStorage = async () => {
        const confirmMessage = this.props.intl.formatMessage(messages.clearAll) + '?';
        if (!confirm(confirmMessage)) {
            return;
        }
        
        if (this.props.onClearAllStorage) {
            await this.props.onClearAllStorage();
        }
    };

    formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // 如果在24小时内，显示相对时间
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            if (hours < 1) {
                const minutes = Math.floor(diff / 60000);
                if (minutes < 1) {
                    return this.props.intl.formatMessage(messages.justNow);
                }
                return this.props.intl.formatMessage(messages.minutesAgo, { minutes });
            }
            return this.props.intl.formatMessage(messages.hoursAgo, { hours });
        }
        
        // 否则显示完整日期
        return date.toLocaleString();
    };

    render() {
        const { savedExtensions = [] } = this.props;
        const intl = this.props.intl;

        return (
            <div className="extension-editor-storage-content">
                <div className="extension-editor-storage-container">
                    <div className="extension-editor-storage-body">
                        <h2>{intl.formatMessage(messages.storedExtensions)}</h2>
                        
                        {savedExtensions.length === 0 ? (
                            <div className="extension-editor-storage-empty">
                                {intl.formatMessage(messages.noStoredExtensions)}
                            </div>
                        ) : (
                            <div className="extension-editor-storage-list">
                                {savedExtensions.map(extension => (
                                    <div key={extension.id} className="extension-editor-storage-item">
                                        <div className="extension-editor-storage-item-info">
                                            <div className="extension-editor-storage-item-name" title={extension.name}>
                                                {extension.name}
                                            </div>
                                            <div className="extension-editor-storage-item-date" title={new Date(extension.updatedAt).toLocaleString()}>
                                                {intl.formatMessage(messages.lastModified)}
                                                {this.formatDate(extension.updatedAt)}
                                            </div>
                                        </div>
                                        <div className="extension-editor-storage-item-actions">
                                            <button
                                                className="extension-editor-storage-load-button"
                                                onClick={() => this.props.onLoadFromStorage(extension)}
                                                title={intl.formatMessage(messages.load)}
                                            >
                                                {intl.formatMessage(messages.load)}
                                            </button>
                                            <button
                                                className="extension-editor-storage-delete-button"
                                                onClick={() => this.handleDeleteFromStorage(extension.id)}
                                                title={intl.formatMessage(messages.deleteExtension)}
                                            >
                                                {intl.formatMessage(messages.deleteExtension)}
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
                                title={intl.formatMessage(messages.clearAll)}
                            >
                                {intl.formatMessage(messages.clearAll)}
                            </button>
                        )}
                        <button
                            className="extension-editor-storage-close-button"
                            onClick={this.props.onClose}
                            title={intl.formatMessage(messages.closeButton)}
                        >
                            {intl.formatMessage(messages.closeButton)}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ExtensionEditorStorageContent.propTypes = {
    intl: PropTypes.object.isRequired,
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