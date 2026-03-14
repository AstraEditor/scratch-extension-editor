const scratch = `/**
 * Scratch Global API Type Definitions
 * This file provides type definitions and JSDoc for the Scratch global object available to extensions
 */

/**
 * Argument types for block inputs
 * @enum {string}
 */
declare enum ArgumentType {
    /** Numeric value with angle picker */
    ANGLE = 'angle',

    /** Boolean value with hexagonal placeholder */
    BOOLEAN = 'Boolean',

    /** Numeric value with color picker */
    COLOR = 'color',

    /** Numeric value with text field */
    NUMBER = 'number',

    /** String value with text field */
    STRING = 'string',

    /** String value with matrix field */
    MATRIX = 'matrix',

    /** MIDI note number with note picker (piano) field */
    NOTE = 'note',

    /** Inline image on block (as part of the label) */
    IMAGE = 'image',

    /** Name of costume in the current target */
    COSTUME = 'costume',

    /** Name of sound in the current target */
    SOUND = 'sound'
}

/**
 * Types of block
 * @enum {string}
 */
declare enum BlockType {
    /** Boolean reporter with hexagonal shape */
    BOOLEAN = 'Boolean',

    /** A button (not an actual block) for some special action, like making a variable */
    BUTTON = 'button',

    /** A text label (not an actual block) for adding comments or labeling blocks */
    LABEL = 'label',

    /** Command block */
    COMMAND = 'command',

    /**
     * Specialized command block which may or may not run a child branch
     * The thread continues with the next block whether or not a child branch ran.
     */
    CONDITIONAL = 'conditional',

    /**
     * Specialized hat block with no implementation function
     * This stack only runs if the corresponding event is emitted by other code.
     */
    EVENT = 'event',

    /** Hat block which conditionally starts a block stack */
    HAT = 'hat',

    /**
     * Specialized command block which may or may not run a child branch
     * If a child branch runs, the thread evaluates the loop block again.
     */
    LOOP = 'loop',

    /** General reporter with numeric or string value */
    REPORTER = 'reporter',

    /** Arbitrary scratch-blocks XML */
    XML = 'xml'
}

/**
 * Block shape types
 * @enum {number}
 */
declare enum BlockShape {
    /** Round shape for reporters */
    ROUND = 1,

    /** Hexagonal shape for booleans */
    HEXAGONAL = 2,

    /** Square shape for commands */
    SQUARE = 3
}

/**
 * Target types
 * @enum {string}
 */
declare enum TargetType {
    /** Sprite target */
    SPRITE = 'sprite',

    /** Stage target */
    STAGE = 'stage'
}

/**
 * Cast utility functions interface for type conversion
 */
interface CastInterface {
    /**
     * Convert value to boolean
     * @param value - Value to convert
     * @returns Boolean value
     */
    toBoolean(value: any): boolean;

    /**
     * Convert value to number
     * @param value - Value to convert
     * @returns Number value
     */
    toNumber(value: any): number;

    /**
     * Convert value to string
     * @param value - Value to convert
     * @returns String value
     */
    toString(value: any): string;

    /**
     * Compare two values for equality
     * @param v1 - First value
     * @param v2 - Second value
     * @returns Whether values are equal
     */
    compare(v1: any, v2: any): boolean;

    /**
     * Check if value is a valid number
     * @param value - Value to check
     * @returns Whether value is a valid number
     */
    isNumber(value: any): boolean;

    /**
     * Get rounded value for list sorting
     * @param value - Value to round
     * @returns Rounded value
     */
    toRounded(value: any): number;
}

/**
 * External utilities interface provided by TurboWarp
 */
interface ExternalInterface {
    /** JSON utilities */
    JSON: {
        /**
         * Safely parse JSON string
         * @param text - JSON string to parse
         * @returns Parsed object or null if invalid
         */
        parse(text: string): any;
    };

    /** Fetch utilities */
    fetch: {
        /**
         * Fetch with timeout support
         * @param url - URL to fetch
         * @param options - Fetch options
         * @returns Response promise
         */
        (url: string, options?: RequestInit): Promise<Response>;
    };
}

/**
 * Extension registration interface
 */
interface ExtensionsInterface {
    /** Whether this is an unsandboxed extension */
    unsandboxed: boolean;

    /**
     * Register an extension
     * @param extensionObject - The extension object to register
     */
    register(extensionObject: ExtensionObject): void;
}

/**
 * Extension object structure
 */
interface ExtensionObject {
    /** Extension ID */
    id: string;

    /** Extension name */
    name: string;

    /** Block definitions */
    blocks?: ExtensionBlock[];

    /** Menu definitions */
    menus?: Record<string, ExtensionMenu>;

    /** Block implementation functions */
    [opcode: string]: Function | any;
}

/**
 * Extension block definition
 */
interface ExtensionBlock {
    /** Block opcode (function name) */
    opcode: string;

    /** Block type */
    blockType: BlockType | string;

    /** Block text with placeholders */
    text: string;

    /** Block arguments definition */
    arguments?: Record<string, ExtensionArgument>;

    /** Whether this is a terminal block (stops execution) */
    isTerminal?: boolean;

    /** Whether this block should hide the palette */
    hideFromPalette?: boolean;

    /** Whether this block is edge-triggered */
    isEdgeActivated?: boolean;

    /** Whether to restart existing threads */
    shouldRestartExistingThreads?: boolean;

    /** Filter for which targets this block applies to */
    filter?: TargetType | string;

    /** Disable a specific block */
    disableMonitor?: boolean;
}

/**
 * Extension argument definition
 */
interface ExtensionArgument {
    /** Argument type */
    type: ArgumentType | string;

    /** Default value */
    defaultValue?: any;

    /** Menu name for dropdown */
    menu?: string;

    /** Variable type for variable arguments */
    variableType?: string;
}

/**
 * Extension menu definition
 */
interface ExtensionMenu {
    /** Accept reporters (allows typed input) */
    acceptReporters?: boolean;

    /** Menu items */
    items: Array<{ text: string; value: string }> | string[] | (() => Array<{ text: string; value: string }>);
}

/**
 * Global Scratch object available to unsandboxed extensions
 */
declare const Scratch: {
    /** Argument type enum */
    ArgumentType: typeof ArgumentType;

    /** Block type enum */
    BlockType: typeof BlockType;

    /** Block shape enum */
    BlockShape: typeof BlockShape;

    /** Target type enum */
    TargetType: typeof TargetType;

    /** Cast utility functions */
    Cast: CastInterface;

    /** External utilities */
    external: ExternalInterface;

    /** Extension management interface */
    extensions: ExtensionsInterface;

    /** Virtual Machine instance */
    vm: VirtualMachine;

    /** Renderer instance */
    renderer: RenderWebGL | null;

    /**
     * Check if extension can fetch from a URL
     * @param url - URL to check
     * @returns Promise resolving to whether fetch is allowed
     * @example
     * if (await Scratch.canFetch('https://example.com/api')) {
     *     const response = await Scratch.fetch('https://example.com/api');
     * }
     */
    canFetch(url: string): Promise<boolean>;

    /**
     * Check if extension can open a new window
     * @param url - URL to open
     * @returns Promise resolving to whether opening is allowed
     */
    canOpenWindow(url: string): Promise<boolean>;

    /**
     * Check if extension can redirect the page
     * @param url - URL to redirect to
     * @returns Promise resolving to whether redirect is allowed
     */
    canRedirect(url: string): Promise<boolean>;

    /**
     * Check if extension can record audio
     * @returns Promise resolving to whether audio recording is allowed
     */
    canRecordAudio(): Promise<boolean>;

    /**
     * Check if extension can record video
     * @returns Promise resolving to whether video recording is allowed
     */
    canRecordVideo(): Promise<boolean>;

    /**
     * Check if extension can read clipboard
     * @returns Promise resolving to whether clipboard reading is allowed
     */
    canReadClipboard(): Promise<boolean>;

    /**
     * Check if extension can show notifications
     * @returns Promise resolving to whether notifications are allowed
     */
    canNotify(): Promise<boolean>;

    /**
     * Check if extension can access geolocation
     * @returns Promise resolving to whether geolocation is allowed
     */
    canGeolocate(): Promise<boolean>;

    /**
     * Check if extension can embed content
     * @param url - URL to embed
     * @returns Promise resolving to whether embedding is allowed
     */
    canEmbed(url: string): Promise<boolean>;

    /**
     * Check if extension can download files
     * @param url - URL to download from
     * @param name - Suggested filename
     * @returns Promise resolving to whether download is allowed
     */
    canDownload(url: string, name?: string): Promise<boolean>;

    /**
     * Fetch a URL with security checks
     * @param url - URL to fetch or Request object
     * @param options - Fetch options
     * @returns Promise resolving to Response
     * @throws Error if fetch permission denied
     * @example
     * const response = await Scratch.fetch('https://api.example.com/data');
     * const data = await response.json();
     */
    fetch(url: string | Request, options?: RequestInit): Promise<Response>;

    /**
     * Open a new browser window/tab
     * @param url - URL to open
     * @param features - Window features
     * @returns WindowProxy or null
     * @throws Error if permission denied
     */
    openWindow(url: string, features?: string): Window | null;

    /**
     * Redirect the current page
     * @param url - URL to redirect to
     * @throws Error if permission denied
     */
    redirect(url: string): void;

    /**
     * Trigger a file download
     * @param url - URL to download
     * @param name - Filename for download
     * @throws Error if permission denied
     * @example
     * Scratch.download('data:text/plain;base64,SGVsbG8gV29ybGQ=', 'hello.txt');
     */
    download(url: string, name: string): void;

    /**
     * Translate text to current locale
     * @param text - Text to translate
     * @returns Translated text or original if no translation
     * @example
     * const label = Scratch.translate('Hello World');
     */
    translate(text: string): string;
};

/**
 * Global ScratchExtensions object for Scratch 2.0 compatibility
 * @deprecated Use Scratch.extensions.register instead
 */
declare const ScratchExtensions: {
    /**
     * Register a Scratch 2.0 style extension
     * @deprecated Use Scratch.extensions.register instead
     */
    register(extensionId: string, extensionName: string, descriptor: any): void;

    /**
     * Register an unsandboxed Scratch 2.0 style extension
     * @deprecated Use Scratch.extensions.register instead
     */
    registerUnsandboxed(extensionId: string, extensionName: string, descriptor: any): void;
};

/**
 * VirtualMachine interface (simplified for extension use)
 */
declare class VirtualMachine {
    /** VM runtime */
    runtime: Runtime;

    /** Extension manager */
    extensionManager: ExtensionManager;

    /** Security manager */
    securityManager: SecurityManager;
}

/**
 * Runtime interface (simplified for extension use)
 */
declare class Runtime {
    /** All targets (sprites and stage) */
    targets: Target[];

    /** Currently running threads */
    threads: Thread[];

    /** Stage width */
    stageWidth: number;

    /** Stage height */
    stageHeight: number;

    /** Whether turbo mode is enabled */
    turboMode: boolean;

    /**
     * Start hat (event) handlers
     * @param requestedHat - Hat type to start
     * @param optMatchFields - Optional match fields
     * @param optTarget - Optional target
     * @returns Started threads
     */
    startHats(requestedHat: string, optMatchFields?: object, optTarget?: Target): Thread[];

    /** Emit project changed event */
    emitProjectChanged(): void;

    /**
     * Get stage target
     * @returns Stage target or undefined
     */
    getTargetForStage(): Target | undefined;

    /**
     * Get target by ID
     * @param id - Target ID
     * @returns Target or undefined
     */
    getTargetById(id: string): Target | undefined;

    /**
     * Get sprite target by name
     * @param name - Sprite name
     * @returns Target or undefined
     */
    getSpriteTargetByName(name: string): Target | undefined;
}

/**
 * Target represents a sprite or stage
 */
declare class Target {
    /** Target ID */
    id: string;

    /** Associated sprite */
    sprite: Sprite;

    /** Whether this is the stage */
    isStage: boolean;

    /** Current X position */
    x: number;

    /** Current Y position */
    y: number;

    /** Current direction */
    direction: number;

    /** Current size */
    size: number;

    /** Whether visible */
    visible: boolean;

    /** Current volume */
    volume: number;

    /** Get target name */
    getName(): string;

    /** Get all costumes */
    getCostumes(): Costume[];

    /** Get all sounds */
    getSounds(): Sound[];

    /**
     * Look up variable by ID
     * @param id - Variable ID
     */
    lookupVariableById(id: string): Variable | null;

    /**
     * Look up variable by name and type
     * @param name - Variable name
     * @param type - Variable type
     */
    lookupVariableByNameAndType(name: string, type: string): Variable | null;
}

/**
 * Sprite interface
 */
declare class Sprite {
    /** Sprite name */
    name: string;

    /** All clones */
    clones: Target[];

    /** All costumes */
    costumes: Costume[];

    /** All sounds */
    sounds: Sound[];
}

/**
 * Costume interface
 */
declare class Costume {
    /** Costume name */
    name: string;

    /** Asset ID */
    assetId: string;

    /** Data format */
    dataFormat: string;
}

/**
 * Sound interface
 */
declare class Sound {
    /** Sound name */
    name: string;

    /** Sound ID */
    soundId: string;

    /** Asset ID */
    assetId: string;
}

/**
 * Variable interface
 */
declare class Variable {
    /** Variable ID */
    id: string;

    /** Variable name */
    name: string;

    /** Variable type */
    type: string;

    /** Variable value */
    value: any;

    /** Whether this is a cloud variable */
    isCloud: boolean;
}

/**
 * Thread interface
 */
declare class Thread {
    /** Target this thread belongs to */
    target: Target;

    /** Top block ID */
    topBlock: string;

    /** Whether thread is killed */
    isKilled: boolean;
}

/**
 * Extension manager interface
 */
declare class ExtensionManager {
    /**
     * Check if extension is loaded
     * @param extensionId - Extension ID
     */
    isExtensionLoaded(extensionId: string): boolean;

    /**
     * Load extension by URL or ID
     * @param extensionURL - Extension URL or ID
     */
    loadExtensionURL(extensionURL: string): Promise<void>;
}

/**
 * Security manager interface
 */
declare class SecurityManager {
    /**
     * Check if extension can be loaded
     * @param extensionId - Extension ID
     * @param extensionURL - Extension URL
     */
    canLoadExtensionFromProject(extensionId: string, extensionURL: string): Promise<boolean>;
}

/**
 * RenderWebGL interface
 */
declare class RenderWebGL {
    /**
     * Update a bitmap skin
     * @param skinId - Skin ID
     * @param bitmap - Bitmap canvas
     * @param bitmapResolution - Bitmap resolution
     * @param rotationCenter - Rotation center
     */
    updateBitmapSkin(skinId: number, bitmap: HTMLCanvasElement, bitmapResolution: number, rotationCenter: [number, number]): void;

    /**
     * Update an SVG skin
     * @param skinId - Skin ID
     * @param svg - SVG string
     * @param rotationCenter - Rotation center
     */
    updateSVGSkin(skinId: number, svg: string, rotationCenter: [number, number]): void;
}
`

export default scratch;
