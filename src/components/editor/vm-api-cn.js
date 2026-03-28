const vm = `/**
 * Scratch VM API 类型定义
 * 本文件为 Scratch 虚拟机提供类型定义和 JSDoc
 */

declare namespace Scratch {
    /**
     * Target 表示 Scratch 项目中的角色或舞台。
     */
    interface Target {
        id: string;
        sprite: Sprite;
        isStage: boolean;
        isOriginal: boolean;
        blocks: Blocks;
        variables: Record<string, Variable>;
        comments: Record<string, Comment>;
        currentCostume: number;
        x: number;
        y: number;
        direction: number;
        size: number;
        visible: boolean;
        volume: number;
        getCostumes(): Costume[];
        getSounds(): Sound[];
        getName(): string;
        postSpriteInfo(data: object): void;
        addCostume(costume: Costume, index?: number): void;
        setCostume(index: number): void;
        deleteCostume(index: number): Costume | null;
        renameCostume(index: number, newName: string): void;
        addSound(sound: Sound, index?: number): void;
        deleteSound(index: number): Sound | null;
        renameSound(index: number, newName: string): void;
        lookupVariableById(id: string): Variable | null;
        lookupVariableByNameAndType(name: string, type: string): Variable | null;
        toJSON(): object;
        isSprite(): boolean;
        startDrag(): void;
        stopDrag(): void;
        updateAllDrawableProperties(): void;
        fixUpVariableReferences(): void;
        duplicate(): Promise<Target>;
        goBehindOther(other: Target): void;
        deleteMonitors(): void;
    }

    interface Blocks {
        _blocks: Record<string, Block>;
        blocklyListen(e: BlocklyEvent): void;
        createBlock(block: Block): void;
        deleteBlock(blockId: string): void;
        deleteAllBlocks(): void;
        toXML(comments: Record<string, Comment>): string;
        updateAssetName(oldName: string, newName: string, type: string): void;
        updateTargetSpecificBlocks(isStage: boolean): void;
    }

    interface Block {
        id: string;
        opcode: string;
        fields: Record<string, { id?: string; name: string; value?: any }>;
        inputs: Record<string, { block: string | null; shadow: string | null }>;
        next: string | null;
        parent: string | null;
        shadow: boolean;
        topLevel: boolean;
        mutation?: object;
    }

    interface BlocklyEvent {
        type: string;
        blockId?: string;
        [key: string]: any;
    }

    interface Variable {
        id: string;
        name: string;
        type: string;
        value: any;
        isCloud: boolean;
        toXML(isLocal?: boolean): string;
    }

    interface Comment {
        id: string;
        blockId: string | null;
        x: number;
        y: number;
        width: number;
        height: number;
        minimized: boolean;
        text: string;
        toXML(): string;
    }

    interface Costume {
        name: string;
        assetId: string;
        dataFormat: string;
        md5: string;
        skinId: number;
        rotationCenterX: number;
        rotationCenterY: number;
        bitmapResolution: number;
        size: [number, number];
        asset: Asset;
        broken?: boolean;
    }

    interface Sound {
        name: string;
        soundId: string;
        assetId: string;
        dataFormat: string;
        md5: string;
        format: string;
        sampleCount: number;
        rate: number;
        asset: Asset;
        broken?: boolean;
    }

    interface Asset {
        assetId: string;
        dataFormat: string;
        data: Uint8Array;
        decodeText(): string;
        encodeDataURI(): string;
    }

    interface Sprite {
        name: string;
        clones: Target[];
        costumes: Costume[];
        sounds: Sound[];
        soundBank: SoundBank;
    }

    interface SoundBank {
        getSoundPlayer(id: string): SoundPlayer;
    }

    interface SoundPlayer {
        buffer: AudioBuffer;
    }
}

/**
 * Thread 表示 VM 中正在运行的脚本。
 */
declare class Thread {
    target: Scratch.Target;
    topBlock: string;
    blockGlowInFrame: boolean;
    requestScriptGlowInFrame: boolean;
    stack: string[];
    stackFrames: StackFrame[];
    isKilled: boolean;
    pauseScript: boolean;
}

interface StackFrame {
    op: string;
    loop: boolean;
    warpMode: boolean;
    reported: any[];
    waitingReporter: string | null;
}

/**
 * Sequencer 管理步进线程。
 */
declare class Sequencer {
    stepThreads(): void;
}

/**
 * Profiler 用于性能监控。
 */
declare class Profiler {
    id: number;
}

/**
 * MonitorRecord 用于舞台监视器。
 */
declare class MonitorRecord {
    id: string;
    targetId: string;
    opcode: string;
    params: Record<string, any>;
    x: number;
    y: number;
    visible: boolean;
    width: number;
    height: number;
    value: any;
    sliderMin: number;
    sliderMax: number;
    sliderStep: number;
}

/**
 * Runtime 类管理角色、脚本和序列器。
 */
declare class Runtime {
    /**
     * 角色管理和存储。
     */
    targets: Scratch.Target[];

    /**
     * 按执行顺序反向排列的角色。顺序与可绘制对象相同。
     */
    executableTargets: Scratch.Target[];

    /**
     * VM 中当前正在运行的线程列表。
     * 线程在执行开始时添加，在执行结束时清理。
     */
    threads: Thread[];

    /**
     * 序列器管理步进线程。
     */
    sequencer: Sequencer;

    /**
     * 项目是否处于"加速模式"。
     */
    turboMode: boolean;

    /**
     * 当前步长。随模式切换而变化。
     */
    currentStepTime: number;

    /**
     * 舞台宽度。
     */
    stageWidth: number;

    /**
     * 舞台高度。
     */
    stageHeight: number;

    /**
     * 是否启用补帧。
     */
    interpolationEnabled: boolean;

    /**
     * 调试模式标志。
     */
    debug: boolean;

    /**
     * TW: 打包运行时模式标志。
     */
    isPackaged: boolean;

    /**
     * IO 设备容器。
     */
    ioDevices: {
        /**
         * 计时设备用于计时。
         */
        clock: {
            projectTimer: number;
            currentMSecs: number;
        };
        /**
         * 云设备用于云变量。
         */
        cloud: {
            provider: CloudProvider | null;
            stage: Scratch.Target | null;
            setStage(stage: Scratch.Target | null): void;
            requestUpdateVariable(name: string, value: any): void;
        };
        /**
         * 键盘设备。
         */
        keyboard: {
            postData(data: { key?: string; isDown?: boolean }): void;
            getData(): { key: string; isDown: boolean };
        };
        /**
         * 鼠标设备。
         */
        mouse: {
            postData(data: { x?: number; y?: number; button?: number; isDown?: boolean }): void;
            getX(): number;
            getY(): number;
            getButtonState(button: number): boolean;
        };
        /**
         * 鼠标滚轮设备。
         */
        mouseWheel: {
            postData(data: { deltaX?: number; deltaY?: number }): void;
            getDelta(): { x: number; y: number };
        };
        /**
         * 视频设备用于摄像头感应。
         */
        video: {
            provider: VideoProvider | null;
            setProvider(provider: VideoProvider): void;
            detectFace(): void;
        };
        /**
         * 用户数据设备用于用户名。
         */
        userData: {
            getUsername(): string;
        };
    };

    /**
     * 负责管理 VM 的多个计时器。
     */
    frameLoop: {
        requestLoop(callback: () => void): void;
    };

    /**
     * 侧边栏积木的存储容器。
     */
    flyoutBlocks: Scratch.Blocks;

    /**
     * 监视器积木的存储容器。
     */
    monitorBlocks: Scratch.Blocks;

    /**
     * 检查运行时是否有任何云数据。
     * @returns 运行时当前是否有任何云变量。
     */
    hasCloudData(): boolean;

    /**
     * 检查是否可以添加新的云变量。
     * @returns 是否可以添加新的云变量。
     */
    canAddCloudVariable(): boolean;

    /**
     * 获取运行时中云变量的数量。
     * @returns 云变量的数量。
     */
    getNumberOfCloudVariables(): number;

    /**
     * 为给定的帽子类型启动帽子（事件处理器）。
     * @param requestedHat - 要启动的帽子类型。
     * @param optMatchFields - 帽子的可选匹配字段。
     * @param optTarget - 可选的目标来启动帽子。
     * @returns 已启动的线程数组。
     */
    startHats(requestedHat: string, optMatchFields?: object, optTarget?: Scratch.Target): Thread[];

    /**
     * 启动帽子并立即执行。
     * @param requestedHat - 要启动的帽子类型。
     * @param optMatchFields - 帽子的可选匹配字段。
     * @param optTarget - 可选的目标来启动帽子。
     */
    startHatsAndExecute(requestedHat: string, optMatchFields?: object, optTarget?: Scratch.Target): void;

    /**
     * 停止所有线程和正在运行的活动。
     */
    stopAll(): void;

    /**
     * 停止特定目标的线程。
     * @param target - 要停止线程的目标。
     */
    stopForTarget(target: Scratch.Target): void;

    /**
     * "绿旗"处理器 - 启动所有以绿旗开始的线程。
     */
    greenFlag(): void;

    /**
     * 发出项目更改事件。
     */
    emitProjectChanged(): void;

    /**
     * 发出关于可用角色的元数据。
     * @param emitProjectChange - 如果为 true，同时发出项目更改事件。
     */
    emitTargetsUpdate(emitProjectChange?: boolean): void;

    /**
     * 获取舞台目标。
     * @returns 舞台目标，如果未找到则返回 undefined。
     */
    getTargetForStage(): Scratch.Target | undefined;

    /**
     * 通过 ID 获取目标。
     * @param id - 目标 ID。
     * @returns 目标，如果未找到则返回 undefined。
     */
    getTargetById(id: string): Scratch.Target | undefined;

    /**
     * 获取角色的目标。
     * @param sprite - 角色。
     * @returns 该角色的目标数组。
     */
    getTargetsForSprite(sprite: Scratch.Sprite): Scratch.Target[];

    /**
     * 通过 ID 获取可执行目标。
     * @param id - 目标 ID。
     * @returns 目标，如果未找到则返回 undefined。
     */
    getExecutableTargetById(id: string): Scratch.Target | undefined;

    /**
     * 通过角色名称获取所有目标。
     * @param name - 角色名称。
     * @returns 具有给定名称的目标数组。
     */
    getAllTargetsBySpriteName(name: string): Scratch.Target[];

    /**
     * 通过名称获取角色目标。
     * @param name - 角色名称。
     * @returns 目标，如果未找到则返回 undefined。
     */
    getSpriteTargetByName(name: string): Scratch.Target | undefined;

    /**
     * 通过可绘制 ID 获取目标。
     * @param drawableId - 可绘制 ID。
     * @returns 目标，如果未找到则返回 undefined。
     */
    getTargetByDrawableId(drawableId: number): Scratch.Target | undefined;

    /**
     * 设置编辑目标。
     * @param target - 要设置为编辑的目标。
     */
    setEditingTarget(target: Scratch.Target): void;

    /**
     * 向运行时添加目标。
     * @param target - 要添加的目标。
     */
    addTarget(target: Scratch.Target): void;

    /**
     * 从运行时中移除目标。
     * @param target - 要移除的目标。
     */
    removeTarget(target: Scratch.Target): void;

    /**
     * 释放运行时并清除所有目标。
     */
    dispose(): void;

    /**
     * 扫描外设。
     * @param extensionId - 扩展 ID。
     */
    scanForPeripheral(extensionId: string): void;

    /**
     * 连接到外设。
     * @param extensionId - 扩展 ID。
     * @param peripheralId - 外设 ID。
     */
    connectPeripheral(extensionId: string, peripheralId: number): void;

    /**
     * 断开与外设的连接。
     * @param extensionId - 扩展 ID。
     */
    disconnectPeripheral(extensionId: string): void;

    /**
     * 检查外设是否已连接。
     * @param extensionId - 扩展 ID。
     * @returns 外设是否已连接。
     */
    getPeripheralIsConnected(extensionId: string): boolean;

    /**
     * 启动运行时。
     */
    start(): void;

    /**
     * 退出运行时。
     */
    quit(): void;

    /**
     * 设置兼容模式。
     * @param compatibilityModeOn - 是否启用兼容模式。
     */
    setCompatibilityMode(compatibilityModeOn: boolean): void;

    /**
     * 设置帧率。
     * @param framerate - 目标帧率。
     */
    setFramerate(framerate: number): void;

    /**
     * 设置是否启用补帧。
     * @param interpolationEnabled - 是否应启用补帧。
     */
    setInterpolation(interpolationEnabled: boolean): void;

    /**
     * 设置运行时选项。
     * @param options - 运行时选项。
     */
    setRuntimeOptions(options: {
        maxClones?: number;
        miscLimits?: boolean;
        fencing?: boolean;
    }): void;

    /**
     * 设置编译器选项。
     * @param options - 编译器选项。
     */
    setCompilerOptions(options: {
        enabled?: boolean;
        warpTimer?: boolean;
    }): void;

    /**
     * 设置舞台大小。
     * @param width - 舞台宽度。
     * @param height - 舞台高度。
     */
    setStageSize(width: number, height: number): void;

    /**
     * 设置运行时是否处于编辑器模式。
     * @param inEditor - 是否在编辑器模式中。
     */
    setInEditor(inEditor: boolean): void;

    /**
     * 转换为打包运行时模式。
     */
    convertToPackagedRuntime(): void;

    /**
     * 添加附加积木。
     * @param options - 附加积木选项。
     */
    addAddonBlock(options: object): void;

    /**
     * 获取附加积木。
     * @param procedureCode - 过程代码。
     * @returns 附加积木信息。
     */
    getAddonBlock(procedureCode: string): object | undefined;

    /**
     * 存储项目选项。
     */
    storeProjectOptions(): void;

    /**
     * 从项目解析项目选项。
     */
    parseProjectOptions(): void;

    /**
     * 启用调试模式。
     */
    enableDebug(): void;

    /**
     * 处理扩展按钮按下。
     * @param buttonData - 按钮数据。
     */
    handleExtensionButtonPress(buttonData: object): void;

    /**
     * 附加音频引擎。
     * @param audioEngine - 音频引擎。
     */
    attachAudioEngine(audioEngine: AudioEngine): void;

    /**
     * 附加渲染器。
     * @param renderer - 渲染器。
     */
    attachRenderer(renderer: RenderWebGL): void;

    /**
     * 附加 V2 位图适配器。
     * @param bitmapAdapter - 位图适配器函数。
     */
    attachV2BitmapAdapter(bitmapAdapter: (bitmap: any) => any): void;

    /**
     * 附加存储。
     * @param storage - 存储模块。
     */
    attachStorage(storage: ScratchStorage): void;

    /**
     * 配置 ScratchLink 套接字工厂。
     * @param factory - 套接字工厂函数。
     */
    configureScratchLinkSocketFactory(factory: () => WebSocket): void;

    /**
     * 刷新扩展积木。
     */
    refreshBlocks(): Promise<void>;

    /**
     * 自定义字体的字体管理器。
     */
    fontManager: {
        serializeAssets(): Asset[];
    };

    /**
     * 附加到运行时的音频引擎。
     */
    audioEngine: AudioEngine | null;

    /**
     * 附加到运行时的渲染器。
     */
    renderer: RenderWebGL | null;

    /**
     * 附加到运行时的存储模块。
     */
    storage: ScratchStorage | null;

    /**
     * 附加到运行时的扩展管理器。
     */
    extensionManager: ExtensionManager;
}

/**
 * 云提供器接口。
 */
interface CloudProvider {
    requestUpdateVariable(name: string, value: any): void;
    createVariable(name: string, value: any): void;
    setProvider(provider: any): void;
}

/**
 * 视频提供器接口。
 */
interface VideoProvider {
    video: HTMLVideoElement | null;
    stream: MediaStream | null;
    enabled: boolean;
}

/**
 * 音频引擎接口。
 */
interface AudioEngine {
    decodeSound(sound: Scratch.Sound): Promise<AudioBuffer>;
}

/**
 * RenderWebGL 接口。
 */
interface RenderWebGL {
    updateBitmapSkin(skinId: number, bitmap: HTMLCanvasElement, bitmapResolution: number, rotationCenter: [number, number]): void;
    updateSVGSkin(skinId: number, svg: string, rotationCenter: [number, number]): void;
    getSkinSize(skinId: number): [number, number];
}

/**
 * Scratch 存储接口。
 */
interface ScratchStorage {
    AssetType: {
        Project: string;
        ImageVector: string;
        ImageBitmap: string;
        Sound: string;
        Font: string;
    };
    DataFormat: {
        SVG: string;
        PNG: string;
        JPG: string;
        WAV: string;
        MP3: string;
    };
    load(type: string, id: string): Promise<Asset>;
    createAsset(type: string, format: string, data: Uint8Array | Buffer, id?: string, generateMd5?: boolean): Asset;
}

/**
 * 用于处理扩展的扩展管理器。
 */
declare class ExtensionManager {
    /**
     * VM 实例。
     */
    vm: VirtualMachine;

    /**
     * 运行时实例。
     */
    runtime: Runtime;

    /**
     * 安全管理器。
     */
    securityManager: SecurityManager;

    /**
     * 检查扩展是否已注册或正在加载过程中。
     * @param extensionId - 扩展的 ID。
     * @returns 如果已加载则返回 true，否则返回 false。
     */
    isExtensionLoaded(extensionId: string): boolean;

    /**
     * 确定具有给定 ID 的扩展是否内置于 VM 中。
     * @param extensionId - 扩展的 ID。
     * @returns 扩展是否为内置扩展。
     */
    isBuiltinExtension(extensionId: string): boolean;

    /**
     * 通过 ID 同步加载内部扩展。
     * @param extensionId - 扩展的 ID。
     */
    loadExtensionIdSync(extensionId: string): void;

    /**
     * 通过 URL 或内部扩展 ID 加载扩展。
     * @param extensionURL - 要加载的扩展的 URL 或内部扩展的 ID。
     * @returns 扩展加载后解决的 Promise。
     */
    loadExtensionURL(extensionURL: string): Promise<void>;

    /**
     * 添加内置扩展。
     * @param extensionId - 扩展 ID。
     * @param extensionClass - 扩展类。
     */
    addBuiltinExtension(extensionId: string, extensionClass: any): void;

    /**
     * 刷新工具箱中的扩展积木。
     */
    refreshBlocks(): Promise<void>;

    /**
     * 等待所有异步扩展加载完成。
     */
    allAsyncExtensionsLoaded(): Promise<void>;
}

/**
 * 用于扩展安全策略的安全管理器。
 */
declare class SecurityManager {
    /**
     * 检查是否可以从项目加载扩展。
     * @param extensionId - 扩展 ID。
     * @param extensionURL - 扩展 URL。
     * @returns 是否可以加载扩展。
     */
    canLoadExtensionFromProject(extensionId: string, extensionURL: string): Promise<boolean>;

    /**
     * 检查是否可以从项目加载多个扩展。
     * @param extensions - 扩展信息数组。
     * @returns 是否可以加载扩展。
     */
    canLoadMultipleExtensionsFromProject(extensions: Array<{ id: string; url: string; name: string }>): Promise<boolean>;
}

/**
 * VirtualMachine 类处理积木、舞台和扩展之间的连接。
 */
declare class VirtualMachine {
    /**
     * VM 运行时，用于存储积木、I/O 设备、角色/目标等。
     */
    runtime: Runtime;

    /**
     * VM 的"当前编辑"/选定目标 ID。
     * 来自任何 Blockly 工作区的积木事件都路由到此目标。
     */
    editingTarget: Scratch.Target | null;

    /**
     * 当前拖动的目标，用于重定向 IO 数据。
     */
    private _dragTarget: Scratch.Target | null;

    /**
     * 用于加载和管理扩展的扩展管理器。
     */
    extensionManager: ExtensionManager;

    /**
     * 用于扩展安全的安全管理器。
     */
    securityManager: SecurityManager;

    /**
     * 为扩展导出一些内部类。
     */
    exports: {
        Sprite: typeof Scratch.Sprite;
        RenderedTarget: typeof Scratch.Target;
        JSZip: typeof JSZip;
        Variable: typeof Scratch.Variable;
        /**
         * 获取不支持的内部 API。当您的代码损坏时，不要期望得到帮助。
         * @deprecated 自担风险使用。
         */
        these_broke_before_and_will_break_again(): {
            JSGenerator: any;
            IRGenerator: any;
            ScriptTreeGenerator: any;
            IntermediateStackBlock: any;
            IntermediateInput: any;
            IntermediateStack: any;
            IntermediateScript: any;
            IntermediateRepresentation: any;
            StackOpcode: any;
            InputOpcode: any;
            InputType: any;
            Thread: typeof Thread;
            execute: any;
        };
        /**
         * 获取旧版编译器 API。
         * @deprecated 自担风险使用。
         */
        i_will_not_ask_for_help_when_these_break(): {
            IRGenerator: any;
            ScriptTreeGenerator: any;
            JSGenerator: any;
            Thread: typeof Thread;
            execute: any;
        };
    };

    /**
     * 绑定到此 VM 的积木监听器函数。
     */
    blockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * 绑定到此 VM 的侧边栏积木监听器函数。
     */
    flyoutBlockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * 绑定到此 VM 的监视器积木监听器函数。
     */
    monitorBlockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * 绑定到此 VM 的变量监听器函数。
     */
    variableListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * 开始运行 VM - 在执行任何其他操作之前执行此操作。
     */
    start(): void;

    /**
     * @deprecated 被 TurboWarp 旧版本使用。已被上游的 quit() 取代。
     */
    stop(): void;

    /**
     * 退出 VM，清除可能保持进程存活的任何句柄。
     * 调用此方法后不要使用运行时。此方法用于测试关闭。
     */
    quit(): void;

    /**
     * "绿旗"处理器 - 启动所有以绿旗开始的线程。
     */
    greenFlag(): void;

    /**
     * 设置 VM 是否处于"加速模式"。
     * 当为 true 时，循环不会让出重绘。
     * @param turboModeOn - 是否应设置加速模式。
     */
    setTurboMode(turboModeOn: boolean): void;

    /**
     * 设置 VM 是否处于 2.0"兼容模式"。
     * 当为 true 时，tick 以 2.0 速度运行（30 TPS）。
     * @param compatibilityModeOn - 是否设置了兼容模式。
     */
    setCompatibilityMode(compatibilityModeOn: boolean): void;

    /**
     * 设置帧率。
     * @param framerate - 目标帧率。
     */
    setFramerate(framerate: number): void;

    /**
     * 设置是否启用补帧。
     * @param interpolationEnabled - 是否应启用补帧。
     */
    setInterpolation(interpolationEnabled: boolean): void;

    /**
     * 设置运行时选项。
     * @param runtimeOptions - 要设置的运行时选项。
     */
    setRuntimeOptions(runtimeOptions: {
        maxClones?: number;
        miscLimits?: boolean;
        fencing?: boolean;
    }): void;

    /**
     * 设置编译器选项。
     * @param compilerOptions - 要设置的编译器选项。
     */
    setCompilerOptions(compilerOptions: {
        enabled?: boolean;
        warpTimer?: boolean;
    }): void;

    /**
     * 设置舞台大小。
     * @param width - 舞台宽度。
     * @param height - 舞台高度。
     */
    setStageSize(width: number, height: number): void;

    /**
     * 设置 VM 是否处于编辑器模式。
     * @param inEditor - 是否在编辑器模式中。
     */
    setInEditor(inEditor: boolean): void;

    /**
     * 转换为打包运行时模式。
     */
    convertToPackagedRuntime(): void;

    /**
     * 添加附加积木。
     * @param options - 附加积木选项。
     */
    addAddonBlock(options: object): void;

    /**
     * 获取附加积木。
     * @param procedureCode - 过程代码。
     * @returns 附加积木信息。
     */
    getAddonBlock(procedureCode: string): object | undefined;

    /**
     * 存储项目选项。
     */
    storeProjectOptions(): void;

    /**
     * 启用调试模式。
     * @returns '已启用调试模式'
     */
    enableDebug(): string;

    /**
     * 处理扩展按钮按下。
     * @param buttonData - 按钮数据。
     */
    handleExtensionButtonPress(buttonData: object): void;

    /**
     * 停止所有线程和正在运行的活动。
     */
    stopAll(): void;

    /**
     * 清除当前运行的项目数据。
     */
    clear(): void;

    /**
     * 获取游乐场数据。数据通过发出的事件返回。
     */
    getPlaygroundData(): void;

    /**
     * 将 I/O 数据发布到虚拟设备。
     * @param device - 虚拟 I/O 设备的名称。
     * @param data - 任何要发布到 I/O 设备的数据对象。
     */
    postIOData(device: 'clock' | 'cloud' | 'keyboard' | 'mouse' | 'mouseWheel' | 'video' | 'userData', data: object): void;

    /**
     * 设置视频提供器。
     * @param videoProvider - 要附加的视频提供器。
     */
    setVideoProvider(videoProvider: VideoProvider): void;

    /**
     * 设置云提供器。
     * @param cloudProvider - 要附加的云提供器。
     */
    setCloudProvider(cloudProvider: CloudProvider): void;

    /**
     * 告诉指定扩展扫描外设。
     * @param extensionId - 扩展的 id。
     */
    scanForPeripheral(extensionId: string): void;

    /**
     * 连接到扩展的指定外设。
     * @param extensionId - 扩展的 id。
     * @param peripheralId - 外设的 id。
     */
    connectPeripheral(extensionId: string, peripheralId: number): void;

    /**
     * 断开与扩展的已连接外设的连接。
     * @param extensionId - 扩展的 id。
     */
    disconnectPeripheral(extensionId: string): void;

    /**
     * 返回扩展当前是否有已连接的外设。
     * @param extensionId - 扩展的 id。
     * @returns 扩展是否有已连接的外设。
     */
    getPeripheralIsConnected(extensionId: string): boolean;

    /**
     * 从 .sb、.sb2、.sb3 或 json 字符串加载 Scratch 项目。
     * @param input - 表示要加载的项目的 json 字符串、对象或 ArrayBuffer。
     * @returns 安装目标后解决的 Promise。
     */
    loadProject(input: string | object | ArrayBuffer): Promise<void>;

    /**
     * 从 Scratch 网站按 ID 加载项目。
     * @param id - 要下载的项目的 ID，作为字符串。
     */
    downloadProjectId(id: string): void;

    /**
     * 将项目保存为 sb3 文件。
     * @param type - JSZip 输出类型。默认为 'blob' 以兼容 Scratch。
     * @returns 由 type 参数确定的类型的压缩 sb3 文件。
     */
    saveProjectSb3(type?: 'blob' | 'arraybuffer' | 'base64' | 'binarystring' | 'uint8array'): Promise<unknown>;

    /**
     * 将项目保存为 sb3 流。
     * @param type - JSZip 输出类型。默认为 'arraybuffer'。
     * @returns 生成压缩 sb3 的 JSZip StreamHelper 对象。
     */
    saveProjectSb3Stream(type?: 'arraybuffer' | 'blob' | 'base64'): any;

    /**
     * TW: 将项目序列化为文件映射，而不实际压缩项目。
     * 返回的缓冲区是内部使用的完全相同的缓冲区，而不是副本。
     * @returns 文件名到该文件的原始数据的映射。
     */
    saveProjectSb3DontZip(): Record<string, Uint8Array>;

    /**
     * 运行时中所有资源的数组。
     */
    readonly assets: Asset[];

    /**
     * 序列化目标的资源。
     * @param targetId - 可选的要导出的目标 ID。
     * @returns 文件描述符列表。
     */
    serializeAssets(targetId?: string): Array<{ fileName: string; fileContent: Uint8Array }>;

    /**
     * 以 sprite3 格式导出角色。
     * @param targetId - 要导出的目标的 ID。
     * @param optZipType - 生成的 zip 的可选类型（base64、binarystring、array、uint8array、arraybuffer、blob、nodebuffer）。默认为 blob。
     * @returns 角色及其资源的生成的 zip。
     */
    exportSprite(targetId: string, optZipType?: string): Promise<Blob | ArrayBuffer>;

    /**
     * 将项目或角色导出为 Scratch 3.0 JSON 表示形式。
     * @param optTargetId - 可选的要序列化的角色 ID。
     * @param serializationOptions - 要传递给序列化器的选项。
     * @returns 运行时的序列化状态。
     */
    toJSON(optTargetId?: string, serializationOptions?: object): string;

    /**
     * 从 Scratch JSON 表示形式加载项目。
     * @param json - 表示项目的 JSON 字符串。
     * @returns 项目加载后解决的 Promise。
     * @deprecated 请改用 loadProject。
     */
    fromJSON(json: string): Promise<void>;

    /**
     * 从 Scratch JSON 表示形式加载项目。
     * @param projectJSON - 表示项目的 JSON 字符串。
     * @param zip - 可选的压缩项目，包含要加载的资源。
     * @returns 项目加载后解决的 Promise。
     */
    deserializeProject(projectJSON: string | object, zip?: JSZip): Promise<void>;

    /**
     * 安装 \`deserialize\` 结果：零个或多个目标，在这些目标使用的扩展（如果有）之后。
     * @param targets - 要安装的目标。
     * @param extensions - 关于这些目标使用的扩展的元数据。
     * @param wholeProject - 如果安装整个项目则设置为 true，而不是单个角色。
     * @returns 目标安装后解决的 Promise。
     */
    installTargets(
        targets: Scratch.Target[],
        extensions: { extensionIDs: string[]; extensionURLs: Map<string, string> },
        wholeProject: boolean
    ): Promise<void>;

    /**
     * 添加角色，这可能是 .sprite2 或 .sprite3。先解包并验证此类文件。
     * @param input - 表示要加载的角色的 json 字符串、对象或 ArrayBuffer。
     * @returns 安装目标后解决的 Promise。
     */
    addSprite(input: string | object | ArrayBuffer): Promise<void>;

    /**
     * 向当前编辑目标添加造型。
     * @param md5ext - 要加载的造型的 MD5 和扩展名。
     * @param costumeObject - 表示造型的对象。
     * @param optTargetId - 要添加到的目标的 id，如果不是编辑目标。
     * @param optVersion - 如果为 2，则作为 sb2 加载造型，否则作为 sb3 加载造型。
     * @returns 添加造型后解决的 Promise。
     */
    addCostume(md5ext: string, costumeObject: Scratch.Costume, optTargetId?: string, optVersion?: number): Promise<void> | null;

    /**
     * 向当前编辑目标添加从库中加载的造型。
     * @param md5ext - 要加载的造型的 MD5 和扩展名。
     * @param costumeObject - 表示造型的对象。
     * @returns 添加造型后解决的 Promise。
     */
    addCostumeFromLibrary(md5ext: string, costumeObject: Scratch.Costume): Promise<void> | null;

    /**
     * 复制给定索引处的造型。将其添加到该索引 + 1 处。
     * @param costumeIndex - 要复制的造型索引。
     * @returns 解码并添加造型后解决的 Promise。
     */
    duplicateCostume(costumeIndex: number): Promise<void> | null;

    /**
     * 复制给定索引处的声音。将其添加到该索引 + 1 处。
     * @param soundIndex - 要复制的声音索引。
     * @returns 解码并添加声音后解决的 Promise。
     */
    duplicateSound(soundIndex: number): Promise<void> | null;

    /**
     * 重命名当前编辑目标上的造型。
     * @param costumeIndex - 要重命名的造型索引。
     * @param newName - 造型所需的新名称（如果已使用将被修改）。
     */
    renameCostume(costumeIndex: number, newName: string): void;

    /**
     * 从当前编辑目标中删除造型。
     * @param costumeIndex - 要移除的造型索引。
     * @returns 恢复已删除造型的函数，如果没有删除造型则为 null。
     */
    deleteCostume(costumeIndex: number): (() => void) | null;

    /**
     * 向当前编辑目标添加声音。
     * @param soundObject - 表示声音的对象。
     * @param optTargetId - 要添加到的目标的 id，如果不是编辑目标。
     * @returns 解码并添加声音后解决的 Promise。
     */
    addSound(soundObject: Scratch.Sound, optTargetId?: string): Promise<void> | null;

    /**
     * 重命名当前编辑目标上的声音。
     * @param soundIndex - 要重命名的声音索引。
     * @param newName - 声音所需的新名称（如果已使用将被修改）。
     */
    renameSound(soundIndex: number, newName: string): void;

    /**
     * 从音频引擎获取声音缓冲区。
     * @param soundIndex - 要获取的声音索引。
     * @returns 声音的音频缓冲区，如果未找到则为 null。
     */
    getSoundBuffer(soundIndex: number): AudioBuffer | null;

    /**
     * 更新声音缓冲区。
     * @param soundIndex - 要更新的声音索引。
     * @param newBuffer - 音频引擎的新音频缓冲区。
     * @param soundEncoding - 要存储的新（wav）编码声音。
     */
    updateSoundBuffer(soundIndex: number, newBuffer: AudioBuffer, soundEncoding: ArrayBuffer): void;

    /**
     * 从当前编辑目标中删除声音。
     * @param soundIndex - 要移除的声音索引。
     * @returns 恢复已删除声音的函数，如果没有删除声音则为 null。
     */
    deleteSound(soundIndex: number): (() => void) | null;

    /**
     * 从存储中获取图像的字符串表示形式。
     * @param costumeIndex - 要获取的造型索引。
     * @returns 如果是 SVG，则为造型的 SVG 字符串；如果是 PNG 或 JPG，则为 dataURI；如果未找到则为 null。
     */
    getCostume(costumeIndex: number): string | null;

    /**
     * TW: 获取原始二进制数据，用于将造型导出到用户的本地文件系统。
     * @param costumeObject - Scratch-vm 造型对象。
     * @returns 原始二进制数据。
     */
    getExportedCostume(costumeObject: Scratch.Costume): Uint8Array;

    /**
     * TW: 获取 base64 字符串，用于将造型导出到用户的本地文件系统。
     * @param costumeObject - Scratch-vm 造型对象。
     * @returns Base64 字符串。不是 data: URI。
     */
    getExportedCostumeBase64(costumeObject: Scratch.Costume): string;

    /**
     * 使用给定的位图更新造型。
     * @param costumeIndex - 要更新的造型索引。
     * @param bitmap - 渲染器的新位图。
     * @param rotationCenterX - 造型绕其旋转的点的 X。
     * @param rotationCenterY - 造型绕其旋转的点的 Y。
     * @param bitmapResolution - 普通位图为 1，双分辨率为 2。
     */
    updateBitmap(
        costumeIndex: number,
        bitmap: ImageData,
        rotationCenterX: number,
        rotationCenterY: number,
        bitmapResolution: number
    ): void;

    /**
     * 使用给定的 SVG 更新造型。
     * @param costumeIndex - 要更新的造型索引。
     * @param svg - 渲染器的新 SVG。
     * @param rotationCenterX - 造型绕其旋转的点的 X。
     * @param rotationCenterY - 造型绕其旋转的点的 Y。
     */
    updateSvg(costumeIndex: number, svg: string, rotationCenterX: number, rotationCenterY: number): void;

    /**
     * 向舞台添加背景。
     * @param md5ext - 要加载的背景的 MD5 和扩展名。
     * @param backdropObject - 表示背景的对象。
     * @returns 添加背景后解决的 Promise。
     */
    addBackdrop(md5ext: string, backdropObject: Scratch.Costume): Promise<void> | null;

    /**
     * 重命名角色。
     * @param targetId - 要重命名其角色的目标的 ID。
     * @param newName - 角色的新名称。
     */
    renameSprite(targetId: string, newName: string): void;

    /**
     * 删除角色及其所有克隆。
     * @param targetId - 要删除其角色的目标的 ID。
     * @returns 恢复已删除角色的函数。
     */
    deleteSprite(targetId: string): () => Promise<void>;

    /**
     * 复制角色。
     * @param targetId - 要复制其角色的目标的 ID。
     * @returns 添加复制目标后解决的 Promise。
     */
    duplicateSprite(targetId: string): Promise<void>;

    /**
     * 为 VM/运行时设置音频引擎。
     * @param audioEngine - 要附加的音频引擎。
     */
    attachAudioEngine(audioEngine: AudioEngine): void;

    /**
     * 为 VM/运行时设置渲染器。
     * @param renderer - 要附加的渲染器。
     */
    attachRenderer(renderer: RenderWebGL): void;

    /**
     * 附加到 vm 的渲染器。
     */
    readonly renderer: RenderWebGL | null;

    /**
     * 为 VM/运行时设置位图适配器。
     * @param bitmapAdapter - 要附加的适配器。
     */
    attachV2BitmapAdapter(bitmapAdapter: (bitmap: any) => any): void;

    /**
     * 为 VM/运行时设置存储模块。
     * @param storage - 要附加的存储模块。
     */
    attachStorage(storage: ScratchStorage): void;

    /**
     * 为 VM 设置当前语言环境和内置消息。
     * @param locale - 当前语言环境。
     * @param messages - 当前语言环境的内置消息映射。
     * @returns 更新积木后解决的 Promise。
     */
    setLocale(locale: string, messages: Record<string, string>): Promise<void>;

    /**
     * 获取 VM 的当前语言环境。
     * @returns VM 中的当前语言环境。
     */
    getLocale(): string;

    /**
     * 处理当前编辑目标的 Blockly 事件。
     * @param e - 任何 Blockly 事件。
     */
    blockListener(e: Scratch.BlocklyEvent): void;

    /**
     * 处理侧边栏的 Blockly 事件。
     * @param e - 任何 Blockly 事件。
     */
    flyoutBlockListener(e: Scratch.BlocklyEvent): void;

    /**
     * 处理要传递给监视器容器的侧边栏的 Blockly 事件。
     * @param e - 任何 Blockly 事件。
     */
    monitorBlockListener(e: Scratch.BlocklyEvent): void;

    /**
     * 处理变量映射的 Blockly 事件。
     * @param e - 任何 Blockly 事件。
     */
    variableListener(e: Scratch.BlocklyEvent): void;

    /**
     * 删除所有侧边栏积木。
     */
    clearFlyoutBlocks(): void;

    /**
     * 设置编辑目标。编辑器 UI 可以使用此函数在编辑不同目标之间切换。
     * @param targetId - 要设置为编辑的目标 ID。
     */
    setEditingTarget(targetId: string): void;

    /**
     * 导出独立积木。
     * @param blockObjects - 要导出的积木数组。
     * @returns 序列化的积木。
     */
    exportStandaloneBlocks(blockObjects: Scratch.Block[]): object;

    /**
     * 当积木从一个角色拖动到另一个角色时调用。将积木添加到给定目标的工作区。
     * @param blocks - 要添加的积木。
     * @param targetId - 要添加积木到的目标 ID。
     * @param optFromTargetId - 可选的目标 ID，指示积木正在从该目标共享。
     * @returns 添加扩展和积木后解决的 Promise。
     */
    shareBlocksToTarget(blocks: object[], targetId: string, optFromTargetId?: string): Promise<void>;

    /**
     * 当造型从编辑目标拖动到另一个目标时调用。将新添加的造型设置为当前造型。
     * @param costumeIndex - 要共享的编辑目标的造型索引。
     * @param targetId - 要添加造型的目标 ID。
     * @returns 加载新造型后解决的 Promise。
     */
    shareCostumeToTarget(costumeIndex: number, targetId: string): Promise<void>;

    /**
     * 当声音从编辑目标拖动到另一个目标时调用。
     * @param soundIndex - 要共享的编辑目标的声音索引。
     * @param targetId - 要添加声音的目标 ID。
     * @returns 加载新声音后解决的 Promise。
     */
    shareSoundToTarget(soundIndex: number, targetId: string): Promise<void>;

    /**
     * 使用当前 editingTarget 的积木重新填充工作区。
     */
    refreshWorkspace(): void;

    /**
     * 发出关于可用目标的元数据。
     * @param triggerProjectChange - 如果为 true，同时发出项目更改事件。默认为 true。
     */
    emitTargetsUpdate(triggerProjectChange?: boolean): void;

    /**
     * 发出与 Blockly/scratch-blocks 兼容的当前编辑目标积木的 XML 表示形式。
     */
    emitWorkspaceUpdate(): void;

    /**
     * 获取可绘制 ID 的目标 ID。对于与渲染器交互很有用。
     * @param drawableId - 要为其请求目标 ID 的可绘制 ID。
     * @returns 目标 ID（如果找到）。如果找到的目标是舞台，则也会为 null。
     */
    getTargetIdForDrawableId(drawableId: number): string | null;

    /**
     * 按索引重新排序目标。返回是否进行了更改。
     * @param targetIndex - 目标的索引。
     * @param newIndex - 目标应该移动到的索引。
     * @returns 是否重新排序了目标。
     */
    reorderTarget(targetIndex: number, newIndex: number): boolean;

    /**
     * 如果存在，重新排序目标的造型。返回是否成功。
     * @param targetId - 拥有造型的目标的 ID。
     * @param costumeIndex - 要移动的造型索引。
     * @param newIndex - 造型应该移动到的索引。
     * @returns 是否重新排序了造型。
     */
    reorderCostume(targetId: string, costumeIndex: number, newIndex: number): boolean;

    /**
     * 如果存在，重新排序目标的声音。返回是否发生。
     * @param targetId - 拥有声音的目标的 ID。
     * @param soundIndex - 要移动的声音索引。
     * @param newIndex - 声音应该移动到的索引。
     * @returns 是否重新排序了声音。
     */
    reorderSound(targetId: string, soundIndex: number, newIndex: number): boolean;

    /**
     * 将目标置于"拖动"状态，在此期间其 X/Y 位置不会受到积木的影响。
     * @param targetId - 要置于拖动状态的目标的 ID。
     */
    startDrag(targetId: string): void;

    /**
     * 将目标从拖动状态中移除，以便积木可能开始再次影响 X/Y 位置。
     * @param targetId - 要从拖动状态中移除的目标的 ID。
     */
    stopDrag(targetId: string): void;

    /**
     * 发布/编辑当前编辑目标或拖动目标的角色信息。
     * @param data - 包含要设置的角色信息的对象。
     */
    postSpriteInfo(data: {
        x?: number;
        y?: number;
        direction?: number;
        size?: number;
        visible?: boolean;
        volume?: number;
    }): void;

    /**
     * 设置目标的变量值。返回是否成功。
     * @param targetId - 拥有变量的目标的 ID。
     * @param variableId - 要设置的变量的 ID。
     * @param value - 该变量的新值。
     * @returns 是否找到并更新了目标和变量。
     */
    setVariableValue(targetId: string, variableId: string, value: any): boolean;

    /**
     * 获取目标的变量值。如果目标或变量不存在，则返回 null。
     * @param targetId - 拥有变量的目标的 ID。
     * @param variableId - 要获取的变量的 ID。
     * @returns 变量的值，如果无法查找则为 null。
     */
    getVariableValue(targetId: string, variableId: string): any | null;

    /**
     * 允许 VM 使用者配置 ScratchLink 套接字创建器。
     * @param factory - 自定义 ScratchLink 套接字工厂。
     */
    configureScratchLinkSocketFactory(factory: () => WebSocket): void;
}

/**
 * 用于处理 zip 文件的 JSZip 库。
 */
declare class JSZip {
    files: Record<string, JSZipObject>;
    file(name: string, data: string | ArrayBuffer | Uint8Array): JSZip;
    generateAsync(options: { type?: string; mimeType?: string; compression?: string }): Promise<Blob | ArrayBuffer>;
    generateInternalStream(options: { type?: string; mimeType?: string; compression?: string }): any;
}

interface JSZipObject {
    name: string;
    date: Date;
    options: { compression: string };
}

/**
 * 用于 VM 事件的 EventEmitter。
 */
declare class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
}

/**
 * 提供给扩展的 VM 实例。
 * 扩展代码中可用的全局 VM 变量。
 */
declare const VM: VirtualMachine;
`

export default vm;