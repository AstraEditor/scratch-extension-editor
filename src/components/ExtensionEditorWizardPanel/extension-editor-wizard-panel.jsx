import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { defineMessages } from 'react-intl';
import tutorialsMarkdown from '../../lib/tutorials.md';
import './extension-editor-wizard-panel.css';

const messages = defineMessages({
    chapterDefault: {
        defaultMessage: 'Chapter {number}',
        description: 'Default chapter title when no title is provided',
        id: 'tw.extensionEditorTabs.chapterDefault'
    },
    comingSoon: {
        defaultMessage: 'Coming Soon',
        description: 'Message shown when no tutorial is available',
        id: 'tw.extensionEditorTabs.comingSoon'
    }
});

class ExtensionEditorWizardPanel extends React.Component {
    constructor(props) {
        super(props);
        const parsed = this.parseTutorials();
        const initialCategory = props.initialCategory || (parsed.categories[0] ? parsed.categories[0].id : null);
        this.state = {
            wizardCategory: initialCategory,
            wizardTutorial: null,
            wizardChapter: props.initialChapter || 0,
            ...parsed
        };
        this.selectFirstTutorial(initialCategory);
    }

    parseTutorials() {
        const lines = tutorialsMarkdown.split('\n');
        const categories = [];
        const tutorials = [];
        
        let currentCategory = null;
        let currentTutorial = null;
        let currentSection = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (line.match(/^#\s+[^#]/)) {
                // 一级标题 = 分类
                if (currentTutorial) {
                    if (currentSection) {
                        currentTutorial.sections.push(currentSection);
                    }
                    currentCategory.tutorials.push(currentTutorial);
                    tutorials.push(currentTutorial);
                }
                if (currentCategory) categories.push(currentCategory);
                
                const title = trimmedLine.replace(/^#\s+/, '');
                const categoryId = title.toLowerCase().replace(/\s+/g, '-');
                currentCategory = { id: categoryId, title, tutorials: [] };
                currentTutorial = null;
                currentSection = null;
                
            } else if (line.match(/^##\s+/) && currentCategory) {
                // 二级标题 = 教程
                if (currentTutorial) {
                    if (currentSection) {
                        currentTutorial.sections.push(currentSection);
                    }
                    currentCategory.tutorials.push(currentTutorial);
                    tutorials.push(currentTutorial);
                }
                
                const title = trimmedLine.replace(/^##\s+/, '');
                currentTutorial = {
                    id: `${currentCategory.id}-${title.toLowerCase().replace(/\s+/g, '-')}`,
                    category: currentCategory.id,
                    title,
                    sections: []
                };
                currentSection = null;
                
            } else if (line.match(/^###\s+/) && currentTutorial) {
                // 三级标题 = 章节
                if (currentSection) {
                    currentTutorial.sections.push(currentSection);
                }
                
                const title = trimmedLine.replace(/^###\s+/, '');
                currentSection = { title, content: [] };
                
            } else if (currentSection) {
                // 章节内容（包括所有更低级别的标题和内容）
                currentSection.content.push(line);
            }
        }

        // 保存最后的内容
        if (currentTutorial) {
            if (currentSection) {
                currentTutorial.sections.push(currentSection);
            }
            currentCategory.tutorials.push(currentTutorial);
            tutorials.push(currentTutorial);
        }
        if (currentCategory) categories.push(currentCategory);

        return { categories, tutorials };
    }

    selectFirstTutorial(category) {
        const tutorial = this.state.tutorials.find(t => t.category === category);
        if (tutorial) {
            this.setState({ wizardTutorial: tutorial.id });
        }
    }

    handleCategoryChange = (category) => {
        this.setState({ wizardCategory: category, wizardChapter: 0 });
        this.selectFirstTutorial(category);
        this.props.onCategoryChange?.(category);
    };

    handleTutorialChange = (tutorialId) => {
        this.setState({ wizardTutorial: tutorialId, wizardChapter: 0 });
        this.props.onTutorialChange?.(tutorialId);
    };

    handleChapterChange = (index) => {
        this.setState({ wizardChapter: index });
        this.props.onChapterChange?.(index);
    };

    render() {
        const { wizardCategory, wizardTutorial, wizardChapter, categories, tutorials } = this.state;
        const categoryTutorials = tutorials.filter(t => t.category === wizardCategory);
        const currentTutorial = tutorials.find(t => t.id === wizardTutorial);
        const currentCategory = categories.find(c => c.id === wizardCategory);
        const intl = this.props.intl;
        const formatMessage = intl ? intl.formatMessage : (msg) => msg.defaultMessage;

        return (
            <div className="extension-wizard-panel">
                {/* 顶部分类按钮 */}
                <div className="extension-wizard-categories">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={`extension-wizard-category ${wizardCategory === category.id ? 'extension-wizard-category-active' : ''}`}
                            onClick={() => this.handleCategoryChange(category.id)}
                        >
                            {category.title}
                        </div>
                    ))}
                </div>

                {/* 主体区域 */}
                <div className="extension-wizard-body">
                    {/* 左侧教程列表 */}
                    <div className="extension-wizard-sidebar">
                        <div className="extension-wizard-sidebar-header">
                            {currentCategory?.title}
                        </div>
                        <div className="extension-wizard-sidebar-items">
                            {categoryTutorials.map(tutorial => (
                                <div
                                    key={tutorial.id}
                                    className={`extension-wizard-sidebar-item ${wizardTutorial === tutorial.id ? 'extension-wizard-sidebar-item-active' : ''}`}
                                    onClick={() => this.handleTutorialChange(tutorial.id)}
                                >
                                    {tutorial.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右侧内容 */}
                    <div className="extension-wizard-detail">
                        {/* 章节导航 */}
                        {currentTutorial && currentTutorial.sections.length > 1 && (
                            <div className="extension-wizard-chapters">
                                {currentTutorial.sections.map((section, index) => (
                                    <button
                                        key={index}
                                        className={`extension-wizard-chapter ${wizardChapter === index ? 'extension-wizard-chapter-active' : ''}`}
                                        onClick={() => this.handleChapterChange(index)}
                                    >
                                        {section.title || formatMessage(messages.chapterDefault, { number: index + 1 })}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 章节内容 */}
                        <div className="extension-wizard-chapter-content">
                            {currentTutorial ? (
                                currentTutorial.sections.map((section, index) => (
                                    wizardChapter === null || wizardChapter === index ? (
                                        <div key={index} className="extension-wizard-tutorial-section">
                                            {section.title && <h3>{section.title}</h3>}
                                            {section.content.length > 0 && (
                                                <ReactMarkdown
                                                    className="extension-wizard-markdown"
                                                    components={{
                                                        h1: ({node, ...props}) => <h1 {...props} />,
                                                        h2: ({node, ...props}) => <h2 {...props} />,
                                                        h3: ({node, ...props}) => <h3 {...props} />,
                                                        h4: ({node, ...props}) => <h4 {...props} />,
                                                        p: ({node, ...props}) => <p {...props} />,
                                                        ul: ({node, ...props}) => <ul {...props} />,
                                                        ol: ({node, ...props}) => <ol {...props} />,
                                                        li: ({node, ...props}) => <li {...props} />,
                                                        code: ({node, inline, ...props}) => inline ? <code {...props} /> : <pre><code {...props} /></pre>,
                                                        pre: ({node, ...props}) => <pre {...props} />,
                                                        strong: ({node, ...props}) => <strong {...props} />,
                                                        em: ({node, ...props}) => <em {...props} />,
                                                        blockquote: ({node, ...props}) => <blockquote {...props} />,
                                                        hr: ({node, ...props}) => <hr {...props} />
                                                    }}
                                                >
                                                    {section.content.join('\n')}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    ) : null
                                ))
                            ) : (
                                <div className="extension-wizard-chapter-content-empty">
                                    {formatMessage(messages.comingSoon)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ExtensionEditorWizardPanel.propTypes = {
    initialCategory: PropTypes.string,
    initialTutorial: PropTypes.string,
    initialChapter: PropTypes.number,
    onCategoryChange: PropTypes.func,
    onTutorialChange: PropTypes.func,
    onChapterChange: PropTypes.func,
    intl: PropTypes.object
};

export default ExtensionEditorWizardPanel;