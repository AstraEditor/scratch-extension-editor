import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import './extension-editor-wizard-panel.css';

const messages = defineMessages({
    basicTutorial: {
        defaultMessage: '基础教程',
        description: 'Basic tutorial',
        id: 'tw.extensionEditorTabs.basicTutorial'
    },
    blockTypes: {
        defaultMessage: '积木类型',
        description: 'Block types',
        id: 'tw.extensionEditorTabs.blockTypes'
    },
    arguments: {
        defaultMessage: '参数定义',
        description: 'Arguments',
        id: 'tw.extensionEditorTabs.arguments'
    },
    advanced: {
        defaultMessage: '高级功能',
        description: 'Advanced',
        id: 'tw.extensionEditorTabs.advanced'
    },
    comingSoon: {
        defaultMessage: '内容即将推出',
        description: 'Coming soon',
        id: 'tw.extensionEditorTabs.comingSoon'
    }
});

class ExtensionEditorWizardPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wizardCategory: props.initialCategory || 'basic',
            wizardTutorial: props.initialTutorial || null,
            wizardChapter: props.initialChapter || null
        };
    }

    handleWizardCategoryChange = (category) => {
        this.setState({
            wizardCategory: category,
            wizardTutorial: null,
            wizardChapter: null
        });
        if (this.props.onCategoryChange) {
            this.props.onCategoryChange(category);
        }
    };

    handleWizardTutorialChange = (tutorialId) => {
        this.setState({
            wizardTutorial: tutorialId,
            wizardChapter: 0
        });
        if (this.props.onTutorialChange) {
            this.props.onTutorialChange(tutorialId);
        }
    };

    handleWizardChapterChange = (chapterIndex) => {
        this.setState({ wizardChapter: chapterIndex });
        if (this.props.onChapterChange) {
            this.props.onChapterChange(chapterIndex);
        }
    };

    render() {
        const { wizardCategory, wizardTutorial, wizardChapter } = this.state;
        const { intl } = this.props;
        
        const sidebarItems = this.getWizardSidebarItems();
        const tutorialContent = this.getWizardTutorialContent();
        
        const categoryLabels = {
            basic: messages.basicTutorial,
            blocks: messages.blockTypes,
            arguments: messages.arguments,
            advanced: messages.advanced
        };

        return (
            <div className="extension-wizard-panel">
                {/* 顶部分类菜单 */}
                <div className="extension-wizard-categories">
                    <div
                        className={`extension-wizard-category ${wizardCategory === 'basic' ? 'extension-wizard-category-active' : ''}`}
                        onClick={() => this.handleWizardCategoryChange('basic')}
                    >
                        <FormattedMessage {...messages.basicTutorial} />
                    </div>
                    <div
                        className={`extension-wizard-category ${wizardCategory === 'blocks' ? 'extension-wizard-category-active' : ''}`}
                        onClick={() => this.handleWizardCategoryChange('blocks')}
                    >
                        <FormattedMessage {...messages.blockTypes} />
                    </div>
                    <div
                        className={`extension-wizard-category ${wizardCategory === 'arguments' ? 'extension-wizard-category-active' : ''}`}
                        onClick={() => this.handleWizardCategoryChange('arguments')}
                    >
                        <FormattedMessage {...messages.arguments} />
                    </div>
                    <div
                        className={`extension-wizard-category ${wizardCategory === 'advanced' ? 'extension-wizard-category-active' : ''}`}
                        onClick={() => this.handleWizardCategoryChange('advanced')}
                    >
                        <FormattedMessage {...messages.advanced} />
                    </div>
                </div>

                {/* 主体区域 */}
                <div className="extension-wizard-body">
                    {/* 左侧教程目录 */}
                    <div className="extension-wizard-sidebar">
                        <div className="extension-wizard-sidebar-header">
                            <FormattedMessage {...categoryLabels[wizardCategory]} />
                        </div>
                        
                        <div className="extension-wizard-sidebar-items">
                            {sidebarItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`extension-wizard-sidebar-item ${wizardTutorial === item.id ? 'extension-wizard-sidebar-item-active' : ''}`}
                                    onClick={() => this.handleWizardTutorialChange(item.id)}
                                >
                                    {item.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右侧详情 */}
                    <div className="extension-wizard-detail">
                        {/* 章节列表 */}
                        {tutorialContent && tutorialContent.sections && tutorialContent.sections.length > 1 && (
                            <div className="extension-wizard-chapters">
                                {tutorialContent.sections.map((section, index) => (
                                    <button
                                        key={index}
                                        className={`extension-wizard-chapter ${wizardChapter === index ? 'extension-wizard-chapter-active' : ''}`}
                                        onClick={() => this.handleWizardChapterChange(index)}
                                    >
                                        {section.title || `章节 ${index + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 章节内容 */}
                        <div className="extension-wizard-chapter-content">
                            {tutorialContent ? (
                                tutorialContent.sections.map((section, index) => (
                                    wizardChapter === null || wizardChapter === index ? (
                                        <div key={index} className="extension-wizard-tutorial-section">
                                            {section.title && (
                                                <h3>{section.title}</h3>
                                            )}
                                            {section.content && (
                                                <p>{section.content}</p>
                                            )}
                                            {section.code && (
                                                <pre className="extension-wizard-tutorial-code">
                                                    <code>{section.code}</code>
                                                </pre>
                                            )}
                                        </div>
                                    ) : null
                                ))
                            ) : (
                                <div className="extension-wizard-chapter-content-empty">
                                    <FormattedMessage {...messages.comingSoon} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    getWizardSidebarItems = () => {
        const { wizardCategory } = this.state;
        const { intl } = this.props;
        
        const items = {
            basic: [
                { id: 'basic-intro', title: intl.formatMessage(messages.basicTutorial) },
                { id: 'basic-structure', title: '扩展结构' },
                { id: 'basic-getinfo', title: 'getInfo 方法' },
                { id: 'basic-opcode', title: '积木操作方法' }
            ],
            blocks: [
                { id: 'blocks-command', title: '命令积木' },
                { id: 'blocks-reporter', title: '报告积木' },
                { id: 'blocks-boolean', title: '布尔积木' },
                { id: 'blocks-hat', title: '事件积木' }
            ],
            arguments: [
                { id: 'args-string', title: '字符串参数' },
                { id: 'args-number', title: '数字参数' },
                { id: 'args-color', title: '颜色参数' },
                { id: 'args-menu', title: '菜单参数' }
            ],
            advanced: [
                { id: 'adv-runtime', title: '使用 Runtime' },
                { id: 'adv-target', title: '访问角色' },
                { id: 'adv-variables', title: '操作变量' },
                { id: 'adv-broadcast', title: '广播消息' }
            ]
        };
        
        return items[wizardCategory] || [];
    };

    getWizardTutorialContent = () => {
        const { wizardTutorial } = this.state;
        
        const tutorials = {
            'basic-intro': {
                title: this.props.intl.formatMessage(messages.basicTutorial),
                sections: [
                    {
                        title: '什么是 Scratch 扩展？',
                        content: 'Scratch 扩展是用 JavaScript 编写的代码模块，可以为 Scratch 添加新的积木和功能。扩展可以创建自定义的积木块，让用户在 Scratch 项目中使用。'
                    },
                    {
                        title: '基本结构',
                        code: `class MyExtension {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getInfo() {
    return {
      id: 'myextension',
      name: '我的扩展',
      color1: '#FF6680',
      color2: '#FF4D6A',
      blocks: []
    };
  }
}

Scratch.extensions.register(new MyExtension());`
                    }
                ]
            },
            'basic-structure': {
                title: '扩展结构',
                sections: [
                    {
                        title: '类定义',
                        content: '扩展必须是一个 JavaScript 类，包含构造函数和必需的方法。'
                    },
                    {
                        title: '构造函数',
                        code: `constructor(runtime) {
  this.runtime = runtime;
}`
                    },
                    {
                        title: 'getInfo 方法',
                        content: '返回扩展的元数据，包括 ID、名称、颜色和积木定义。'
                    },
                    {
                        title: '注册扩展',
                        code: `Scratch.extensions.register(new MyExtension());`
                    }
                ]
            },
            'basic-getinfo': {
                title: 'getInfo 方法',
                sections: [
                    {
                        title: '返回对象属性',
                        code: `getInfo() {
  return {
    id: 'myextension',        // 扩展的唯一标识
    name: '我的扩展',          // 显示名称
    color1: '#FF6680',         // 主颜色
    color2: '#FF4D6A',         // 次颜色
    color3: '#CC3D55',         // 第三颜色
    blocks: []                 // 积木定义数组
  };
}`
                    },
                    {
                        title: '颜色说明',
                        content: 'color1、color2、color3 定义积木的配色方案，通常使用同色系的渐变色。'
                    }
                ]
            },
            'basic-opcode': {
                title: '积木操作方法',
                sections: [
                    {
                        title: '定义操作方法',
                        code: `// 在 getInfo() 的 blocks 数组中定义：
{
  opcode: 'hello',           // 方法名
  blockType: 'command',      // 积木类型
  text: '你好 [MESSAGE]',    // 积木文本
  arguments: {                // 参数定义
    MESSAGE: {
      type: 'string',
      defaultValue: '世界'
    }
  }
}

// 定义对应的操作方法
hello(args) {
  console.log('Hello, ' + args.MESSAGE);
}`
                    },
                    {
                        title: '方法命名',
                        content: '操作方法名必须与 opcode 一致，接收 args 参数，其中包含所有参数的值。'
                    }
                ]
            },
            'blocks-command': {
                title: '命令积木',
                sections: [
                    {
                        title: '定义命令积木',
                        content: '命令积木执行动作但不返回值，用于控制行为。'
                    },
                    {
                        title: '示例代码',
                        code: `{
  opcode: 'sayHello',
  blockType: 'command',
  text: '打招呼',
  arguments: {}
}

sayHello(args) {
  console.log('你好！');
}`
                    },
                    {
                        title: '使用场景',
                        content: '用于执行不返回值的操作，如显示消息、播放声音、移动角色等。'
                    }
                ]
            },
            'blocks-reporter': {
                title: '报告积木',
                sections: [
                    {
                        title: '定义报告积木',
                        content: '报告积木返回一个值，可以是字符串、数字等。'
                    },
                    {
                        title: '示例代码',
                        code: `{
  opcode: 'getRandom',
  blockType: 'reporter',
  text: '随机数 [MIN] 到 [MAX]',
  arguments: {
    MIN: { type: 'number', defaultValue: 1 },
    MAX: { type: 'number', defaultValue: 100 }
  }
}

getRandom(args) {
  const min = args.MIN;
  const max = args.MAX;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}`
                    }
                ]
            },
            'blocks-boolean': {
                title: '布尔积木',
                sections: [
                    {
                        title: '定义布尔积木',
                        content: '布尔积木返回 true 或 false，用于条件判断。'
                    },
                    {
                        title: '示例代码',
                        code: `{
  opcode: 'isEven',
  blockType: 'boolean',
  text: '[NUMBER] 是偶数?',
  arguments: {
    NUMBER: { type: 'number', defaultValue: 10 }
  }
}

isEven(args) {
  return args.NUMBER % 2 === 0;
}`
                    }
                ]
            },
            'blocks-hat': {
                title: '事件积木',
                sections: [
                    {
                        title: '定义事件积木',
                        content: '事件积木在特定事件发生时触发，不需要用户点击。'
                    },
                    {
                        title: '示例代码',
                        code: `{
  opcode: 'whenKeyPressed',
  blockType: 'hat',
  text: '当按下 [KEY] 键',
  arguments: {
    KEY: { 
      type: 'string',
      menu: 'KEYS',
      defaultValue: 'space'
    }
  }
}

whenKeyPressed(args) {
  // 当按下指定键时触发
}`
                    }
                ]
            },
            'args-string': {
                title: '字符串参数',
                sections: [
                    {
                        title: '定义字符串参数',
                        code: `{
  opcode: 'sayMessage',
  blockType: 'command',
  text: '说 [MESSAGE]',
  arguments: {
    MESSAGE: {
      type: 'string',
      defaultValue: '你好'
    }
  }
}

sayMessage(args) {
  console.log(args.MESSAGE);
}`
                    },
                    {
                        title: '使用方式',
                        content: '在 args.MESSAGE 中获取用户输入的字符串值。'
                    }
                ]
            },
            'args-number': {
                title: '数字参数',
                sections: [
                    {
                        title: '定义数字参数',
                        code: `{
  opcode: 'multiply',
  blockType: 'reporter',
  text: '[A] 乘以 [B]',
  arguments: {
    A: { type: 'number', defaultValue: 2 },
    B: { type: 'number', defaultValue: 3 }
  }
}

multiply(args) {
  return args.A * args.B;
}`
                    }
                ]
            },
            'args-color': {
                title: '颜色参数',
                sections: [
                    {
                        title: '定义颜色参数',
                        code: `{
  opcode: 'setColor',
  blockType: 'command',
  text: '设置颜色为 [COLOR]',
  arguments: {
    COLOR: { type: 'color', defaultValue: '#FF6680' }
  }
}

setColor(args) {
  // args.COLOR 是十六进制颜色值
  console.log(args.COLOR);
}`
                    }
                ]
            },
            'args-menu': {
                title: '菜单参数',
                sections: [
                    {
                        title: '定义菜单参数',
                        code: `{
  opcode: 'setDirection',
  blockType: 'command',
  text: '朝向 [DIRECTION]',
  arguments: {
    DIRECTION: {
      type: 'string',
      menu: 'DIRECTIONS',
      defaultValue: 'right'
    }
  }
}

// 在 getInfo() 中定义菜单
getInfo() {
  return {
    menus: {
      DIRECTIONS: {
        acceptReporters: false,
        items: ['up', 'down', 'left', 'right']
      }
    },
    blocks: [...]
  };
}

setDirection(args) {
  console.log('方向:', args.DIRECTION);
}`
                    }
                ]
            },
            'adv-runtime': {
                title: '使用 Runtime',
                sections: [
                    {
                        title: '访问 Runtime 对象',
                        code: `constructor(runtime) {
  this.runtime = runtime;
}

// 使用 runtime 功能
someMethod(args) {
  // 获取当前目标（角色）
  const target = this.runtime.getTargetForStage();
  
  // 访问编辑器
  const editingTarget = this.runtime.editingTarget;
}`
                    },
                    {
                        title: 'Runtime 功能',
                        content: 'runtime 提供对 Scratch 虚拟机的访问，可以操作项目、角色、变量等。'
                    }
                ]
            },
            'adv-target': {
                title: '访问角色',
                sections: [
                    {
                        title: '获取角色信息',
                        code: `// 获取当前角色
const target = this.runtime.editingTarget;

// 获取角色名称
const name = target.getName();

// 获取角色位置
const x = target.x;
const y = target.y;

// 获取角色方向
const direction = target.direction;`
                    }
                ]
            },
            'adv-variables': {
                title: '操作变量',
                sections: [
                    {
                        title: '读写变量',
                        code: `// 获取目标
const target = this.runtime.editingTarget;

// 读取变量
const value = target.lookupVariableByName('我的变量').value;

// 设置变量
target.lookupVariableByName('我的变量').value = 100;

// 创建变量
const newVar = target.createVariable('新变量', false); // false = 局部变量`
                    }
                ]
            },
            'adv-broadcast': {
                title: '广播消息',
                sections: [
                    {
                        title: '发送广播',
                        code: `// 发送广播消息
this.runtime.emit('BROADCAST', {
  broadcastId: 'my_broadcast',
  target: this.runtime.editingTarget,
  source: 'my_extension'
});

// 等待广播
const wait = () => new Promise(resolve => {
  const listener = () => {
    this.runtime.removeListener('BROADCAST', listener);
    resolve();
  };
  this.runtime.addListener('BROADCAST', listener);
});

// 使用等待
await wait();`
                    }
                ]
            }
        };
        
        return tutorials[wizardTutorial] || null;
    };
}

ExtensionEditorWizardPanel.propTypes = {
    intl: intlShape.isRequired,
    initialCategory: PropTypes.string,
    initialTutorial: PropTypes.string,
    initialChapter: PropTypes.number,
    onCategoryChange: PropTypes.func,
    onTutorialChange: PropTypes.func,
    onChapterChange: PropTypes.func
};

export default injectIntl(ExtensionEditorWizardPanel);