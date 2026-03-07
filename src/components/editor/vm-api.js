const vm = `/**
 * Scratch VM API Type Definitions
 * This file provides type definitions and JSDoc for the Scratch Virtual Machine
 */

declare namespace Scratch {
    /**
     * Target represents a sprite or the stage in the Scratch project.
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
 * Thread represents a running script in the VM.
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
 * Sequencer manages stepping threads.
 */
declare class Sequencer {
    stepThreads(): void;
}

/**
 * Profiler for performance monitoring.
 */
declare class Profiler {
    id: number;
}

/**
 * MonitorRecord for stage monitors.
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
 * The Runtime class manages targets, scripts, and the sequencer.
 */
declare class Runtime {
    /**
     * Target management and storage.
     */
    targets: Scratch.Target[];

    /**
     * Targets in reverse order of execution. Shares its order with drawables.
     */
    executableTargets: Scratch.Target[];

    /**
     * A list of threads that are currently running in the VM.
     * Threads are added when execution starts and pruned when execution ends.
     */
    threads: Thread[];

    /**
     * The sequencer manages stepping threads.
     */
    sequencer: Sequencer;

    /**
     * Whether the project is in "turbo mode."
     */
    turboMode: boolean;

    /**
     * Current length of a step. Changes as mode switches.
     */
    currentStepTime: number;

    /**
     * Stage width.
     */
    stageWidth: number;

    /**
     * Stage height.
     */
    stageHeight: number;

    /**
     * Whether interpolation is enabled.
     */
    interpolationEnabled: boolean;

    /**
     * Debug mode flag.
     */
    debug: boolean;

    /**
     * TW: Packaged runtime mode flag.
     */
    isPackaged: boolean;

    /**
     * IO devices container.
     */
    ioDevices: {
        /**
         * Clock device for timing.
         */
        clock: {
            projectTimer: number;
            currentMSecs: number;
        };
        /**
         * Cloud device for cloud variables.
         */
        cloud: {
            provider: CloudProvider | null;
            stage: Scratch.Target | null;
            setStage(stage: Scratch.Target | null): void;
            requestUpdateVariable(name: string, value: any): void;
        };
        /**
         * Keyboard device.
         */
        keyboard: {
            postData(data: { key?: string; isDown?: boolean }): void;
            getData(): { key: string; isDown: boolean };
        };
        /**
         * Mouse device.
         */
        mouse: {
            postData(data: { x?: number; y?: number; button?: number; isDown?: boolean }): void;
            getX(): number;
            getY(): number;
            getButtonState(button: number): boolean;
        };
        /**
         * Mouse wheel device.
         */
        mouseWheel: {
            postData(data: { deltaX?: number; deltaY?: number }): void;
            getDelta(): { x: number; y: number };
        };
        /**
         * Video device for camera sensing.
         */
        video: {
            provider: VideoProvider | null;
            setProvider(provider: VideoProvider): void;
            detectFace(): void;
        };
        /**
         * User data device for username.
         */
        userData: {
            getUsername(): string;
        };
    };

    /**
     * Responsible for managing the VM's many timers.
     */
    frameLoop: {
        requestLoop(callback: () => void): void;
    };

    /**
     * Storage container for flyout blocks.
     */
    flyoutBlocks: Scratch.Blocks;

    /**
     * Storage container for monitor blocks.
     */
    monitorBlocks: Scratch.Blocks;

    /**
     * Check whether the runtime has any cloud data.
     * @returns Whether or not the runtime currently has any cloud variables.
     */
    hasCloudData(): boolean;

    /**
     * Check whether a new cloud variable can be added.
     * @returns Whether or not a new cloud variable can be added.
     */
    canAddCloudVariable(): boolean;

    /**
     * Get the number of cloud variables in the runtime.
     * @returns The number of cloud variables.
     */
    getNumberOfCloudVariables(): number;

    /**
     * Start hats (event handlers) for the given hat type.
     * @param requestedHat - The hat type to start.
     * @param optMatchFields - Optional match fields for the hat.
     * @param optTarget - Optional target to start the hat on.
     * @returns Array of started threads.
     */
    startHats(requestedHat: string, optMatchFields?: object, optTarget?: Scratch.Target): Thread[];

    /**
     * Start hats and execute immediately.
     * @param requestedHat - The hat type to start.
     * @param optMatchFields - Optional match fields for the hat.
     * @param optTarget - Optional target to start the hat on.
     */
    startHatsAndExecute(requestedHat: string, optMatchFields?: object, optTarget?: Scratch.Target): void;

    /**
     * Stop all threads and running activities.
     */
    stopAll(): void;

    /**
     * Stop threads for a specific target.
     * @param target - The target to stop threads for.
     */
    stopForTarget(target: Scratch.Target): void;

    /**
     * "Green flag" handler - start all threads starting with a green flag.
     */
    greenFlag(): void;

    /**
     * Emit a project changed event.
     */
    emitProjectChanged(): void;

    /**
     * Emit metadata about available targets.
     * @param emitProjectChange - If true, also emit a project changed event.
     */
    emitTargetsUpdate(emitProjectChange?: boolean): void;

    /**
     * Get the stage target.
     * @returns The stage target, or undefined if not found.
     */
    getTargetForStage(): Scratch.Target | undefined;

    /**
     * Get a target by its ID.
     * @param id - The target ID.
     * @returns The target, or undefined if not found.
     */
    getTargetById(id: string): Scratch.Target | undefined;

    /**
     * Get targets for a sprite.
     * @param sprite - The sprite.
     * @returns Array of targets for the sprite.
     */
    getTargetsForSprite(sprite: Scratch.Sprite): Scratch.Target[];

    /**
     * Get an executable target by ID.
     * @param id - The target ID.
     * @returns The target, or undefined if not found.
     */
    getExecutableTargetById(id: string): Scratch.Target | undefined;

    /**
     * Get all targets by sprite name.
     * @param name - The sprite name.
     * @returns Array of targets with the given name.
     */
    getAllTargetsBySpriteName(name: string): Scratch.Target[];

    /**
     * Get a sprite target by name.
     * @param name - The sprite name.
     * @returns The target, or undefined if not found.
     */
    getSpriteTargetByName(name: string): Scratch.Target | undefined;

    /**
     * Get a target by drawable ID.
     * @param drawableId - The drawable ID.
     * @returns The target, or undefined if not found.
     */
    getTargetByDrawableId(drawableId: number): Scratch.Target | undefined;

    /**
     * Set the editing target.
     * @param target - The target to set as editing.
     */
    setEditingTarget(target: Scratch.Target): void;

    /**
     * Add a target to the runtime.
     * @param target - The target to add.
     */
    addTarget(target: Scratch.Target): void;

    /**
     * Remove a target from the runtime.
     * @param target - The target to remove.
     */
    removeTarget(target: Scratch.Target): void;

    /**
     * Dispose the runtime and clear all targets.
     */
    dispose(): void;

    /**
     * Scan for a peripheral.
     * @param extensionId - The extension ID.
     */
    scanForPeripheral(extensionId: string): void;

    /**
     * Connect to a peripheral.
     * @param extensionId - The extension ID.
     * @param peripheralId - The peripheral ID.
     */
    connectPeripheral(extensionId: string, peripheralId: number): void;

    /**
     * Disconnect from a peripheral.
     * @param extensionId - The extension ID.
     */
    disconnectPeripheral(extensionId: string): void;

    /**
     * Check if a peripheral is connected.
     * @param extensionId - The extension ID.
     * @returns Whether the peripheral is connected.
     */
    getPeripheralIsConnected(extensionId: string): boolean;

    /**
     * Start the runtime.
     */
    start(): void;

    /**
     * Quit the runtime.
     */
    quit(): void;

    /**
     * Set compatibility mode.
     * @param compatibilityModeOn - Whether to enable compatibility mode.
     */
    setCompatibilityMode(compatibilityModeOn: boolean): void;

    /**
     * Set the framerate.
     * @param framerate - The target framerate.
     */
    setFramerate(framerate: number): void;

    /**
     * Set whether interpolation is enabled.
     * @param interpolationEnabled - Whether interpolation should be enabled.
     */
    setInterpolation(interpolationEnabled: boolean): void;

    /**
     * Set runtime options.
     * @param options - The runtime options.
     */
    setRuntimeOptions(options: {
        maxClones?: number;
        miscLimits?: boolean;
        fencing?: boolean;
    }): void;

    /**
     * Set compiler options.
     * @param options - The compiler options.
     */
    setCompilerOptions(options: {
        enabled?: boolean;
        warpTimer?: boolean;
    }): void;

    /**
     * Set the stage size.
     * @param width - Stage width.
     * @param height - Stage height.
     */
    setStageSize(width: number, height: number): void;

    /**
     * Set whether the runtime is in editor mode.
     * @param inEditor - Whether in editor mode.
     */
    setInEditor(inEditor: boolean): void;

    /**
     * Convert to packaged runtime mode.
     */
    convertToPackagedRuntime(): void;

    /**
     * Add an addon block.
     * @param options - Addon block options.
     */
    addAddonBlock(options: object): void;

    /**
     * Get an addon block.
     * @param procedureCode - The procedure code.
     * @returns The addon block info.
     */
    getAddonBlock(procedureCode: string): object | undefined;

    /**
     * Store project options.
     */
    storeProjectOptions(): void;

    /**
     * Parse project options from the project.
     */
    parseProjectOptions(): void;

    /**
     * Enable debug mode.
     */
    enableDebug(): void;

    /**
     * Handle extension button press.
     * @param buttonData - Button data.
     */
    handleExtensionButtonPress(buttonData: object): void;

    /**
     * Attach the audio engine.
     * @param audioEngine - The audio engine.
     */
    attachAudioEngine(audioEngine: AudioEngine): void;

    /**
     * Attach the renderer.
     * @param renderer - The renderer.
     */
    attachRenderer(renderer: RenderWebGL): void;

    /**
     * Attach the V2 bitmap adapter.
     * @param bitmapAdapter - The bitmap adapter function.
     */
    attachV2BitmapAdapter(bitmapAdapter: (bitmap: any) => any): void;

    /**
     * Attach storage.
     * @param storage - The storage module.
     */
    attachStorage(storage: ScratchStorage): void;

    /**
     * Configure ScratchLink socket factory.
     * @param factory - The socket factory function.
     */
    configureScratchLinkSocketFactory(factory: () => WebSocket): void;

    /**
     * Refresh extension blocks.
     */
    refreshBlocks(): Promise<void>;

    /**
     * Font manager for custom fonts.
     */
    fontManager: {
        serializeAssets(): Asset[];
    };

    /**
     * The audio engine attached to the runtime.
     */
    audioEngine: AudioEngine | null;

    /**
     * The renderer attached to the runtime.
     */
    renderer: RenderWebGL | null;

    /**
     * The storage module attached to the runtime.
     */
    storage: ScratchStorage | null;

    /**
     * The extension manager attached to the runtime.
     */
    extensionManager: ExtensionManager;
}

/**
 * Cloud provider interface.
 */
interface CloudProvider {
    requestUpdateVariable(name: string, value: any): void;
    createVariable(name: string, value: any): void;
    setProvider(provider: any): void;
}

/**
 * Video provider interface.
 */
interface VideoProvider {
    video: HTMLVideoElement | null;
    stream: MediaStream | null;
    enabled: boolean;
}

/**
 * Audio engine interface.
 */
interface AudioEngine {
    decodeSound(sound: Scratch.Sound): Promise<AudioBuffer>;
}

/**
 * RenderWebGL interface.
 */
interface RenderWebGL {
    updateBitmapSkin(skinId: number, bitmap: HTMLCanvasElement, bitmapResolution: number, rotationCenter: [number, number]): void;
    updateSVGSkin(skinId: number, svg: string, rotationCenter: [number, number]): void;
    getSkinSize(skinId: number): [number, number];
}

/**
 * Scratch storage interface.
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
 * Extension manager for handling extensions.
 */
declare class ExtensionManager {
    /**
     * The VM instance.
     */
    vm: VirtualMachine;

    /**
     * The runtime instance.
     */
    runtime: Runtime;

    /**
     * The security manager.
     */
    securityManager: SecurityManager;

    /**
     * Check whether an extension is registered or is in the process of loading.
     * @param extensionId - The ID of the extension.
     * @returns True if loaded, false otherwise.
     */
    isExtensionLoaded(extensionId: string): boolean;

    /**
     * Determine whether an extension with a given ID is built in to the VM.
     * @param extensionId - The ID of the extension.
     * @returns Whether the extension is built-in.
     */
    isBuiltinExtension(extensionId: string): boolean;

    /**
     * Synchronously load an internal extension by ID.
     * @param extensionId - The ID of the extension.
     */
    loadExtensionIdSync(extensionId: string): void;

    /**
     * Load an extension by URL or internal extension ID.
     * @param extensionURL - The URL for the extension to load OR the ID of an internal extension.
     * @returns Promise resolved once the extension is loaded.
     */
    loadExtensionURL(extensionURL: string): Promise<void>;

    /**
     * Add a built-in extension.
     * @param extensionId - The extension ID.
     * @param extensionClass - The extension class.
     */
    addBuiltinExtension(extensionId: string, extensionClass: any): void;

    /**
     * Refresh extension blocks in the toolbox.
     */
    refreshBlocks(): Promise<void>;

    /**
     * Wait for all async extensions to load.
     */
    allAsyncExtensionsLoaded(): Promise<void>;
}

/**
 * Security manager for extension security policies.
 */
declare class SecurityManager {
    /**
     * Check if an extension can be loaded from a project.
     * @param extensionId - The extension ID.
     * @param extensionURL - The extension URL.
     * @returns Whether the extension can be loaded.
     */
    canLoadExtensionFromProject(extensionId: string, extensionURL: string): Promise<boolean>;

    /**
     * Check if multiple extensions can be loaded from a project.
     * @param extensions - Array of extension info.
     * @returns Whether the extensions can be loaded.
     */
    canLoadMultipleExtensionsFromProject(extensions: Array<{ id: string; url: string; name: string }>): Promise<boolean>;
}

/**
 * The VirtualMachine class handles connections between blocks, stage, and extensions.
 */
declare class VirtualMachine {
    /**
     * VM runtime, to store blocks, I/O devices, sprites/targets, etc.
     */
    runtime: Runtime;

    /**
     * The "currently editing"/selected target ID for the VM.
     * Block events from any Blockly workspace are routed to this target.
     */
    editingTarget: Scratch.Target | null;

    /**
     * The currently dragging target, for redirecting IO data.
     */
    private _dragTarget: Scratch.Target | null;

    /**
     * Extension manager for loading and managing extensions.
     */
    extensionManager: ExtensionManager;

    /**
     * Security manager for extension security.
     */
    securityManager: SecurityManager;

    /**
     * Export some internal classes for extensions.
     */
    exports: {
        Sprite: typeof Scratch.Sprite;
        RenderedTarget: typeof Scratch.Target;
        JSZip: typeof JSZip;
        Variable: typeof Scratch.Variable;
        /**
         * Get unsupported internal APIs. WHEN your code breaks, do not expect help.
         * @deprecated Use at your own risk.
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
         * Get legacy compiler APIs.
         * @deprecated Use at your own risk.
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
     * Block listener function bound to this VM.
     */
    blockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * Flyout block listener function bound to this VM.
     */
    flyoutBlockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * Monitor block listener function bound to this VM.
     */
    monitorBlockListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * Variable listener function bound to this VM.
     */
    variableListener: (e: Scratch.BlocklyEvent) => void;

    /**
     * Start running the VM - do this before anything else.
     */
    start(): void;

    /**
     * @deprecated Used by old versions of TurboWarp. Superceded by upstream's quit()
     */
    stop(): void;

    /**
     * Quit the VM, clearing any handles which might keep the process alive.
     * Do not use the runtime after calling this method. This method is meant for test shutdown.
     */
    quit(): void;

    /**
     * "Green flag" handler - start all threads starting with a green flag.
     */
    greenFlag(): void;

    /**
     * Set whether the VM is in "turbo mode."
     * When true, loops don't yield to redraw.
     * @param turboModeOn - Whether turbo mode should be set.
     */
    setTurboMode(turboModeOn: boolean): void;

    /**
     * Set whether the VM is in 2.0 "compatibility mode."
     * When true, ticks go at 2.0 speed (30 TPS).
     * @param compatibilityModeOn - Whether compatibility mode is set.
     */
    setCompatibilityMode(compatibilityModeOn: boolean): void;

    /**
     * Set the framerate.
     * @param framerate - The target framerate.
     */
    setFramerate(framerate: number): void;

    /**
     * Set whether interpolation is enabled.
     * @param interpolationEnabled - Whether interpolation should be enabled.
     */
    setInterpolation(interpolationEnabled: boolean): void;

    /**
     * Set runtime options.
     * @param runtimeOptions - The runtime options to set.
     */
    setRuntimeOptions(runtimeOptions: {
        maxClones?: number;
        miscLimits?: boolean;
        fencing?: boolean;
    }): void;

    /**
     * Set compiler options.
     * @param compilerOptions - The compiler options to set.
     */
    setCompilerOptions(compilerOptions: {
        enabled?: boolean;
        warpTimer?: boolean;
    }): void;

    /**
     * Set the stage size.
     * @param width - Stage width.
     * @param height - Stage height.
     */
    setStageSize(width: number, height: number): void;

    /**
     * Set whether the VM is in editor mode.
     * @param inEditor - Whether in editor mode.
     */
    setInEditor(inEditor: boolean): void;

    /**
     * Convert to packaged runtime mode.
     */
    convertToPackagedRuntime(): void;

    /**
     * Add an addon block.
     * @param options - Addon block options.
     */
    addAddonBlock(options: object): void;

    /**
     * Get an addon block.
     * @param procedureCode - The procedure code.
     * @returns The addon block info.
     */
    getAddonBlock(procedureCode: string): object | undefined;

    /**
     * Store project options.
     */
    storeProjectOptions(): void;

    /**
     * Enable debug mode.
     * @returns 'enabled debug mode'
     */
    enableDebug(): string;

    /**
     * Handle extension button press.
     * @param buttonData - Button data.
     */
    handleExtensionButtonPress(buttonData: object): void;

    /**
     * Stop all threads and running activities.
     */
    stopAll(): void;

    /**
     * Clear out current running project data.
     */
    clear(): void;

    /**
     * Get data for playground. Data comes back in an emitted event.
     */
    getPlaygroundData(): void;

    /**
     * Post I/O data to the virtual devices.
     * @param device - Name of virtual I/O device.
     * @param data - Any data object to post to the I/O device.
     */
    postIOData(device: 'clock' | 'cloud' | 'keyboard' | 'mouse' | 'mouseWheel' | 'video' | 'userData', data: object): void;

    /**
     * Set the video provider.
     * @param videoProvider - The video provider to attach.
     */
    setVideoProvider(videoProvider: VideoProvider): void;

    /**
     * Set the cloud provider.
     * @param cloudProvider - The cloud provider to attach.
     */
    setCloudProvider(cloudProvider: CloudProvider): void;

    /**
     * Tell the specified extension to scan for a peripheral.
     * @param extensionId - The id of the extension.
     */
    scanForPeripheral(extensionId: string): void;

    /**
     * Connect to the extension's specified peripheral.
     * @param extensionId - The id of the extension.
     * @param peripheralId - The id of the peripheral.
     */
    connectPeripheral(extensionId: string, peripheralId: number): void;

    /**
     * Disconnect from the extension's connected peripheral.
     * @param extensionId - The id of the extension.
     */
    disconnectPeripheral(extensionId: string): void;

    /**
     * Returns whether the extension has a currently connected peripheral.
     * @param extensionId - The id of the extension.
     * @returns Whether the extension has a connected peripheral.
     */
    getPeripheralIsConnected(extensionId: string): boolean;

    /**
     * Load a Scratch project from a .sb, .sb2, .sb3 or json string.
     * @param input - A json string, object, or ArrayBuffer representing the project to load.
     * @returns Promise that resolves after targets are installed.
     */
    loadProject(input: string | object | ArrayBuffer): Promise<void>;

    /**
     * Load a project from the Scratch web site, by ID.
     * @param id - The ID of the project to download, as a string.
     */
    downloadProjectId(id: string): void;

    /**
     * Save the project as an sb3 file.
     * @param type - JSZip output type. Defaults to 'blob' for Scratch compatibility.
     * @returns Compressed sb3 file in a type determined by the type argument.
     */
    saveProjectSb3(type?: 'blob' | 'arraybuffer' | 'base64' | 'binarystring' | 'uint8array'): Promise<unknown>;

    /**
     * Save the project as an sb3 stream.
     * @param type - JSZip output type. Defaults to 'arraybuffer'.
     * @returns JSZip StreamHelper object generating the compressed sb3.
     */
    saveProjectSb3Stream(type?: 'arraybuffer' | 'blob' | 'base64'): any;

    /**
     * TW: Serialize the project into a map of files without actually zipping the project.
     * The buffers returned are the exact same ones used internally, not copies.
     * @returns Map of file name to the raw data for that file.
     */
    saveProjectSb3DontZip(): Record<string, Uint8Array>;

    /**
     * Array of all assets currently in the runtime.
     */
    readonly assets: Asset[];

    /**
     * Serialize assets for a target.
     * @param targetId - Optional ID of target to export.
     * @returns List of file descriptors.
     */
    serializeAssets(targetId?: string): Array<{ fileName: string; fileContent: Uint8Array }>;

    /**
     * Exports a sprite in the sprite3 format.
     * @param targetId - ID of the target to export.
     * @param optZipType - Optional type for the resulting zip (base64, binarystring, array, uint8array, arraybuffer, blob, nodebuffer). Defaults to blob.
     * @returns A generated zip of the sprite and its assets.
     */
    exportSprite(targetId: string, optZipType?: string): Promise<Blob | ArrayBuffer>;

    /**
     * Export project or sprite as a Scratch 3.0 JSON representation.
     * @param optTargetId - Optional id of a sprite to serialize.
     * @param serializationOptions - Options to pass to the serializer.
     * @returns Serialized state of the runtime.
     */
    toJSON(optTargetId?: string, serializationOptions?: object): string;

    /**
     * Load a project from a Scratch JSON representation.
     * @param json - JSON string representing a project.
     * @returns Promise that resolves after the project has loaded.
     * @deprecated Use loadProject instead.
     */
    fromJSON(json: string): Promise<void>;

    /**
     * Load a project from a Scratch JSON representation.
     * @param projectJSON - JSON string representing a project.
     * @param zip - Optional zipped project containing assets to be loaded.
     * @returns Promise that resolves after the project has loaded.
     */
    deserializeProject(projectJSON: string | object, zip?: JSZip): Promise<void>;

    /**
     * Install \`deserialize\` results: zero or more targets after the extensions (if any) used by those targets.
     * @param targets - The targets to be installed.
     * @param extensions - Metadata about extensions used by these targets.
     * @param wholeProject - Set to true if installing a whole project, as opposed to a single sprite.
     * @returns Promise resolved once targets have been installed.
     */
    installTargets(
        targets: Scratch.Target[],
        extensions: { extensionIDs: string[]; extensionURLs: Map<string, string> },
        wholeProject: boolean
    ): Promise<void>;

    /**
     * Add a sprite, this could be .sprite2 or .sprite3. Unpack and validate such a file first.
     * @param input - A json string, object, or ArrayBuffer representing the sprite to load.
     * @returns Promise that resolves after targets are installed.
     */
    addSprite(input: string | object | ArrayBuffer): Promise<void>;

    /**
     * Add a costume to the current editing target.
     * @param md5ext - The MD5 and extension of the costume to be loaded.
     * @param costumeObject - Object representing the costume.
     * @param optTargetId - The id of the target to add to, if not the editing target.
     * @param optVersion - If this is 2, load costume as sb2, otherwise load costume as sb3.
     * @returns Promise that resolves when the costume has been added.
     */
    addCostume(md5ext: string, costumeObject: Scratch.Costume, optTargetId?: string, optVersion?: number): Promise<void> | null;

    /**
     * Add a costume loaded from the library to the current editing target.
     * @param md5ext - The MD5 and extension of the costume to be loaded.
     * @param costumeObject - Object representing the costume.
     * @returns Promise that resolves when the costume has been added.
     */
    addCostumeFromLibrary(md5ext: string, costumeObject: Scratch.Costume): Promise<void> | null;

    /**
     * Duplicate the costume at the given index. Add it at that index + 1.
     * @param costumeIndex - Index of costume to duplicate.
     * @returns Promise that resolves when the costume has been decoded and added.
     */
    duplicateCostume(costumeIndex: number): Promise<void> | null;

    /**
     * Duplicate the sound at the given index. Add it at that index + 1.
     * @param soundIndex - Index of sound to duplicate.
     * @returns Promise that resolves when the sound has been decoded and added.
     */
    duplicateSound(soundIndex: number): Promise<void> | null;

    /**
     * Rename a costume on the current editing target.
     * @param costumeIndex - The index of the costume to be renamed.
     * @param newName - The desired new name of the costume (will be modified if already in use).
     */
    renameCostume(costumeIndex: number, newName: string): void;

    /**
     * Delete a costume from the current editing target.
     * @param costumeIndex - The index of the costume to be removed.
     * @returns A function to restore the deleted costume, or null if no costume was deleted.
     */
    deleteCostume(costumeIndex: number): (() => void) | null;

    /**
     * Add a sound to the current editing target.
     * @param soundObject - Object representing the sound.
     * @param optTargetId - The id of the target to add to, if not the editing target.
     * @returns Promise that resolves when the sound has been decoded and added.
     */
    addSound(soundObject: Scratch.Sound, optTargetId?: string): Promise<void> | null;

    /**
     * Rename a sound on the current editing target.
     * @param soundIndex - The index of the sound to be renamed.
     * @param newName - The desired new name of the sound (will be modified if already in use).
     */
    renameSound(soundIndex: number, newName: string): void;

    /**
     * Get a sound buffer from the audio engine.
     * @param soundIndex - The index of the sound to get.
     * @returns The sound's audio buffer, or null if not found.
     */
    getSoundBuffer(soundIndex: number): AudioBuffer | null;

    /**
     * Update a sound buffer.
     * @param soundIndex - The index of the sound to be updated.
     * @param newBuffer - New audio buffer for the audio engine.
     * @param soundEncoding - The new (wav) encoded sound to be stored.
     */
    updateSoundBuffer(soundIndex: number, newBuffer: AudioBuffer, soundEncoding: ArrayBuffer): void;

    /**
     * Delete a sound from the current editing target.
     * @param soundIndex - The index of the sound to be removed.
     * @returns A function to restore the sound that was deleted, or null if no sound was deleted.
     */
    deleteSound(soundIndex: number): (() => void) | null;

    /**
     * Get a string representation of the image from storage.
     * @param costumeIndex - The index of the costume to get.
     * @returns The costume's SVG string if it's SVG, a dataURI if it's PNG or JPG, or null if not found.
     */
    getCostume(costumeIndex: number): string | null;

    /**
     * TW: Get the raw binary data to use when exporting a costume to the user's local file system.
     * @param costumeObject - Scratch-vm costume object.
     * @returns The raw binary data.
     */
    getExportedCostume(costumeObject: Scratch.Costume): Uint8Array;

    /**
     * TW: Get a base64 string to use when exporting a costume to the user's local file system.
     * @param costumeObject - Scratch-vm costume object.
     * @returns Base64 string. Not a data: URI.
     */
    getExportedCostumeBase64(costumeObject: Scratch.Costume): string;

    /**
     * Update a costume with the given bitmap.
     * @param costumeIndex - The index of the costume to be updated.
     * @param bitmap - New bitmap for the renderer.
     * @param rotationCenterX - X of point about which the costume rotates.
     * @param rotationCenterY - Y of point about which the costume rotates.
     * @param bitmapResolution - 1 for normal bitmaps, 2 for double-resolution.
     */
    updateBitmap(
        costumeIndex: number,
        bitmap: ImageData,
        rotationCenterX: number,
        rotationCenterY: number,
        bitmapResolution: number
    ): void;

    /**
     * Update a costume with the given SVG.
     * @param costumeIndex - The index of the costume to be updated.
     * @param svg - New SVG for the renderer.
     * @param rotationCenterX - X of point about which the costume rotates.
     * @param rotationCenterY - Y of point about which the costume rotates.
     */
    updateSvg(costumeIndex: number, svg: string, rotationCenterX: number, rotationCenterY: number): void;

    /**
     * Add a backdrop to the stage.
     * @param md5ext - The MD5 and extension of the backdrop to be loaded.
     * @param backdropObject - Object representing the backdrop.
     * @returns Promise that resolves when the backdrop has been added.
     */
    addBackdrop(md5ext: string, backdropObject: Scratch.Costume): Promise<void> | null;

    /**
     * Rename a sprite.
     * @param targetId - ID of a target whose sprite to rename.
     * @param newName - New name of the sprite.
     */
    renameSprite(targetId: string, newName: string): void;

    /**
     * Delete a sprite and all its clones.
     * @param targetId - ID of a target whose sprite to delete.
     * @returns A function to restore the sprite that was deleted.
     */
    deleteSprite(targetId: string): () => Promise<void>;

    /**
     * Duplicate a sprite.
     * @param targetId - ID of a target whose sprite to duplicate.
     * @returns Promise that resolves when duplicated target has been added.
     */
    duplicateSprite(targetId: string): Promise<void>;

    /**
     * Set the audio engine for the VM/runtime.
     * @param audioEngine - The audio engine to attach.
     */
    attachAudioEngine(audioEngine: AudioEngine): void;

    /**
     * Set the renderer for the VM/runtime.
     * @param renderer - The renderer to attach.
     */
    attachRenderer(renderer: RenderWebGL): void;

    /**
     * The renderer attached to the vm.
     */
    readonly renderer: RenderWebGL | null;

    /**
     * Set the bitmap adapter for the VM/runtime.
     * @param bitmapAdapter - The adapter to attach.
     */
    attachV2BitmapAdapter(bitmapAdapter: (bitmap: any) => any): void;

    /**
     * Set the storage module for the VM/runtime.
     * @param storage - The storage module to attach.
     */
    attachStorage(storage: ScratchStorage): void;

    /**
     * Set the current locale and builtin messages for the VM.
     * @param locale - Current locale.
     * @param messages - Builtin messages map for current locale.
     * @returns Promise that resolves when blocks have been updated.
     */
    setLocale(locale: string, messages: Record<string, string>): Promise<void>;

    /**
     * Get the current locale for the VM.
     * @returns The current locale in the VM.
     */
    getLocale(): string;

    /**
     * Handle a Blockly event for the current editing target.
     * @param e - Any Blockly event.
     */
    blockListener(e: Scratch.BlocklyEvent): void;

    /**
     * Handle a Blockly event for the flyout.
     * @param e - Any Blockly event.
     */
    flyoutBlockListener(e: Scratch.BlocklyEvent): void;

    /**
     * Handle a Blockly event for the flyout to be passed to the monitor container.
     * @param e - Any Blockly event.
     */
    monitorBlockListener(e: Scratch.BlocklyEvent): void;

    /**
     * Handle a Blockly event for the variable map.
     * @param e - Any Blockly event.
     */
    variableListener(e: Scratch.BlocklyEvent): void;

    /**
     * Delete all of the flyout blocks.
     */
    clearFlyoutBlocks(): void;

    /**
     * Set an editing target. An editor UI can use this function to switch between editing different targets.
     * @param targetId - Id of target to set as editing.
     */
    setEditingTarget(targetId: string): void;

    /**
     * Export standalone blocks.
     * @param blockObjects - Array of blocks to export.
     * @returns Serialized blocks.
     */
    exportStandaloneBlocks(blockObjects: Scratch.Block[]): object;

    /**
     * Called when blocks are dragged from one sprite to another. Adds the blocks to the workspace of the given target.
     * @param blocks - Blocks to add.
     * @param targetId - Id of target to add blocks to.
     * @param optFromTargetId - Optional target id indicating that blocks are being shared from that target.
     * @returns Promise that resolves when the extensions and blocks have been added.
     */
    shareBlocksToTarget(blocks: object[], targetId: string, optFromTargetId?: string): Promise<void>;

    /**
     * Called when costumes are dragged from editing target to another target. Sets the newly added costume as the current costume.
     * @param costumeIndex - Index of the costume of the editing target to share.
     * @param targetId - Id of target to add the costume.
     * @returns Promise that resolves when the new costume has been loaded.
     */
    shareCostumeToTarget(costumeIndex: number, targetId: string): Promise<void>;

    /**
     * Called when sounds are dragged from editing target to another target.
     * @param soundIndex - Index of the sound of the editing target to share.
     * @param targetId - Id of target to add the sound.
     * @returns Promise that resolves when the new sound has been loaded.
     */
    shareSoundToTarget(soundIndex: number, targetId: string): Promise<void>;

    /**
     * Repopulate the workspace with the blocks of the current editingTarget.
     */
    refreshWorkspace(): void;

    /**
     * Emit metadata about available targets.
     * @param triggerProjectChange - If true, also emit a project changed event. Defaults to true.
     */
    emitTargetsUpdate(triggerProjectChange?: boolean): void;

    /**
     * Emit a Blockly/scratch-blocks compatible XML representation of the current editing target's blocks.
     */
    emitWorkspaceUpdate(): void;

    /**
     * Get a target id for a drawable id. Useful for interacting with the renderer.
     * @param drawableId - The drawable id to request the target id for.
     * @returns The target id, if found. Will also be null if the target found is the stage.
     */
    getTargetIdForDrawableId(drawableId: number): string | null;

    /**
     * Reorder target by index. Return whether a change was made.
     * @param targetIndex - Index of the target.
     * @param newIndex - Index that the target should be moved to.
     * @returns Whether a target was reordered.
     */
    reorderTarget(targetIndex: number, newIndex: number): boolean;

    /**
     * Reorder the costumes of a target if it exists. Return whether it succeeded.
     * @param targetId - ID of the target which owns the costumes.
     * @param costumeIndex - Index of the costume to move.
     * @param newIndex - Index that the costume should be moved to.
     * @returns Whether a costume was reordered.
     */
    reorderCostume(targetId: string, costumeIndex: number, newIndex: number): boolean;

    /**
     * Reorder the sounds of a target if it exists. Return whether it occurred.
     * @param targetId - ID of the target which owns the sounds.
     * @param soundIndex - Index of the sound to move.
     * @param newIndex - Index that the sound should be moved to.
     * @returns Whether a sound was reordered.
     */
    reorderSound(targetId: string, soundIndex: number, newIndex: number): boolean;

    /**
     * Put a target into a "drag" state, during which its X/Y positions will be unaffected by blocks.
     * @param targetId - The id for the target to put into a drag state.
     */
    startDrag(targetId: string): void;

    /**
     * Remove a target from a drag state, so blocks may begin affecting X/Y position again.
     * @param targetId - The id for the target to remove from the drag state.
     */
    stopDrag(targetId: string): void;

    /**
     * Post/edit sprite info for the current editing target or the drag target.
     * @param data - An object with sprite info data to set.
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
     * Set a target's variable's value. Return whether it succeeded.
     * @param targetId - ID of the target which owns the variable.
     * @param variableId - ID of the variable to set.
     * @param value - The new value of that variable.
     * @returns Whether the target and variable were found and updated.
     */
    setVariableValue(targetId: string, variableId: string, value: any): boolean;

    /**
     * Get a target's variable's value. Return null if the target or variable does not exist.
     * @param targetId - ID of the target which owns the variable.
     * @param variableId - ID of the variable to get.
     * @returns The value of the variable, or null if it could not be looked up.
     */
    getVariableValue(targetId: string, variableId: string): any | null;

    /**
     * Allow VM consumer to configure the ScratchLink socket creator.
     * @param factory - The custom ScratchLink socket factory.
     */
    configureScratchLinkSocketFactory(factory: () => WebSocket): void;
}

/**
 * JSZip library for zip file handling.
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
 * EventEmitter for VM events.
 */
declare class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
}

/**
 * VM instance provided to extensions.
 * The global VM variable available in extension code.
 */
declare const VM: VirtualMachine;
`

export default vm;