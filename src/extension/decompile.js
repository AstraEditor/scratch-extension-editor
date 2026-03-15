import { t } from "../i18n";
import { setAllValue } from "./storage.js";
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line import/no-anonymous-default-export
// eslint-disable-next-line no-new-func

// 模拟 Scratch API 类型
const ArgumentType = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'Boolean',
    COLOR: 'color',
    ANGLE: 'angle',
    MATRIX: 'matrix',
    NOTE: 'note',
    IMAGE: 'image'
};

const BlockType = {
    COMMAND: 'command',
    REPORTER: 'reporter',
    BOOLEAN: 'Boolean',
    HAT: 'hat',
    CONDITIONAL: 'conditional',
    LOOP: 'loop'
};

/**
 * 创建 WebGL 模拟对象（提前定义，供 mockCanvas 使用）
 */
function createMockWebGL() {
    // WebGL 常量
    const GL_CONSTANTS = {
        ARRAY_BUFFER: 0x8892,
        ELEMENT_ARRAY_BUFFER: 0x8893,
        TEXTURE_2D: 0x0DE1,
        TEXTURE_CUBE_MAP: 0x8513,
        TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,
        TEXTURE_CUBE_MAP_NEGATIVE_X: 0x8516,
        TEXTURE_CUBE_MAP_POSITIVE_Y: 0x8517,
        TEXTURE_CUBE_MAP_NEGATIVE_Y: 0x8518,
        TEXTURE_CUBE_MAP_POSITIVE_Z: 0x8519,
        TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851A,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        CLAMP_TO_EDGE: 0x812F,
        REPEAT: 0x2901,
        NEAREST: 0x2600,
        LINEAR: 0x2601,
        NEAREST_MIPMAP_NEAREST: 0x2700,
        LINEAR_MIPMAP_NEAREST: 0x2701,
        NEAREST_MIPMAP_LINEAR: 0x2702,
        LINEAR_MIPMAP_LINEAR: 0x2703,
        RGBA: 0x1908,
        RGB: 0x1907,
        DEPTH_COMPONENT: 0x1902,
        DEPTH_COMPONENT16: 0x81A5,
        DEPTH_COMPONENT24: 0x81A6,
        UNSIGNED_BYTE: 0x1401,
        UNSIGNED_SHORT: 0x1403,
        UNSIGNED_INT: 0x1405,
        FLOAT: 0x1406,
        FRAMEBUFFER: 0x8D40,
        RENDERBUFFER: 0x8D41,
        COLOR_ATTACHMENT0: 0x8CE0,
        DEPTH_ATTACHMENT: 0x8D00,
        DEPTH_STENCIL_ATTACHMENT: 0x821A,
        POINTS: 0x0000,
        LINES: 0x0001,
        LINE_LOOP: 0x0002,
        LINE_STRIP: 0x0003,
        TRIANGLES: 0x0004,
        TRIANGLE_STRIP: 0x0005,
        TRIANGLE_FAN: 0x0006,
        DEPTH_TEST: 0x0B71,
        LESS: 0x0201,
        LEQUAL: 0x0203,
        GREATER: 0x0204,
        EQUAL: 0x0202,
        NOTEQUAL: 0x0205,
        ALWAYS: 0x0207,
        NEVER: 0x0200,
        BLEND: 0x0BE2,
        SRC_ALPHA: 0x0302,
        ONE_MINUS_SRC_ALPHA: 0x0303,
        ONE: 1,
        ZERO: 0,
        CULL_FACE: 0x0B44,
        FRONT: 0x0404,
        BACK: 0x0405,
        SCISSOR_TEST: 0x0C11,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
        UNPACK_FLIP_Y_WEBGL: 0x9240,
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        COMPILE_STATUS: 0x8B81,
        LINK_STATUS: 0x8B82,
        FLOAT_MAT4: 0x8B5C,
        SAMPLER_2D: 0x8B5E,
        SAMPLER_CUBE: 0x8B60,
        FUNC_ADD: 0x8006,
        FUNC_REVERSE_SUBTRACT: 0x800B,
    };
    
    const createMock = () => ({});
    
    const glMethods = {
        createBuffer: createMock,
        createTexture: createMock,
        createFramebuffer: createMock,
        createRenderbuffer: createMock,
        createShader: createMock,
        createProgram: createMock,
        createVertexArray: createMock,
        deleteBuffer: () => {},
        deleteTexture: () => {},
        deleteFramebuffer: () => {},
        deleteRenderbuffer: () => {},
        deleteShader: () => {},
        deleteProgram: () => {},
        deleteVertexArray: () => {},
        bindBuffer: () => {},
        bindTexture: () => {},
        bindFramebuffer: () => {},
        bindRenderbuffer: () => {},
        bindVertexArray: () => {},
        bufferData: () => {},
        bufferSubData: () => {},
        texImage2D: () => {},
        texImage3D: () => {},
        texSubImage2D: () => {},
        texParameteri: () => {},
        texParameterf: () => {},
        renderbufferStorage: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        drawArraysInstanced: () => {},
        drawElementsInstanced: () => {},
        enable: () => {},
        disable: () => {},
        isEnabled: () => false,
        viewport: () => {},
        scissor: () => {},
        clear: () => {},
        clearColor: () => {},
        clearDepth: () => {},
        depthFunc: () => {},
        depthMask: () => {},
        blendFunc: () => {},
        blendFuncSeparate: () => {},
        blendEquation: () => {},
        cullFace: () => {},
        frontFace: () => {},
        shaderSource: () => {},
        compileShader: () => {},
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getUniformLocation: () => createMock(),
        getAttribLocation: () => -1,
        uniform1i: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix2fv: () => {},
        uniformMatrix3fv: () => {},
        uniformMatrix4fv: () => {},
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        getExtension: (name) => {
            if (name === 'EXT_texture_filter_anisotropic' || 
                name === 'MOZ_EXT_texture_filter_anisotropic' ||
                name === 'WEBKIT_EXT_texture_filter_anisotropic') {
                return { TEXTURE_MAX_ANISOTROPY_EXT: 0x84FE };
            }
            return null;
        },
        getParameter: (pname) => GL_CONSTANTS[pname] ?? null,
        generateMipmap: () => {},
        pixelStorei: () => {},
        readPixels: () => {},
        finish: () => {},
        flush: () => {},
        getError: () => 0,
        framebufferTexture2D: () => {},
        framebufferRenderbuffer: () => {},
        checkFramebufferStatus: () => 0x8CD5,
    };
    
    const gl = { ...GL_CONSTANTS, ...glMethods };
    gl.drawingBufferWidth = 480;
    gl.drawingBufferHeight = 360;
    return gl;
}

// 创建 WebGL 模拟对象
const mockGL = createMockWebGL();

// 模拟 HTMLCanvasElement.prototype.getContext，使所有 canvas 都返回 mockGL
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextId, options) {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
        return mockGL;
    }
    // 对于 2d context，调用原始方法或返回 null
    if (originalGetContext) {
        try {
            return originalGetContext.call(this, contextId, options);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// 创建全局模拟对象
const mockCanvas = document.createElement('canvas');
mockCanvas.width = 480;
mockCanvas.height = 360;

// 先声明 smartProxy（稍后定义）
let smartProxy;

// 创建一个空数组实例，预填充常用数组方法
const emptyArrayInstance = [];

// 定义原始值转换函数（提前定义避免引用错误）
const toPrimitiveHandler = function(hint) {
    if (hint === 'string') return '';
    if (hint === 'number') return 0;
    return null;
};

// 创建一个智能的多用途对象：既可以是构造函数，又可以是普通对象
function createSmartProxy(baseObj = {}) {
    // 创建一个基础类作为构造函数
    const BaseClass = class {};
    
    // 创建一个通用的空函数，用于任何方法调用
    const noop = function() { return smartProxy; };
    
    // 创建实例方法映射 - 所有方法都返回安全值
    const instanceMethods = {
        // 数组方法
        indexOf: () => -1,
        lastIndexOf: () => -1,
        includes: () => false,
        find: noop,
        findIndex: () => -1,
        push: () => 0,
        pop: noop,
        shift: noop,
        unshift: () => 0,
        slice: function() { return smartProxy; },
        splice: function() { return smartProxy; },
        map: function() { return smartProxy; },
        filter: function() { return smartProxy; },
        reduce: noop,
        forEach: () => {},
        some: () => false,
        every: () => true,
        join: () => '',
        concat: function() { return smartProxy; },
        reverse: function() { return smartProxy; },
        sort: function() { return smartProxy; },
        flat: function() { return smartProxy; },
        flatMap: function() { return smartProxy; },
        entries: () => [].entries(),
        keys: () => [].keys(),
        values: () => [].values(),
        // 对象方法 - 返回基本类型值以支持类型转换
        hasOwnProperty: () => false,
        toString: () => '',
        valueOf: () => 0,
        // 函数方法 - 返回一个可调用的函数
        bind: function() { return noop; },
        call: function() { return noop(); },
        apply: function() { return noop(); }
    };
    
    return new Proxy(BaseClass, {
        // 作为构造函数调用
        construct(target, args) {
            return new target();
        },
        
        // 获取属性
        get(target, prop) {
            // 如果是 Symbol
            if (typeof prop === 'symbol') {
                if (prop === Symbol.hasInstance) return () => true;
                if (prop === Symbol.toPrimitive) return toPrimitiveHandler;
                if (prop === Symbol.iterator) return emptyArrayInstance[Symbol.iterator];
                if (prop === Symbol.toStringTag) return 'Object';
                if (prop === Symbol.isConcatSpreadable) return false;
                return noop;
            }
            
            // 检查 baseObj 是否有该属性（使用 hasOwnProperty 避免原型链）
            if (Object.prototype.hasOwnProperty.call(baseObj, prop)) {
                const value = baseObj[prop];
                // 函数直接返回
                if (typeof value === 'function') return value;
                // 对象返回代理
                if (value && typeof value === 'object') return createSmartProxy(value);
                // 基本类型（数字、字符串、布尔值）直接返回
                if (value !== undefined && value !== null) return value;
                // undefined 或 null 返回 smartProxy
                return smartProxy;
            }
            
            // 数组属性
            if (prop === 'length') return 0;
            if (prop === 'prototype') return BaseClass.prototype;
            if (prop === 'constructor') return BaseClass;
            
            // 静态数组方法
            if (['from', 'of', 'isArray'].includes(prop)) {
                return Array[prop];
            }
            
            // 返回实例方法
            if (prop in instanceMethods) {
                return instanceMethods[prop];
            }
            
            // 数字索引返回空代理（支持链式调用）
            if (/^\d+$/.test(prop)) {
                return smartProxy;
            }
            
            // 所有其他属性返回智能代理（支持链式访问和调用）
            return smartProxy;
        },
        
        // 作为函数调用
        apply(target, thisArg, args) {
            return smartProxy;
        },
        
        // 设置属性 - 允许设置任何属性
        set(target, prop, value) {
            // 也存储到 baseObj 中以便后续读取
            baseObj[prop] = value;
            return true;
        },
        
        // 支持 in 操作符
        has(target, prop) {
            return true;
        }
    });
}

// 预创建常用的代理对象
smartProxy = createSmartProxy();

const mockRenderer = createSmartProxy({
    canvas: mockCanvas,
    draw: () => {},
    clear: () => {},
    resize: () => {},
    enter: () => {},
    exit: () => {},
    createDrawable: () => smartProxy,
    destroyDrawable: () => {},
    updateDrawableProperties: () => {},
    createSkin: () => smartProxy,
    destroySkin: () => {},
    updateSkin: () => {},
    requestRedraw: () => {}
});

const mockAudioContext = createSmartProxy({
    createBuffer: () => createSmartProxy({ getChannelData: () => new Float32Array(0) }),
    createBufferSource: () => createSmartProxy({ start: () => {}, stop: () => {} }),
    createGain: () => createSmartProxy({ gain: createSmartProxy({ value: 1 }) }),
    decodeAudioData: () => Promise.resolve(smartProxy),
    sampleRate: 44100,
    state: 'running'
});



/**
 * 创建万能代理对象 - 自动处理所有未定义的属性访问
 * 确保所有返回值都可以被 extends 继承，同时支持作为普通对象使用
 */
function createProxy(target, path = '') {
    // 创建一个通用的空函数
    const noop = function() { return smartProxy; };
    
    const handler = {
        get(obj, prop) {
            // 处理 Symbol 属性
            if (typeof prop === 'symbol') {
                if (prop in obj) {
                    return obj[prop];
                }
                if (prop === Symbol.hasInstance) return () => true;
                if (prop === Symbol.toPrimitive) return toPrimitiveHandler;
                if (prop === Symbol.iterator) return emptyArrayInstance[Symbol.iterator];
                if (prop === Symbol.toStringTag) return 'Object';
                if (prop === Symbol.isConcatSpreadable) return false;
                return noop;
            }
            
            // 优先检查对象自身的属性
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                const value = obj[prop];
                
                // 如果是函数（包括类），直接返回，不包装
                if (typeof value === 'function') {
                    return value;
                }
                
                // 如果是 null，返回智能代理
                if (value === null) {
                    return smartProxy;
                }
                
                // 如果是对象，直接返回，不进行二次包装
                if (typeof value === 'object') {
                    return value;
                }
                
                // 基本类型直接返回
                return value;
            }
            
            // 数字索引返回智能代理
            if (typeof prop === 'number' || /^\d+$/.test(prop)) {
                return smartProxy;
            }
            
            // length 属性返回 0
            if (prop === 'length') {
                return 0;
            }
            
            // 下划线开头的属性返回智能代理
            if (typeof prop === 'string' && prop.startsWith('_')) {
                return smartProxy;
            }
            
            // 特殊属性名
            const objectProperties = ['prototype', 'constructor', '__proto__'];
            if (objectProperties.includes(prop)) {
                return smartProxy;
            }
            
            // 其他属性返回智能代理
            return smartProxy;
        },
        set(obj, prop, value) {
            obj[prop] = value;
            return true;
        },
        construct(target, args) {
            return smartProxy;
        },
        has(target, prop) {
            return true;
        }
    };
    
    return new Proxy(target || {}, handler);
}

/**
 * 创建完整的 Scratch 对象
 */
function createScratchAPI() {
    // 使用 Proxy 创建万能 renderer
    const apiRenderer = createProxy({
        canvas: mockCanvas,
        gl: mockGL,
        requestRedraw: () => {},
        exports: createProxy({
            // Skin 类需要正确设置 _renderer 和 _id 属性
            Skin: class {
                constructor(id, renderer) {
                    this._id = id;
                    this._renderer = renderer;
                    this._silhouette = {
                        update: () => {},
                        distance: () => 0
                    };
                }
                dispose() {}
                getTexture() { return null; }
                get size() { return [0, 0]; }
                emitWasAltered() {}
            },
            Drawable: class {},
            Texture: class {}
        }),
        getNativeSize: () => [480, 360],
        on: () => {},
        removeListener: () => {},
        createSkin: () => ({}),
        destroySkin: () => {},
        // Simple3D 扩展需要的属性
        useHighQualityRender: false,
        _layerGroups: { 
            video: { groupIndex: 0, drawListOffset: 0 },
            simple3D: { groupIndex: 1, drawListOffset: 0 }
        },
        _groupOrdering: ['video'],
        _allSkins: smartProxy,
        _allDrawables: smartProxy,
        _nextSkinId: 1,
        createDrawable: () => 1,
        updateDrawableSkinId: () => {},
        markDrawableAsNoninteractive: () => {},
        draw: function() {},
        dirty: true
    });

    // 使用 Proxy 创建万能 runtime
    const mockRuntime = createProxy({
        renderer: apiRenderer,
        ioDevices: createProxy({
            audio: createProxy({
                audioContext: mockAudioContext
            }),
            clock: createProxy({
                pause: () => {},
                resume: () => {}
            })
        }),
        extensionButtons: new Map(),
        extensionStorage: {},
        _monitorState: new Map(),
        monitorBlocks: createProxy({
            getBlock: () => smartProxy,
            deleteBlock: () => {}
        }),
        requestRedraw: () => {},
        on: () => {},
        off: () => {},
        emit: () => {},
        once: () => {},
        getTargetForStage: () => smartProxy,
        startHats: () => [],
        _stopThread: () => {},
        requestBlocksUpdate: () => {},
        requestToolboxExtensionsUpdate: () => {},
        emitProjectChanged: () => {},
        // Simple3D 扩展需要的属性
        ext_xeltallivSimple3Dapi: {}
    });

    // 使用 Proxy 创建万能 VM
    const mockVM = createProxy({
        runtime: mockRuntime,
        renderer: apiRenderer,
        getLocale: () => 'en',
        on: () => {},
        off: () => {},
        emit: () => {},
        addListener: () => {},
        removeListener: () => {},
        extensionManager: createProxy({
            isExtensionLoaded: () => false,
            unloadExtension: () => {},
            loadExtensionURL: () => Promise.resolve()
        })
    });

    const translate = (message, args) => {
        if (typeof message === 'string') {
            return message;
        }
        if (message && typeof message === 'object' && message.default) {
            return message.default;
        }
        return String(message);
    };
    translate.setup = (newTranslations) => {};
    Object.defineProperty(translate, 'language', {
        get: () => 'en'
    });

    // 使用 Proxy 创建万能 Scratch 对象
    const Scratch = createProxy({
        ArgumentType,
        BlockType,
        Cast: {
            toNumber: (val) => Number(val),
            toString: (val) => String(val),
            toBoolean: (val) => Boolean(val),
            compare: (a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            }
        },
        vm: mockVM,
        runtime: mockRuntime,
        renderer: apiRenderer,
        translate,
        extensions: {
            unsandboxed: true,
            register: () => {}
        },
        canFetch: async () => true,
        canOpenWindow: async () => true,
        canRedirect: async () => true,
        canRecordAudio: async () => true,
        canRecordVideo: async () => true,
        canReadClipboard: async () => true,
        canNotify: async () => true,
        canGeolocate: async () => true,
        canEmbed: async () => true,
        canDownload: async () => true,
        fetch: async (url, options) => fetch(url, options)
    });

    return Scratch;
}

function createModuleMock() {
    return { exports: {} };
}

/**
 * 反编译：将扩展代码转换为 .ab 格式
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default async (e) => {
    const readContent = () => {
        return new Promise((resolve, reject) => {
            const file = e.target.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = () => {
                reject(new Error(t('Failed to load project')));
            };
            reader.readAsText(file);
        });
    };

    const extensionCode = await readContent();
    if (!extensionCode) return null;

    return new Promise((resolve, reject) => {
        let extensionObject = null;
        let registered = false;
        
        const timeout = setTimeout(() => {
            if (!registered && !extensionObject) {
                cleanupGlobals(originalGlobals);
                reject(new Error(t('Extension did not register within 5 seconds')));
            }
        }, 5000);

        const originalGlobals = {
            Scratch: window.Scratch,
            module: window.module,
            exports: window.exports,
            ScratchExtensions: window.ScratchExtensions,
            ReduxStore: window.ReduxStore
        };

        const Scratch = createScratchAPI();
        const module = createModuleMock();
        
        const ReduxStore = class {
            constructor(initialState) {
                this.state = initialState || {};
                this.listeners = [];
            }
            getState() {
                return this.state;
            }
            setState(newState) {
                this.state = { ...this.state, ...newState };
                this.listeners.forEach(fn => fn(this.state));
            }
            subscribe(fn) {
                this.listeners.push(fn);
                return () => {
                    const index = this.listeners.indexOf(fn);
                    if (index > -1) {
                        this.listeners.splice(index, 1);
                    }
                };
            }
        };

        Scratch.extensions.register = (obj) => {
            extensionObject = obj;
            registered = true;
            clearTimeout(timeout);
            try {
                const info = typeof obj.getInfo === 'function' ? obj.getInfo() : obj;
                const abData = convertToABFormat(info, obj, extensionCode);
                setAllValue(abData);
                cleanupGlobals(originalGlobals);
                resolve(abData);
            } catch (err) {
                cleanupGlobals(originalGlobals);
                reject(err);
            }
        };

        window.Scratch = Scratch;
        window.module = module;
        window.exports = module.exports;
        window.ReduxStore = ReduxStore;
        
        window.ScratchExtensions = {
            register: (obj) => {
                extensionObject = obj;
                registered = true;
                clearTimeout(timeout);
                try {
                    const info = typeof obj.getInfo === 'function' ? obj.getInfo() : obj;
                    const abData = convertToABFormat(info, obj, extensionCode);
                    setAllValue(abData);
                    cleanupGlobals(originalGlobals);
                    resolve(abData);
                } catch (err) {
                    cleanupGlobals(originalGlobals);
                    reject(err);
                }
            }
        };

        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('Scratch', 'module', 'exports', 'ReduxStore', 'Canvas', 'WebGL', 'AudioContext', extensionCode);
            fn(Scratch, module, module.exports, ReduxStore, mockCanvas, mockRenderer._gl, mockAudioContext);
            
            setTimeout(() => {
                if (!registered && extensionObject) {
                    try {
                        const info = typeof extensionObject.getInfo === 'function' ? extensionObject.getInfo() : extensionObject;
                        const abData = convertToABFormat(info, extensionObject, extensionCode);
                        setAllValue(abData);
                        cleanupGlobals(originalGlobals);
                        resolve(abData);
                    } catch (err) {
                        cleanupGlobals(originalGlobals);
                        reject(err);
                    }
                } else if (!registered && !extensionObject) {
                    cleanupGlobals(originalGlobals);
                    reject(new Error(t('Extension did not register')));
                }
            }, 100);
        } catch (error) {
            clearTimeout(timeout);
            cleanupGlobals(originalGlobals);
            console.error(error);
            reject(new Error(t('Failed to execute extension code') + ': ' + error.message));
        }
    });
}

function cleanupGlobals(originalGlobals) {
    if (originalGlobals.Scratch !== undefined) {
        window.Scratch = originalGlobals.Scratch;
    } else {
        delete window.Scratch;
    }
    
    if (originalGlobals.module !== undefined) {
        window.module = originalGlobals.module;
    } else {
        delete window.module;
    }
    
    if (originalGlobals.exports !== undefined) {
        window.exports = originalGlobals.exports;
    } else {
        delete window.exports;
    }
    
    if (originalGlobals.ScratchExtensions !== undefined) {
        window.ScratchExtensions = originalGlobals.ScratchExtensions;
    } else {
        delete window.ScratchExtensions;
    }
    
    if (originalGlobals.ReduxStore !== undefined) {
        window.ReduxStore = originalGlobals.ReduxStore;
    } else {
        delete window.ReduxStore;
    }
}

/**
 * 将 getInfo() 结果转换为 .ab 格式
 */
function convertToABFormat(info, extensionObject, originalCode) {
    // 安全获取属性，处理代理对象
    const safeInfo = {
        name: String(info.name || info.id || 'Untitled Extension'),
        id: String(info.id || 'unknown'),
        description: String(info.docsURI || ''),
        color1: info.color1 ? String(info.color1) : '#0FBD8C',
        color2: info.color2 ? String(info.color2) : '#0DA57A',
        color3: info.color3 ? String(info.color3) : '#0B8E69'
    };

    const comments = {
        name: safeInfo.name,
        id: safeInfo.id,
        description: safeInfo.description,
        color: [safeInfo.color1, safeInfo.color2, safeInfo.color3],
        author: '',
        license: 'MPL-2.0',
        translate: false
    };

    // 获取所有 opcode - 安全处理 blocks
    const methodNames = [];
    const blocksArray = info.blocks;
    if (blocksArray && typeof blocksArray[Symbol.iterator] === 'function') {
        try {
            for (const block of blocksArray) {
                if (block && typeof block === 'object' && block.opcode) {
                    methodNames.push(String(block.opcode));
                }
            }
        } catch (e) {
            console.warn('遍历 blocks 时出错:', e);
        }
    }

    // 提取方法实现
    const methodImplementations = extractMethodsFromObject(extensionObject, methodNames);

    // blocks 转换 - 安全处理
    const blocks = {};
    if (blocksArray && typeof blocksArray[Symbol.iterator] === 'function') {
        try {
            for (const block of blocksArray) {
                if (block && typeof block === 'object' && block.opcode) {
                    const opcode = String(block.opcode);
                    blocks[opcode] = convertBlock(block, safeInfo, methodImplementations[opcode]);
                }
            }
        } catch (e) {
            console.warn('转换 blocks 时出错:', e);
        }
    }

    // publicJS - 只提取有用的外部代码
    const publicJS = extractUsefulOuterCode(originalCode);

    // translate - 提取翻译
    const translate = extractTranslations(info, originalCode);

    return { comments, blocks, publicJS, translate };
}

/**
 * 从运行时对象提取方法
 */
function extractMethodsFromObject(extensionObject, methodNames) {
    const methods = {};
    if (!extensionObject) return methods;
    
    console.log('提取方法，扩展对象:', extensionObject);
    console.log('方法名列表:', methodNames);
    
    for (const methodName of methodNames) {
        let fn = extensionObject[methodName];
        let str = null;
        
        if (fn && typeof fn === 'function') {
            str = fn.toString();
            console.log(`方法 ${methodName} 的 toString:`, str);
        }
        
        if (!str) {
            const proto = Object.getPrototypeOf(extensionObject);
            if (proto && proto[methodName] && typeof proto[methodName] === 'function') {
                str = proto[methodName].toString();
                console.log(`从原型提取方法 ${methodName}:`, str);
            }
        }
        
        if (str && !str.includes('[native code]')) {
            const body = extractBodyFromFunctionString(str);
            if (body) {
                methods[methodName] = body;
                console.log(`成功提取方法 ${methodName} 的主体`);
            }
        } else {
            console.log(`方法 ${methodName} 提取失败`);
        }
    }
    
    console.log('提取的方法结果:', methods);
    return methods;
}

function extractBodyFromFunctionString(fnStr) {
    // 匹配: methodName(args) { body }
    const match = fnStr.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{([\s\S]*)\}?$/);
    if (match && match[1]) {
        let body = match[1];
        if (body.endsWith('}')) body = body.slice(0, -1);
        return body.trim();
    }
    return null;
}

function convertBlock(block, extensionInfo, methodCode) {
    let type = 'stack';
    let blockConfig = { hasNextConnection: true };

    const typeStr = String(block.blockType || '').toUpperCase();
    switch (typeStr) {
        case 'COMMAND':
        case BlockType.COMMAND:
            type = 'stack';
            break;
        case 'HAT':
        case 'EVENT':
        case BlockType.HAT:
            type = 'hat';
            break;
        case 'REPORTER':
        case BlockType.REPORTER:
            type = 'round';
            blockConfig.hasNextConnection = false;
            break;
        case 'BOOLEAN':
        case BlockType.BOOLEAN:
            type = 'boolean';
            blockConfig.hasNextConnection = false;
            break;
        case 'CONDITIONAL':
        case BlockType.CONDITIONAL:
            type = 'cBlock';
            break;
        case 'LOOP':
        case BlockType.LOOP:
            type = 'cBlock';
            blockConfig.isLoop = true;
            break;
        default:
            type = 'stack';
    }

    const parts = parseBlockText(block.text, block.arguments);
    const colors = {
        primary: extensionInfo.color1 || '#4C97FF',
        secondary: extensionInfo.color2 || '#4280D7',
        tertiary: extensionInfo.color3 || '#3373CC'
    };

    const result = { type, parts, colors, code: methodCode || '' };
    if (!blockConfig.hasNextConnection || blockConfig.isLoop) {
        result.blockConfig = blockConfig;
    }

    return result;
}

function parseBlockText(text, arguments_) {
    if (!text) return [];
    if (Array.isArray(text)) {
        const result = [];
        for (const part of text) {
            if (typeof part === 'string') {
                result.push(...parseSingleText(part, arguments_));
            } else {
                result.push(part);
            }
        }
        return result;
    }
    if (typeof text !== 'string') return [];
    return parseSingleText(text, arguments_);
}

function parseSingleText(text, arguments_) {
    const parts = [];
    const argRegex = /\[([A-Z_][A-Z0-9_]*)\]/gi;
    let lastIndex = 0;
    let match;

    while ((match = argRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const argName = match[1];
        const argDef = arguments_ && arguments_[argName];
        parts.push({
            inputType: mapArgumentType(argDef?.type),
            value: argDef?.defaultValue ?? '',
            id: argName
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function mapArgumentType(scratchType) {
    if (!scratchType) return 'text';
    const typeStr = String(scratchType).toLowerCase();
    switch (typeStr) {
        case 'string': return 'text';
        case 'number':
        case 'angle': return 'number';
        case 'boolean': return 'boolean';
        default: return 'text';
    }
}

/**
 * 提取有用的外部代码（常量、辅助函数等）
 */
function extractUsefulOuterCode(code) {
    if (!code) return '';
    
    // 找到 IIFE 的开始和结束
    const iifeMatch = code.match(/\(function\s*\([^)]*\)\s*\{/);
    const iifeEndMatch = code.match(/\}\)\(Scratch\)/);
    
    if (!iifeMatch) {
        // 没有 IIFE，返回空
        return '';
    }
    
    const iifeStart = iifeMatch.index + iifeMatch[0].length;
    const iifeEnd = iifeEndMatch ? iifeEndMatch.index : code.length;
    
    const iifeContent = code.slice(iifeStart, iifeEnd);
    
    // 找到所有 class 定义
    const classPattern = /class\s+(\w+)\s*\{/g;
    const classMatches = [];
    let match;
    while ((match = classPattern.exec(iifeContent)) !== null) {
        classMatches.push(match.index);
    }
    
    if (classMatches.length === 0) {
        // 没有 class，整个内容返回
        return filterUsefulCode(iifeContent);
    }
    
    // 提取第一个 class 之前的代码
    const firstClassIndex = classMatches[0];
    const beforeClass = iifeContent.slice(0, firstClassIndex);
    
    // 只返回 class 之前的代码（常量、辅助函数等）
    return filterUsefulCode(beforeClass);
}

/**
 * 过滤有用的代码（去除无用部分）
 */
function filterUsefulCode(code) {
    return code.split('\n').filter(line => {
        const trimmed = line.trim();
        
        // 跳过空行
        if (!trimmed) return false;
        
        // 跳过注释行（以 // 开头的单行注释）
        if (trimmed.startsWith('//')) return false;
        
        // 跳过 use strict
        if (trimmed === "'use strict';" || trimmed === '"use strict";') return false;
        
        // 跳过注释块
        if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
        
        // 保留有效的 JavaScript 代码行
        return true;
    }).join('\n');
}

/**
 * 标准化语言 ID（zh-cn → zh-CN）
 */
function normalizeLanguageId(langId) {
    if (!langId || typeof langId !== 'string') return langId;
    
    const lower = langId.toLowerCase();
    
    // 常见语言 ID 映射
    const languageMap = {
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW',
        'zh-hk': 'zh-HK',
        'zh-sg': 'zh-SG',
        'en-us': 'en',
        'en-gb': 'en',
        'ja-jp': 'ja',
        'ko-kr': 'ko',
        'de-de': 'de',
        'fr-fr': 'fr',
        'es-es': 'es',
        'pt-br': 'pt-BR',
        'pt-pt': 'pt',
        'ru-ru': 'ru',
        'it-it': 'it',
        'nl-nl': 'nl',
        'pl-pl': 'pl',
        'tr-tr': 'tr',
        'id-id': 'id',
        'th-th': 'th',
        'vi-vn': 'vi',
    };
    
    if (languageMap[lower]) {
        return languageMap[lower];
    }
    
    // 标准化格式：xx-xx → xx-Xx
    const parts = lower.split('-');
    if (parts.length === 2) {
        return `${parts[0]}-${parts[1].toUpperCase()}`;
    }
    
    return lower;
}

/**
 * 提取翻译信息
 */
function extractTranslations(info, originalCode) {
    const translations = [];
    
    // 优先从原始代码中提取 Scratch.translate.setup 的翻译
    if (originalCode) {
        try {
            // 匹配 Scratch.translate.setup({...})
            const setupMatch = originalCode.match(/Scratch\.translate\.setup\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;?/);
            if (setupMatch && setupMatch[1]) {
                // 使用 Function 安全解析 JSON
                // eslint-disable-next-line no-new-func
                const translateObj = new Function('return ' + setupMatch[1])();
                if (translateObj && typeof translateObj === 'object') {
                    for (const [lang, messages] of Object.entries(translateObj)) {
                        if (messages && typeof messages === 'object') {
                            translations.push({
                                id: normalizeLanguageId(lang),
                                string: messages
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('提取 Scratch.translate.setup 失败:', e);
        }
    }
    
    // 如果没有从代码中提取到，尝试从 info.translation_map 提取
    if (translations.length === 0 && info.translation_map) {
        for (const [lang, messages] of Object.entries(info.translation_map)) {
            if (messages && typeof messages === 'object') {
                translations.push({
                    id: normalizeLanguageId(lang),
                    string: messages
                });
            }
        }
    }
    
    // 如果仍然没有，从 blocks 提取积木文本作为默认翻译
    if (translations.length === 0 && info.blocks) {
        const defaultStrings = {};
        try {
            const blocksArray = info.blocks;
            if (blocksArray && typeof blocksArray[Symbol.iterator] === 'function') {
                for (const block of blocksArray) {
                    if (block && typeof block === 'object' && block.text && block.opcode) {
                        let text = block.text;
                        if (Array.isArray(text)) {
                            text = text.filter(t => typeof t === 'string').join(' ');
                        }
                        if (typeof text === 'string') {
                            const cleanText = text.replace(/\[[A-Z_][A-Z0-9_]*\]/gi, '').trim();
                            if (cleanText) {
                                defaultStrings[`_${block.opcode}`] = cleanText;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('从 blocks 提取翻译失败:', e);
        }
        
        if (Object.keys(defaultStrings).length > 0) {
            translations.push({
                id: 'en',
                string: defaultStrings
            });
        }
    }
    
    return translations;
}