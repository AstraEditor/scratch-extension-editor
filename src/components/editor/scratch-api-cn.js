const scratch = `/**
 * Scratch 全局 API 类型定义
 * 本文件提供扩展可用的 Scratch 全局对象的类型定义和 JSDoc
 */

/**
 * 积木输入的参数类型
 * @enum {string}
 */
declare enum ArgumentType {
    /** 带角度选择器的数值 */
    ANGLE = 'angle',

    /** 带六边形占位符的布尔值 */
    BOOLEAN = 'Boolean',

    /** 带颜色选择器的数值 */
    COLOR = 'color',

    /** 带文本字段的数值 */
    NUMBER = 'number',

    /** 带文本字段的字符串值 */
    STRING = 'string',

    /** 带矩阵字段的字符串值 */
    MATRIX = 'matrix',

    /** 带音符选择器（钢琴）字段的 MIDI 音符号 */
    NOTE = 'note',

    /** 积木上的内联图像（作为标签的一部分） */
    IMAGE = 'image',

    /** 当前目标中的造型名称 */
    COSTUME = 'costume',

    /** 当前目标中的声音名称 */
    SOUND = 'sound'
}

/**
 * 积木类型
 * @enum {string}
 */
declare enum BlockType {
    /** 六边形形状的布尔报告块 */
    BOOLEAN = 'Boolean',

    /** 按钮（非实际积木），用于特殊操作，如创建变量 */
    BUTTON = 'button',

    /** 文本标签（非实际积木），用于添加注释或标注积木 */
    LABEL = 'label',

    /** 命令积木 */
    COMMAND = 'command',

    /**
     * 专用命令积木，可能运行或不运行子分支
     * 无论是否运行子分支，线程都继续执行下一个积木
     */
    CONDITIONAL = 'conditional',

    /**
     * 专用帽子积木，无实现函数
     * 仅当其他代码发出相应事件时，此堆栈才运行
     */
    EVENT = 'event',

    /** 有条件启动积木堆栈的帽子积木 */
    HAT = 'hat',

    /**
     * 专用命令积木，可能运行或不运行子分支
     * 如果运行子分支，线程将再次评估循环积木
     */
    LOOP = 'loop',

    /** 具有数值或字符串值的一般报告块 */
    REPORTER = 'reporter',

    /** 任意 scratch-blocks XML */
    XML = 'xml'
}

/**
 * 积木形状类型
 * @enum {number}
 */
declare enum BlockShape {
    /** 报告块的圆形形状 */
    ROUND = 1,

    /** 布尔块的六边形形状 */
    HEXAGONAL = 2,

    /** 命令积木的方形形状 */
    SQUARE = 3
}

/**
 * 目标类型
 * @enum {string}
 */
declare enum TargetType {
    /** 角色目标 */
    SPRITE = 'sprite',

    /** 舞台目标 */
    STAGE = 'stage'
}

/**
 * 类型转换的 Cast 工具函数接口
 */
interface CastInterface {
    /**
     * 将值转换为布尔值
     * @param value - 要转换的值
     * @returns 布尔值
     */
    toBoolean(value: any): boolean;

    /**
     * 将值转换为数字
     * @param value - 要转换的值
     * @returns 数字值
     */
    toNumber(value: any): number;

    /**
     * 将值转换为字符串
     * @param value - 要转换的值
     * @returns 字符串值
     */
    toString(value: any): string;

    /**
     * 比较两个值是否相等
     * @param v1 - 第一个值
     * @param v2 - 第二个值
     * @returns 值是否相等
     */
    compare(v1: any, v2: any): boolean;

    /**
     * 检查值是否为有效数字
     * @param value - 要检查的值
     * @returns 值是否为有效数字
     */
    isNumber(value: any): boolean;

    /**
     * 获取用于列表排序的舍入值
     * @param value - 要舍入的值
     * @returns 舍入后的值
     */
    toRounded(value: any): number;
}

/**
 * TurboWarp 提供的外部工具接口
 */
interface ExternalInterface {
    /** JSON 工具 */
    JSON: {
        /**
         * 安全解析 JSON 字符串
         * @param text - 要解析的 JSON 字符串
         * @returns 解析后的对象，无效时返回 null
         */
        parse(text: string): any;
    };

    /** Fetch 工具 */
    fetch: {
        /**
         * 支持超时的 fetch
         * @param url - 要获取的 URL
         * @param options - Fetch 选项
         * @returns 响应 Promise
         */
        (url: string, options?: RequestInit): Promise<Response>;
    };
}

/**
 * 扩展注册接口
 */
interface ExtensionsInterface {
    /** 是否为非沙箱扩展 */
    unsandboxed: boolean;

    /**
     * 注册扩展
     * @param extensionObject - 要注册的扩展对象
     */
    register(extensionObject: ExtensionObject): void;
}

/**
 * 扩展对象结构
 */
interface ExtensionObject {
    /** 扩展 ID */
    id: string;

    /** 扩展名称 */
    name: string;

    /** 积木定义 */
    blocks?: ExtensionBlock[];

    /** 菜单定义 */
    menus?: Record<string, ExtensionMenu>;

    /** 积木实现函数 */
    [opcode: string]: Function | any;
}

/**
 * 扩展积木定义
 */
interface ExtensionBlock {
    /** 积木操作码（函数名） */
    opcode: string;

    /** 积木类型 */
    blockType: BlockType | string;

    /** 带占位符的积木文本 */
    text: string;

    /** 积木参数定义 */
    arguments?: Record<string, ExtensionArgument>;

    /** 是否为终止积木（停止执行） */
    isTerminal?: boolean;

    /** 此积木是否应隐藏面板 */
    hideFromPalette?: boolean;

    /** 此积木是否为边缘触发 */
    isEdgeActivated?: boolean;

    /** 是否重启现有线程 */
    shouldRestartExistingThreads?: boolean;

    /** 此积木适用的目标过滤器 */
    filter?: TargetType | string;

    /** 禁用特定积木 */
    disableMonitor?: boolean;
}

/**
 * 扩展参数定义
 */
interface ExtensionArgument {
    /** 参数类型 */
    type: ArgumentType | string;

    /** 默认值 */
    defaultValue?: any;

    /** 下拉菜单名称 */
    menu?: string;

    /** 变量参数的变量类型 */
    variableType?: string;
}

/**
 * 扩展菜单定义
 */
interface ExtensionMenu {
    /** 接受报告块（允许类型输入） */
    acceptReporters?: boolean;

    /** 菜单项 */
    items: Array<{ text: string; value: string }> | string[] | (() => Array<{ text: string; value: string }>);
}

/**
 * 非沙箱扩展可用的全局 Scratch 对象
 */
declare const Scratch: {
    /** 参数类型枚举 */
    ArgumentType: typeof ArgumentType;

    /** 积木类型枚举 */
    BlockType: typeof BlockType;

    /** 积木形状枚举 */
    BlockShape: typeof BlockShape;

    /** 目标类型枚举 */
    TargetType: typeof TargetType;

    /** Cast 工具函数 */
    Cast: CastInterface;

    /** 外部工具 */
    external: ExternalInterface;

    /** 扩展管理接口 */
    extensions: ExtensionsInterface;

    /** 虚拟机实例 */
    vm: VirtualMachine;

    /** 渲染器实例 */
    renderer: RenderWebGL | null;

    /**
     * 检查扩展是否可以从 URL 获取
     * @param url - 要检查的 URL
     * @returns Promise 解析为是否允许获取
     * @example
     * if (await Scratch.canFetch('https://example.com/api')) {
     *     const response = await Scratch.fetch('https://example.com/api');
     * }
     */
    canFetch(url: string): Promise<boolean>;

    /**
     * 检查扩展是否可以打开新窗口
     * @param url - 要打开的 URL
     * @returns Promise 解析为是否允许打开
     */
    canOpenWindow(url: string): Promise<boolean>;

    /**
     * 检查扩展是否可以重定向页面
     * @param url - 要重定向到的 URL
     * @returns Promise 解析为是否允许重定向
     */
    canRedirect(url: string): Promise<boolean>;

    /**
     * 检查扩展是否可以录音
     * @returns Promise 解析为是否允许录音
     */
    canRecordAudio(): Promise<boolean>;

    /**
     * 检查扩展是否可以录像
     * @returns Promise 解析为是否允许录像
     */
    canRecordVideo(): Promise<boolean>;

    /**
     * 检查扩展是否可以读取剪贴板
     * @returns Promise 解析为是否允许读取剪贴板
     */
    canReadClipboard(): Promise<boolean>;

    /**
     * 检查扩展是否可以显示通知
     * @returns Promise 解析为是否允许通知
     */
    canNotify(): Promise<boolean>;

    /**
     * 检查扩展是否可以访问地理位置
     * @returns Promise 解析为是否允许地理位置访问
     */
    canGeolocate(): Promise<boolean>;

    /**
     * 检查扩展是否可以嵌入内容
     * @param url - 要嵌入的 URL
     * @returns Promise 解析为是否允许嵌入
     */
    canEmbed(url: string): Promise<boolean>;

    /**
     * 检查扩展是否可以下载文件
     * @param url - 要下载的 URL
     * @param name - 建议的文件名
     * @returns Promise 解析为是否允许下载
     */
    canDownload(url: string, name?: string): Promise<boolean>;

    /**
     * 带安全检查地获取 URL
     * @param url - 要获取的 URL 或 Request 对象
     * @param options - Fetch 选项
     * @returns Promise 解析为 Response
     * @throws 如果获取权限被拒绝则抛��错误
     * @example
     * const response = await Scratch.fetch('https://api.example.com/data');
     * const data = await response.json();
     */
    fetch(url: string | Request, options?: RequestInit): Promise<Response>;

    /**
     * 打开新的浏览器窗口/标签页
     * @param url - 要打开的 URL
     * @param features - 窗口特性
     * @returns WindowProxy 或 null
     * @throws 如果权限被拒绝则抛出错误
     */
    openWindow(url: string, features?: string): Window | null;

    /**
     * 重定向当前页面
     * @param url - 要重定向到的 URL
     * @throws 如果权限被拒绝则抛出错误
     */
    redirect(url: string): void;

    /**
     * 触发文件下载
     * @param url - 要下载的 URL
     * @param name - 下载文件名
     * @throws 如果权限被拒绝则抛出错误
     * @example
     * Scratch.download('data:text/plain;base64,SGVsbG8gV29ybGQ=', 'hello.txt');
     */
    download(url: string, name: string): void;

    /**
     * 将文本翻译到当前语言环境
     * @param text - 要翻译的文本
     * @returns 翻译后的文本，无翻译时返回原文
     * @example
     * const label = Scratch.translate('Hello World');
     */
    translate(text: string): string;
};

/**
 * 用于 Scratch 2.0 兼容性的全局 ScratchExtensions 对象
 * @deprecated 请改用 Scratch.extensions.register
 */
declare const ScratchExtensions: {
    /**
     * 注册 Scratch 2.0 风格的扩展
     * @deprecated 请改用 Scratch.extensions.register
     */
    register(extensionId: string, extensionName: string, descriptor: any): void;

    /**
     * 注册非沙箱的 Scratch 2.0 风格扩展
     * @deprecated 请改用 Scratch.extensions.register
     */
    registerUnsandboxed(extensionId: string, extensionName: string, descriptor: any): void;
};

/**
 * VirtualMachine 接口（简化用于扩展）
 */
declare class VirtualMachine {
    /** VM 运行时 */
    runtime: Runtime;

    /** 扩展管理器 */
    extensionManager: ExtensionManager;

    /** 安全管理器 */
    securityManager: SecurityManager;
}

/**
 * Runtime 接口（简化用于扩展）
 */
declare class Runtime {
    /** 所有目标（角色和舞台） */
    targets: Target[];

    /** 当前运行的线程 */
    threads: Thread[];

    /** 舞台宽度 */
    stageWidth: number;

    /** 舞台高度 */
    stageHeight: number;

    /** 是否启用加速模式 */
    turboMode: boolean;

    /**
     * 启动帽子（事件）处理器
     * @param requestedHat - 要启动的帽子类型
     * @param optMatchFields - 可选匹配字段
     * @param optTarget - 可选目标
     * @returns 启动的线程
     */
    startHats(requestedHat: string, optMatchFields?: object, optTarget?: Target): Thread[];

    /** 发出项目更改事件 */
    emitProjectChanged(): void;

    /**
     * 获取舞台目标
     * @returns 舞台目标或 undefined
     */
    getTargetForStage(): Target | undefined;

    /**
     * 通过 ID 获取目标
     * @param id - 目标 ID
     * @returns 目标或 undefined
     */
    getTargetById(id: string): Target | undefined;

    /**
     * 通过名称获取角色目标
     * @param name - 角色名称
     * @returns 目标或 undefined
     */
    getSpriteTargetByName(name: string): Target | undefined;
}

/**
 * Target 表示角色或舞台
 */
declare class Target {
    /** 目标 ID */
    id: string;

    /** 关联的角色 */
    sprite: Sprite;

    /** 是否为舞台 */
    isStage: boolean;

    /** 当前 X 位置 */
    x: number;

    /** 当前 Y 位置 */
    y: number;

    /** 当前方向 */
    direction: number;

    /** 当前大小 */
    size: number;

    /** 是否可见 */
    visible: boolean;

    /** 当前音量 */
    volume: number;

    /** 获取目标名称 */
    getName(): string;

    /** 获取所有造型 */
    getCostumes(): Costume[];

    /** 获取所有声音 */
    getSounds(): Sound[];

    /**
     * 通过 ID 查找变量
     * @param id - 变量 ID
     */
    lookupVariableById(id: string): Variable | null;

    /**
     * 通过名称和类型查找变量
     * @param name - 变量名称
     * @param type - 变量类型
     */
    lookupVariableByNameAndType(name: string, type: string): Variable | null;
}

/**
 * Sprite 接口
 */
declare class Sprite {
    /** 角色名称 */
    name: string;

    /** 所有克隆体 */
    clones: Target[];

    /** 所有造型 */
    costumes: Costume[];

    /** 所有声音 */
    sounds: Sound[];
}

/**
 * 造型接口
 */
declare class Costume {
    /** 造型名称 */
    name: string;

    /** 资产 ID */
    assetId: string;

    /** 数据格式 */
    dataFormat: string;
}

/**
 * 声音接口
 */
declare class Sound {
    /** 声音名称 */
    name: string;

    /** 声音 ID */
    soundId: string;

    /** 资产 ID */
    assetId: string;
}

/**
 * 变量接口
 */
declare class Variable {
    /** 变量 ID */
    id: string;

    /** 变量名称 */
    name: string;

    /** 变量类型 */
    type: string;

    /** 变量值 */
    value: any;

    /** 是否为云变量 */
    isCloud: boolean;
}

/**
 * 线程接口
 */
declare class Thread {
    /** 此线程所属的目标 */
    target: Target;

    /** 顶层积木 ID */
    topBlock: string;

    /** 线程是否被终止 */
    isKilled: boolean;
}

/**
 * 扩展管理器接口
 */
declare class ExtensionManager {
    /**
     * 检查扩展是否已加载
     * @param extensionId - 扩展 ID
     */
    isExtensionLoaded(extensionId: string): boolean;

    /**
     * 通过 URL 或 ID 加载扩展
     * @param extensionURL - 扩展 URL 或 ID
     */
    loadExtensionURL(extensionURL: string): Promise<void>;
}

/**
 * 安全管理器接口
 */
declare class SecurityManager {
    /**
     * 检查扩展是否可以加载
     * @param extensionId - 扩展 ID
     * @param extensionURL - 扩展 URL
     */
    canLoadExtensionFromProject(extensionId: string, extensionURL: string): Promise<boolean>;
}

/**
 * RenderWebGL 接口
 */
declare class RenderWebGL {
    /**
     * 更新位图皮肤
     * @param skinId - 皮肤 ID
     * @param bitmap - 位图画布
     * @param bitmapResolution - 位图分辨率
     * @param rotationCenter - 旋转中心
     */
    updateBitmapSkin(skinId: number, bitmap: HTMLCanvasElement, bitmapResolution: number, rotationCenter: [number, number]): void;

    /**
     * 更新 SVG 皮肤
     * @param skinId - 皮肤 ID
     * @param svg - SVG 字符串
     * @param rotationCenter - 旋转中心
     */
    updateSVGSkin(skinId: number, svg: string, rotationCenter: [number, number]): void;
}
`

export default scratch;