/**
 * Scratch Block SVG Renderer
 * 基于 scratch-blocks 的渲染逻辑
 */

/* eslint-disable no-unused-vars */

const SVG_NS = "http://www.w3.org/2000/svg";

// ============== 常量定义 (来自 scratch-blocks/core/block_render_svg_vertical.js) ==============
const GRID_UNIT = 4;
const SEP_SPACE_X = 2 * GRID_UNIT;           // 8
const SEP_SPACE_Y = 2 * GRID_UNIT;           // 8
const MIN_BLOCK_X = 16 * GRID_UNIT;          // 64
const MIN_BLOCK_Y = 12 * GRID_UNIT;          // 48
const NOTCH_WIDTH = 8 * GRID_UNIT;           // 32
const NOTCH_HEIGHT = 2 * GRID_UNIT;          // 8
const CORNER_RADIUS = 1 * GRID_UNIT;         // 4
const NOTCH_START_PADDING = 3 * GRID_UNIT;   // 12
const INPUT_SHAPE_HEIGHT = 8 * GRID_UNIT;    // 32
const FIELD_HEIGHT = 8 * GRID_UNIT;          // 32
const FIELD_WIDTH = 6 * GRID_UNIT;           // 24
const EDITABLE_FIELD_PADDING = 6;
const BOX_FIELD_PADDING = 2 * GRID_UNIT;     // 8
const DROPDOWN_ARROW_PADDING = 2 * GRID_UNIT; // 8
const MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT = 8 * GRID_UNIT;  // 32
const MIN_BLOCK_Y_REPORTER = 10 * GRID_UNIT; // 40
const DEFINE_HAT_CORNER_RADIUS = 5 * GRID_UNIT; // 20

// Output/input shape codes (match scratch-blocks)
const OUTPUT_SHAPE_HEXAGONAL = 1;
const OUTPUT_SHAPE_ROUND = 2;
const OUTPUT_SHAPE_SQUARE = 3;

// Reporter padding rules (from scratch-blocks SHAPE_IN_SHAPE_PADDING)
const SHAPE_IN_SHAPE_PADDING = {
  [OUTPUT_SHAPE_HEXAGONAL]: {
    0: 5 * GRID_UNIT, // field
    [OUTPUT_SHAPE_HEXAGONAL]: 2 * GRID_UNIT,
    [OUTPUT_SHAPE_ROUND]: 5 * GRID_UNIT,
    [OUTPUT_SHAPE_SQUARE]: 5 * GRID_UNIT,
  },
  [OUTPUT_SHAPE_ROUND]: {
    0: 3 * GRID_UNIT, // field
    [OUTPUT_SHAPE_HEXAGONAL]: 3 * GRID_UNIT,
    [OUTPUT_SHAPE_ROUND]: 1 * GRID_UNIT,
    [OUTPUT_SHAPE_SQUARE]: 2 * GRID_UNIT,
  },
  [OUTPUT_SHAPE_SQUARE]: {
    0: 2 * GRID_UNIT, // field
    [OUTPUT_SHAPE_HEXAGONAL]: 2 * GRID_UNIT,
    [OUTPUT_SHAPE_ROUND]: 2 * GRID_UNIT,
    [OUTPUT_SHAPE_SQUARE]: 2 * GRID_UNIT,
  },
};


// C型积木相关常量
const MIN_STATEMENT_INPUT_HEIGHT = 6 * GRID_UNIT;  // 24
const STATEMENT_INPUT_EDGE_WIDTH = 4 * GRID_UNIT;  // 16
const STATEMENT_INPUT_INNER_SPACE = 2 * GRID_UNIT; // 8
const MIN_BLOCK_X_WITH_STATEMENT = 40 * GRID_UNIT; // 160
const EXTRA_STATEMENT_ROW_Y = 8 * GRID_UNIT;       // 32
const INPUT_AND_FIELD_MIN_X = 12 * GRID_UNIT;      // 48 - 确保输入框不与凹槽重叠

// ============== 形状路径常量 (来自 scratch-blocks) ==============

// 凹槽路径 (从左到右)
const NOTCH_PATH_LEFT = (
  'c 2,0 3,1 4,2 ' +
  'l 4,4 ' +
  'c 1,1 2,2 4,2 ' +
  'h 12 ' +
  'c 2,0 3,-1 4,-2 ' +
  'l 4,-4 ' +
  'c 1,-1 2,-2 4,-2'
);

// 凹槽路径 (从右到左)
const NOTCH_PATH_RIGHT = (
  'c -2,0 -3,1 -4,2 ' +
  'l -4,4 ' +
  'c -1,1 -2,2 -4,2 ' +
  'h -12 ' +
  'c -2,0 -3,-1 -4,-2 ' +
  'l -4,-4 ' +
  'c -1,-1 -2,-2 -4,-2'
);

// 帽子块路径
// 帽子顶部的贝塞尔曲线路径。水平跨度 96 单位。
const START_HAT_PATH = 'c 25,-22 71,-22 96,0';
// 至少需要的最小宽度，保证曲线不会超出块宽
const HAT_MIN_WIDTH = 108 + CORNER_RADIUS;  // 曲线末端再加上一个角半径
const ROUND_MIN_WIDTH = 32 + CORNER_RADIUS;  // 曲线末端再加上一个角半径

// 角落路径
const TOP_LEFT_CORNER_START = `m 0,${CORNER_RADIUS}`;
const TOP_LEFT_CORNER = `A ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},0`;
const TOP_RIGHT_CORNER = `a ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 ${CORNER_RADIUS},${CORNER_RADIUS}`;
const BOTTOM_RIGHT_CORNER = ` a ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},${CORNER_RADIUS}`;
const BOTTOM_LEFT_CORNER = `a ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,1 -${CORNER_RADIUS},-${CORNER_RADIUS}`;

// Define Hat 角落
const TOP_LEFT_CORNER_DEFINE_HAT = `a ${DEFINE_HAT_CORNER_RADIUS},${DEFINE_HAT_CORNER_RADIUS} 0 0,1 ${DEFINE_HAT_CORNER_RADIUS},-${DEFINE_HAT_CORNER_RADIUS}`;
const TOP_RIGHT_CORNER_DEFINE_HAT = `a ${DEFINE_HAT_CORNER_RADIUS},${DEFINE_HAT_CORNER_RADIUS} 0 0,1 ${DEFINE_HAT_CORNER_RADIUS},${DEFINE_HAT_CORNER_RADIUS}`;

// C型积木内角路径
const INNER_TOP_LEFT_CORNER = `a ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,0 -${CORNER_RADIUS},${CORNER_RADIUS}`;
const INNER_BOTTOM_LEFT_CORNER = `a ${CORNER_RADIUS},${CORNER_RADIUS} 0 0,0 ${CORNER_RADIUS},${CORNER_RADIUS}`;

// 空输入框形状 (固定宽度)
const INPUT_SHAPE_HEXAGONAL =
  `M ${4 * GRID_UNIT},0 h ${4 * GRID_UNIT} l ${4 * GRID_UNIT},${4 * GRID_UNIT} l -${4 * GRID_UNIT},${4 * GRID_UNIT} h -${4 * GRID_UNIT} l -${4 * GRID_UNIT},-${4 * GRID_UNIT} l ${4 * GRID_UNIT},-${4 * GRID_UNIT} z`;

const INPUT_SHAPE_ROUND =
  `M ${4 * GRID_UNIT},0 h ${4 * GRID_UNIT} a ${4 * GRID_UNIT} ${4 * GRID_UNIT} 0 0 1 0 ${8 * GRID_UNIT} h -${4 * GRID_UNIT} a ${4 * GRID_UNIT} ${4 * GRID_UNIT} 0 0 1 0 -${8 * GRID_UNIT} z`;

const INPUT_SHAPE_SQUARE =
  TOP_LEFT_CORNER_START +
  TOP_LEFT_CORNER +
  ` h ${12 * GRID_UNIT - 2 * CORNER_RADIUS}` +
  TOP_RIGHT_CORNER +
  ` v ${8 * GRID_UNIT - 2 * CORNER_RADIUS}` +
  BOTTOM_RIGHT_CORNER +
  ` h -${12 * GRID_UNIT - 2 * CORNER_RADIUS}` +
  BOTTOM_LEFT_CORNER +
  ' z';

// 输入框宽度
const INPUT_SHAPE_HEXAGONAL_WIDTH = 16 * GRID_UNIT;  // 64
const INPUT_SHAPE_ROUND_WIDTH = 12 * GRID_UNIT;       // 48
const INPUT_SHAPE_SQUARE_WIDTH = 10 * GRID_UNIT;      // 40

// ============== 文本样式 ==============
const TEXT_STYLE = {
  fontSize: 12,
  fontSizeUnit: 'pt',
  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  fontWeight: 500,
};

// ============== 下拉箭头 SVG ==============
const DROPDOWN_ARROW_WIDTH = 12;
const DROPDOWN_ARROW_HEIGHT = 8;
const DROPDOWN_ARROW_PATH = 'M 6.36,7.79 a 1.43,1.43,0,0,1-1-.42 L 1.42,3.45 a 1.44,1.44,0,0,1,0-2 c 0.56,-0.56,9.31,-0.56,9.87,0 a 1.44,1.44,0,0,1,0,2 L 7.37,7.37 A 1.43,1.43,0,0,1,6.36,7.79 Z';

const DROPDOWN_ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12.71" height="8.79" viewBox="0 0 12.71 8.79"><g opacity="0.1"><path d="M12.71,2.44A2.41,2.41,0,0,1,12,4.16L8.08,8.08a2.45,2.45,0,0,1-3.45,0L0.72,4.16A2.42,2.42,0,0,1,0,2.44,2.48,2.48,0,0,1,.71.71C1,0.47,1.43,0,6.36,0S11.75,0.46,12,.71A2.44,2.44,0,0,1,12.71,2.44Z" fill="#231f20"/></g><path d="M6.36,7.79a1.43,1.43,0,0,1-1-.42L1.42,3.45a1.44,1.44,0,0,1,0-2c0.56-.56,9.31-0.56,9.87,0a1.44,1.44,0,0,1,0,2L7.37,7.37A1.43,1.43,0,0,1,6.36,7.79Z" fill="#fff"/></svg>`;

const DROPDOWN_ARROW_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12.71" height="8.79" viewBox="0 0 12.71 8.79"><g opacity="0.1"><path d="M12.71,2.44A2.41,2.41,0,0,1,12,4.16L8.08,8.08a2.45,2.45,0,0,1-3.45,0L0.72,4.16A2.42,2.42,0,0,1,0,2.44,2.48,2.48,0,0,1,.71.71C1,0.47,1.43,0,6.36,0S11.75,0.46,12,.71A2.44,2.44,0,0,1,12.71,2.44Z" fill="#231f20"/></g><path d="M6.36,7.79a1.43,1.43,0,0,1-1-.42L1.42,3.45a1.44,1.44,0,0,1,0-2c0.56-.56,9.31-0.56,9.87,0a1.44,1.44,0,0,1,0,2L7.37,7.37A1.43,1.43,0,0,1,6.36,7.79Z" fill="#575E75"/></svg>`;


// ============== 循环图标 SVG ==============
// 参考 scratch-blocks 的 repeat.svg
const LOOP_ICON_SIZE = 24;
const LOOP_ARROW_SVG = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 21.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="repeat" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
<style type="text/css">
	.st0{fill:#FFFFFF00;}
	.st1{fill:#FFFFFF;}
</style>
<title>repeat</title>
<path class="st0" d="M23.3,11c-0.3,0.6-0.9,1-1.5,1h-1.6c-0.1,1.3-0.5,2.5-1.1,3.6c-0.9,1.7-2.3,3.2-4.1,4.1
	c-1.7,0.9-3.6,1.2-5.5,0.9c-1.8-0.3-3.5-1.1-4.9-2.3c-0.7-0.7-0.7-1.9,0-2.6c0.6-0.6,1.6-0.7,2.3-0.2H7c0.9,0.6,1.9,0.9,2.9,0.9
	s1.9-0.3,2.7-0.9c1.1-0.8,1.8-2.1,1.8-3.5h-1.5c-0.9,0-1.7-0.7-1.7-1.7c0-0.4,0.2-0.9,0.5-1.2l4.4-4.4c0.7-0.6,1.7-0.6,2.4,0L23,9.2
	C23.5,9.7,23.6,10.4,23.3,11z"/>
<path class="st1" d="M21.8,11h-2.6c0,1.5-0.3,2.9-1,4.2c-0.8,1.6-2.1,2.8-3.7,3.6c-1.5,0.8-3.3,1.1-4.9,0.8c-1.6-0.2-3.2-1-4.4-2.1
	c-0.4-0.3-0.4-0.9-0.1-1.2c0.3-0.4,0.9-0.4,1.2-0.1l0,0c1,0.7,2.2,1.1,3.4,1.1s2.3-0.3,3.3-1c0.9-0.6,1.6-1.5,2-2.6
	c0.3-0.9,0.4-1.8,0.2-2.8h-2.4c-0.4,0-0.7-0.3-0.7-0.7c0-0.2,0.1-0.3,0.2-0.4l4.4-4.4c0.3-0.3,0.7-0.3,0.9,0L22,9.8
	c0.3,0.3,0.4,0.6,0.3,0.9S22,11,21.8,11z"/>
</svg>
`;

// ============== 图片字段常量 ==============
// 参考 scratch-blocks/core/field_image.js
const DEFAULT_IMAGE_WIDTH = 40;
const DEFAULT_IMAGE_HEIGHT = 40;
// ============== 文本宽度测量 ==============
function measureTextWidth(text) {
  if (typeof document === "undefined") {
    return text.length * 16 * 0.6;
  }

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";

  const textEl = document.createElementNS(SVG_NS, "text");
  textEl.setAttribute("font-family", TEXT_STYLE.fontFamily);
  textEl.setAttribute("font-size", `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`);
  textEl.setAttribute("font-weight", TEXT_STYLE.fontWeight);
  textEl.textContent = text;

  svg.appendChild(textEl);
  document.body.appendChild(svg);

  const width = textEl.getBoundingClientRect().width;
  document.body.removeChild(svg);

  return width;
}

const textWidthCache = new Map();
function getTextWidth(text) {
  if (text.length === 0) return 0;
  let width = textWidthCache.get(text);
  if (width !== undefined) return width;
  width = measureTextWidth(text);
  textWidthCache.set(text, width);
  return width;
}

// ============== SVG工具 ==============
function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

// ============== 积木类型枚举 ==============
const BlockType = {
  STACK: "stack",           // 普通堆叠块
  HAT: "hat",               // 帽子块（事件开始）
  EVENT: "event",           // 事件块（帽子块别名）
  END: "end",               // 终止块（兼容旧代码）
  ROUND: "round",           // 圆形报告块
  BOOLEAN: "boolean",       // 布尔块
  DEFINE_HAT: "defineHat",  // 定义帽子块
  C_BLOCK: "cBlock",        // C型积木
  C_BLOCK_END: "cBlockEnd", // C型积木的结束块（无底部凸起）
};

const InputType = {
  TEXT: "text",
  NUMBER: "number",
  TEXT_NUMBER: "textNumber", // 兼容历史数据
  BOOLEAN: "boolean",
  ANGLE: "angle",
  COLOR: "color",
  MATRIX: "matrix",
  NOTE: "note",
  DROPDOWN: "dropdown",           // 可填入积木的下拉框
  DROPDOWN_READONLY: "dropdownReadOnly",  // 不可填入积木的下拉框
  VARIABLE: "variable",
  IMAGE: "image",                 // 图片字段
  COSTUME: "costume",
  SOUND: "sound",
};

// 分支分隔标记 - 用于 parts 数组中标记内容分配到不同分支
const NEXT_BRANCH_MARKER = "_NextBrach_";

// ============== 积木配置对象 ==============
// ���考 scratch-blocks 的 block_render_svg_vertical.js 中的 renderClassify_ 函数
// 积木形状由以下几个因素决定：
// - hasNextConnection: 下方是否有凸起（可以连接其他块）
// - branches: 语句输入数量（决定是否是 C_BLOCK 及分支数量）
// - isLoop: 是否是循环（显示循环图标）

/**
 * 默认积木配置
 */
const DefaultBlockConfig = {
  // 连接配置
  hasNextConnection: true,      // 下方凸起（false = END 块）

  // C型积木配置
  branches: 0,                  // 分支数量 (0 = 非C型积木)
  branchHeight: 48,             // 每个分支高度
  branchLabels: [],             // 分支标签（如 ["else"]）

  // 循环标志
  isLoop: false,                // 显示循环图标

  // 输出形状 (reporter)
  outputShape: null,            // 'round' | 'hexagonal' | null

  // 是否为 shadow（用于单字段 reporter 高度）
  isShadow: false,

  // Scratch extension block height rules
  isScratchExtension: true,

  // 是否是异步积木
  isAsync: false,

  // 是否在 worker 环境下阻塞所有线程
  blockAllThreads: false,

  // 积木显示目标过滤；undefined/空表示同时显示到角色和舞台
  filter: [],

  // 积木图标 URI (data URI 或 URL)
  blockIconURI: null            // 显示在积木左侧边缘的图标
};

/**
 * 根据 BlockType 获取默认配置
 * @param {string} blockType - 积木类型
 * @returns {Object} 配置对象
 */
function getConfigForBlockType(blockType) {
  const config = { ...DefaultBlockConfig };

  switch (blockType) {
    case BlockType.HAT:
    case BlockType.EVENT:
      config.hasNextConnection = true;
      break;

    case BlockType.END:
      config.hasNextConnection = false;
      break;

    case BlockType.ROUND:
      config.hasNextConnection = false;
      config.outputShape = 'round';
      break;

    case BlockType.BOOLEAN:
      config.hasNextConnection = false;
      config.outputShape = 'hexagonal';
      break;

    case BlockType.DEFINE_HAT:
      config.hasNextConnection = true;
      break;

    case BlockType.C_BLOCK:
      config.hasNextConnection = true;
      config.branches = 1;
      break;

    case BlockType.STACK:
    default:
      // 默认 STACK 配置
      break;
  }

  return config;
}

/**
 * 合并积木配置
 * @param {Object} blockData - 积木数据，可能包含 blockConfig 或旧式 type
 * @returns {Object} 完整的配置对象
 */
function resolveBlockConfig(blockData) {
  // 如果有显式的 blockConfig，使用它
    if (blockData.blockConfig) {
      const baseConfig = blockData.type
        ? getConfigForBlockType(blockData.type)
        : { ...DefaultBlockConfig };
      return { ...baseConfig, ...blockData.blockConfig };
    }

    // 否则根据 type 获取配置
    if (blockData.type) {
      return getConfigForBlockType(blockData.type);
    }

    // 默认 STACK
    return { ...DefaultBlockConfig };
}

function normalizeInputType(inputType) {
  if (!inputType) {
    return InputType.TEXT;
  }
  if (inputType === InputType.TEXT_NUMBER) {
    return InputType.NUMBER;
  }
  if (inputType === InputType.ANGLE || inputType === InputType.NOTE) {
    return InputType.NUMBER;
  }
  if (inputType === InputType.COLOR || inputType === InputType.MATRIX) {
    return InputType.TEXT;
  }
  if (inputType === InputType.COSTUME || inputType === InputType.SOUND) {
    return InputType.DROPDOWN_READONLY;
  }
  return inputType;
}

function isDropdownLikeInput(inputType) {
  const normalizedInputType = normalizeInputType(inputType);
  return (
    normalizedInputType === InputType.DROPDOWN ||
    normalizedInputType === InputType.DROPDOWN_READONLY ||
    normalizedInputType === InputType.VARIABLE
  );
}

function getColorInputBgColor(value, fallback = "#FFFFFF") {
  if (typeof value !== "string") return fallback;
  const color = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
    return color;
  }
  return fallback;
}

function getContrastingTextColor(color) {
  const normalized = color.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map(char => char + char).join("")
    : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return "#575E75";
  }
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
  return luminance > 186 ? "#575E75" : "#FFFFFF";
}

// ============== 默认颜色 ==============
const DefaultColors = {
  primary: "#4C97FF",
  secondary: "#4280D7",
  tertiary: "#3373CC",
};

// ============== 背景路径生成函数 ==============

/**
 * 生成 Stack 积木的背景路径
 * @param {number} width - 宽度
 * @param {boolean} hasNextConnection - 是否有下方凸起（false = END 块）
 */
function generateStackPath(width, hasNextConnection = true) {
  const steps = [];

  // 起点 - 左上角（考虑圆角）
  steps.push(TOP_LEFT_CORNER_START);
  steps.push(TOP_LEFT_CORNER);

  // 顶部边 + 凹槽
  steps.push('H', NOTCH_START_PADDING);
  steps.push(NOTCH_PATH_LEFT);

  // 右上角
  steps.push('H', width - CORNER_RADIUS);
  steps.push(TOP_RIGHT_CORNER);

  // 右边
  steps.push('v', MIN_BLOCK_Y - 2 * CORNER_RADIUS);

  // 右下角
  steps.push(BOTTOM_RIGHT_CORNER);

  // 底部边 - 根据是否有下方凸起决定
  if (hasNextConnection) {
    // 有底部凸起
    const notchStart = NOTCH_WIDTH + NOTCH_START_PADDING + CORNER_RADIUS;
    steps.push('H', notchStart);
    steps.push(NOTCH_PATH_RIGHT);
  }

  // 移动到左下角圆角位置并闭合
  steps.push('H', CORNER_RADIUS);
  steps.push(BOTTOM_LEFT_CORNER);

  // 闭合
  steps.push('z');

  return steps.join(' ');
}

/**
 * 生成 Hat 积木的背景路径
 */
function generateHatPath(width) {
  const steps = [];

  // 起点 - 左上角（无圆角，有帽子）
  steps.push('m 0,0');
  steps.push(START_HAT_PATH);

  // 右上角
  steps.push('H', width - CORNER_RADIUS);
  steps.push(TOP_RIGHT_CORNER);

  // 右边
  steps.push('v', MIN_BLOCK_Y - 2 * CORNER_RADIUS);

  // 右下角
  steps.push(BOTTOM_RIGHT_CORNER);

  // 底部边 + 凸起
  const notchStart = NOTCH_WIDTH + NOTCH_START_PADDING + CORNER_RADIUS;
  steps.push('H', notchStart);
  steps.push(NOTCH_PATH_RIGHT);

  // 左下角
  steps.push('H', CORNER_RADIUS);
  steps.push(BOTTOM_LEFT_CORNER);

  steps.push('z');

  return steps.join(' ');
}

/**
 * 生成 End 积木的背景路径（无底部凸起）
 */
function generateEndPath(width) {
  const steps = [];

  // 起点 - 左上角（考虑圆角）
  steps.push(TOP_LEFT_CORNER_START);
  steps.push(TOP_LEFT_CORNER);

  // 顶部边 + 凹槽
  steps.push('H', NOTCH_START_PADDING);
  steps.push(NOTCH_PATH_LEFT);

  // 右上角
  steps.push('H', width - CORNER_RADIUS);
  steps.push(TOP_RIGHT_CORNER);

  // 右边
  steps.push('v', MIN_BLOCK_Y - 2 * CORNER_RADIUS);

  // 右下角（无凸起，直接圆角）
  steps.push(BOTTOM_RIGHT_CORNER);

  // 底部边（无凸起）
  steps.push('H', CORNER_RADIUS);
  steps.push(BOTTOM_LEFT_CORNER);

  steps.push('z');

  return steps.join(' ');
}

/**
 * 生成 Round 积木的背景路径
 */
function generateRoundPath(width, height = MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT) {
  const radius = height / 2;
  return `m ${radius},0 h ${width - 2 * radius} a ${radius} ${radius} 0 0 1 0 ${height} H ${radius} a ${radius} ${radius} 0 0 1 0 -${height} z`;
}

/**
 * 生成 Boolean 积木的背景路径
 */
function generateBooleanPath(width, height = MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT) {
  const pointWidth = height / 2;
  return `m ${pointWidth},0 h ${width} l ${pointWidth} ${pointWidth} l -${pointWidth} ${pointWidth} H ${pointWidth} l -${pointWidth} -${pointWidth} l ${pointWidth} -${pointWidth} z`;
}

/**
 * 生成 Define Hat 积木的背景路径
 */
function generateDefineHatPath(width) {
  const steps = [];

  // 起点 - 左上角（大圆角）
  steps.push('m 0,0');
  steps.push(TOP_LEFT_CORNER_DEFINE_HAT);

  // 右上角
  steps.push('H', width - DEFINE_HAT_CORNER_RADIUS);
  steps.push(TOP_RIGHT_CORNER_DEFINE_HAT);

  // 右边
  steps.push('v', MIN_BLOCK_Y);

  // 右下角
  steps.push(BOTTOM_RIGHT_CORNER);

  // 底部边 + 凸起
  const notchStart = NOTCH_WIDTH + NOTCH_START_PADDING + CORNER_RADIUS;
  steps.push('H', notchStart);
  steps.push(NOTCH_PATH_RIGHT);

  // 左下角
  steps.push('H', CORNER_RADIUS);
  steps.push(BOTTOM_LEFT_CORNER);

  steps.push('z');

  return steps.join(' ');
}

/**
 * 生成 C型积木的背景路径
 * @param {number} width - 积木宽度
 * @param {number} branchCount - 分支数量
 * @param {number} branchHeight - 每个分支的高度
 * @param {boolean} hasExternalNotchAtBottom - 是否有底部外部凸起
 * @param {Array<string>} branchLabels - 分支标签（可选）
 * @param {Array<number>} statementRowHeights - 每个分隔行的高度
 */
function generateCBlockPath(width, branchCount, branchHeight, hasExternalNotchAtBottom = true, branchLabels = [], statementRowHeights = []) {
  const steps = [];

  // scratch-blocks: statementEdge = STATEMENT_INPUT_EDGE_WIDTH + fieldStatementWidth
  const statementEdge = STATEMENT_INPUT_EDGE_WIDTH;  // 16

  // cursorX 是凹槽开始的位置
  const cursorX = statementEdge + NOTCH_WIDTH;  // 16 + 32 = 48

  // 起点 - 左上角（考虑圆角）
  steps.push(TOP_LEFT_CORNER_START);
  steps.push(TOP_LEFT_CORNER);

  // 顶部边 + 凹槽
  steps.push('H', NOTCH_START_PADDING);
  steps.push(NOTCH_PATH_LEFT);

  // 右上角
  steps.push('H', width - CORNER_RADIUS);
  steps.push(TOP_RIGHT_CORNER);

  // 右边到第一个分支开口
  steps.push('v', MIN_BLOCK_Y - 2 * CORNER_RADIUS);
  steps.push(BOTTOM_RIGHT_CORNER);

  // 绘制每个分支
  for (let i = 0; i < branchCount; i++) {
    const isLastBranch = (i === branchCount - 1);
    const rowHeight = statementRowHeights[i] || EXTRA_STATEMENT_ROW_Y;

    // 分支开口底部（右侧到内角）
    steps.push('H', cursorX + STATEMENT_INPUT_INNER_SPACE + 2 * CORNER_RADIUS);
    steps.push(NOTCH_PATH_RIGHT);
    steps.push('h', -STATEMENT_INPUT_INNER_SPACE);
    steps.push(INNER_TOP_LEFT_CORNER);

    // 分支内部垂直边
    steps.push('v', branchHeight - 2 * CORNER_RADIUS);

    // 分支开口顶部
    steps.push(INNER_BOTTOM_LEFT_CORNER);

    // 所有分支底部都有内部凹槽（用于连接分支内的块）
    steps.push('h', STATEMENT_INPUT_INNER_SPACE);
    steps.push(NOTCH_PATH_LEFT);

    if (isLastBranch) {
      // 最后一个分支 - 回到右边绘制底部行
      steps.push('H', width - CORNER_RADIUS);
      steps.push(TOP_RIGHT_CORNER);

      // 底部行高度（动态）
      steps.push('v', rowHeight - 2 * CORNER_RADIUS);
      steps.push(BOTTOM_RIGHT_CORNER);

      // 底部边
      if (hasExternalNotchAtBottom) {
        // C_BLOCK: 有底部外部凸起
        const notchStart = NOTCH_WIDTH + NOTCH_START_PADDING + CORNER_RADIUS;
        steps.push('H', notchStart);
        steps.push(NOTCH_PATH_RIGHT);
      } else {
        // C_BLOCK_END: 无底部外部凸起
        steps.push('H', CORNER_RADIUS);
      }
    } else {
      // 非最后一个分支，绘制分隔行
      steps.push('H', width - CORNER_RADIUS);
      steps.push(TOP_RIGHT_CORNER);

      // 分隔行高度（动态）
      steps.push('v', rowHeight - 2 * CORNER_RADIUS);
      steps.push(BOTTOM_RIGHT_CORNER);
    }
  }

  // 左下角
  steps.push('H', CORNER_RADIUS);
  steps.push(BOTTOM_LEFT_CORNER);

  steps.push('z');

  return steps.join(' ');
}

// ============== 输入框路径生成 ==============

/**
 * 生成可变宽度的输入框路径
 */
function generateInputPath(inputType, width) {
  const normalizedInputType = normalizeInputType(inputType);
  const h = INPUT_SHAPE_HEIGHT;  // 32
  const r = h / 2;  // 16 for round (大圆角，用于可填入积木的输入框)
  const smallR = CORNER_RADIUS;  // 4 (小圆角，用于不可填入积木的下拉框)

  switch (normalizedInputType) {
    case InputType.BOOLEAN: {
      const pointWidth = h / 2;
      return `m ${pointWidth},0 h ${width - 2 * pointWidth} l ${pointWidth} ${pointWidth} l -${pointWidth} ${pointWidth} H ${pointWidth} l -${pointWidth} -${pointWidth} l ${pointWidth} -${pointWidth} z`;
    }

    case InputType.DROPDOWN:
      // 可填入积木的下拉框 - 大圆角，背景色为secondary
      return `m ${r},0 h ${width - 2 * r} a ${r} ${r} 0 0 1 0 ${h} H ${r} a ${r} ${r} 0 0 1 0 -${h} z`;

    case InputType.DROPDOWN_READONLY:
      // 不可填入积木的下拉框 - 小圆角，背景色为primary
      return `m 0,${smallR} a ${smallR} ${smallR} 0 0 1 ${smallR},-${smallR} h ${width - 2 * smallR} a ${smallR} ${smallR} 0 0 1 ${smallR} ${smallR} v ${h - 2 * smallR} a ${smallR} ${smallR} 0 0 1 -${smallR} ${smallR} H ${smallR} a ${smallR} ${smallR} 0 0 1 -${smallR} -${smallR} z`;

    case InputType.VARIABLE:
      // 变量框 - 大圆角，背景色为secondary
      return `m ${r},0 h ${width - 2 * r} a ${r} ${r} 0 0 1 0 ${h} H ${r} a ${r} ${r} 0 0 1 0 -${h} z`;

    case InputType.TEXT:
      // 文本输入框 - 小圆角矩形
      return `m 0,${smallR} a ${smallR} ${smallR} 0 0 1 ${smallR},-${smallR} h ${width - 2 * smallR} a ${smallR} ${smallR} 0 0 1 ${smallR} ${smallR} v ${h - 2 * smallR} a ${smallR} ${smallR} 0 0 1 -${smallR} ${smallR} H ${smallR} a ${smallR} ${smallR} 0 0 1 -${smallR} -${smallR} z`;
    case InputType.NUMBER:
    default:
      // 数字输入框 - 大圆角
      return `m ${r},0 h ${width - 2 * r} a ${r} ${r} 0 0 1 0 ${h} H ${r} a ${r} ${r} 0 0 1 0 -${h} z`;
  }
}

/**
 * 获取输入框最小宽度
 */
function getInputMinWidth(inputType) {
  const normalizedInputType = normalizeInputType(inputType);

  switch (normalizedInputType) {
    case InputType.BOOLEAN:
      return INPUT_SHAPE_HEXAGONAL_WIDTH;
    case InputType.DROPDOWN:
    case InputType.DROPDOWN_READONLY:
    case InputType.VARIABLE:
      return INPUT_SHAPE_SQUARE_WIDTH;
    case InputType.TEXT:
      return INPUT_SHAPE_SQUARE_WIDTH;
    case InputType.IMAGE:
      return DEFAULT_IMAGE_WIDTH;
    case InputType.NUMBER:
    default:
      return INPUT_SHAPE_ROUND_WIDTH;
  }
}

/**
 * 创建图片字段 SVG 元素
 * 参考 scratch-blocks/core/field_image.js
 * @param {Object} imageData - 图片数据 { dataURI, width, height, alt, flipRTL }
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @returns {SVGElement} SVG image 元素
 */
function createImageField(imageData, x, y) {
  const width = imageData.width || DEFAULT_IMAGE_WIDTH;
  const height = imageData.height || DEFAULT_IMAGE_HEIGHT;
  const dataURI = imageData.dataURI || imageData.value || '';
  const alt = imageData.alt || '';
  
  const image = createSvgElement("image", {
    x: x,
    y: y - height / 2,  // 垂直居中
    width: width,
    height: height,
    alt: alt,
  });
  
  if (dataURI) {
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataURI);
  }
  
  return image;
}

/**
 * 解析图片数据
 * @param {any} value - 可能是图片数据
 * @returns {Object|null} 标准化的图片数据
 */
function parseImageData(value) {
  if (!value) return null;
  
  // 已经是标准格式
  if (typeof value === 'object' && (value.dataURI || value.value)) {
    return {
      dataURI: value.dataURI || value.value,
      width: value.width || DEFAULT_IMAGE_WIDTH,
      height: value.height || DEFAULT_IMAGE_HEIGHT,
      alt: value.alt || '',
      flipRTL: value.flipRTL || false,
    };
  }
  
  // 字符串格式（直接是 dataURI）
  if (typeof value === 'string' && value.startsWith('data:')) {
    return {
      dataURI: value,
      width: DEFAULT_IMAGE_WIDTH,
      height: DEFAULT_IMAGE_HEIGHT,
      alt: '',
      flipRTL: false,
    };
  }
  
  return null;
}

function getOutputShapeCode(blockType, outputShape) {
  if (outputShape === 'hexagonal' || blockType === BlockType.BOOLEAN) {
    return OUTPUT_SHAPE_HEXAGONAL;
  }
  if (outputShape === 'round' || blockType === BlockType.ROUND) {
    return OUTPUT_SHAPE_ROUND;
  }
  return null;
}

function getInnerShapeCodeForComponent(component) {
  if (!component) return 0;
  if (component.type === 'text') return 0;
  const inputType = normalizeInputType(component.inputType);
  switch (inputType) {
    case InputType.BOOLEAN:
      return OUTPUT_SHAPE_HEXAGONAL;
    case InputType.NUMBER:
      return OUTPUT_SHAPE_ROUND;
    case InputType.TEXT:
    case InputType.DROPDOWN:
    case InputType.DROPDOWN_READONLY:
    case InputType.VARIABLE:
    case InputType.IMAGE:
    default:
      return OUTPUT_SHAPE_SQUARE;
  }
}

/**
 * 获取输入框背景色
 * @param {string} inputType - 输入框类型
 * @param {string} primary - 主色
 * @param {string} secondary - 次色
 * @param {string} tertiary - 第三色
 * @returns {string} 背景色
 */
function getInputBgColor(inputType, primary, secondary, tertiary, value = null) {
  const normalizedInputType = normalizeInputType(inputType);

  if (inputType === InputType.COLOR) {
    return getColorInputBgColor(value);
  }

  switch (normalizedInputType) {
    case InputType.TEXT:
      return "#FFFFFF";
    case InputType.NUMBER:
      return "#FFFFFF";
    case InputType.DROPDOWN:
      return secondary;  // 可填入积木的下拉框使用secondary
    case InputType.DROPDOWN_READONLY:
      return primary
    case InputType.VARIABLE:
    case InputType.BOOLEAN:
    default:
      return secondary;
  }
}

/**
 * 获取输入框文字颜色
 * @param {string} inputType - 输入框类型
 * @returns {string} 文字颜色
 */
function getInputTextColor(inputType, value = null) {
  if (inputType === InputType.COLOR) {
    return getContrastingTextColor(getColorInputBgColor(value));
  }

  const normalizedInputType = normalizeInputType(inputType);

  switch (normalizedInputType) {
    case InputType.TEXT:
      return "#575E75";
    case InputType.NUMBER:
      return "#575E75";
    default:
      return "#FFFFFF";
  }
}

function normalizeInputValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function calculateInputWidth(inputType, value) {
  const normalizedInputType = normalizeInputType(inputType);
  
  // 图片类型使用固定宽度
  if (normalizedInputType === InputType.IMAGE) {
    const imageData = value;
    if (imageData && typeof imageData === 'object') {
      return imageData.width || DEFAULT_IMAGE_WIDTH;
    }
    return DEFAULT_IMAGE_WIDTH;
  }
  
  const textValue = normalizeInputValue(value);
  const textWidth = getTextWidth(textValue);

  if (normalizedInputType === InputType.BOOLEAN) {
    return getInputMinWidth(normalizedInputType);
  }

  if (
    normalizedInputType === InputType.DROPDOWN ||
    normalizedInputType === InputType.DROPDOWN_READONLY ||
    normalizedInputType === InputType.VARIABLE
  ) {
    const arrowWidth = 12 + DROPDOWN_ARROW_PADDING;
    const width = textWidth + EDITABLE_FIELD_PADDING + arrowWidth + 2 * BOX_FIELD_PADDING;
    return Math.max(getInputMinWidth(normalizedInputType), width);
  }

  const width = textWidth + EDITABLE_FIELD_PADDING + 2 * BOX_FIELD_PADDING;
  return Math.max(getInputMinWidth(normalizedInputType), width);
}

function calculatePartsWidth(parts = []) {
  if (!parts || parts.length === 0) {
    return 0;
  }

  let width = 0;
  for (const part of parts) {
    if (typeof part === "string") {
      width += getTextWidth(part) + SEP_SPACE_X;
      continue;
    }

    if (part && typeof part === "object") {
      width += calculateInputWidth(part.inputType, part.value) + SEP_SPACE_X;
    }
  }

  return width > 0 ? width - SEP_SPACE_X : 0;
}

// ============== 主渲染函数 ==============

/**
 * 渲染积木 SVG
 * @param {Object} blockData - 积木数据
 * @param {Object} options - 渲染选项
 */
function renderBlock(blockData, options = {}) {
  // 解析积木配置
  const config = resolveBlockConfig(blockData);

  let {
    type = BlockType.STACK,
    parts = [],
    colors = DefaultColors,
    blockConfig = {},
  } = blockData;

  const { standalone = false } = options;
  const { primary, secondary, tertiary } = colors;

  // 合并配置 - blockConfig 优先级更高
  const finalConfig = { ...config, ...blockConfig };

  // 提取配置项
  const {
    hasNextConnection = true,
    branchHeight = MIN_BLOCK_Y,
    branchLabels = [],
    isLoop = false,
    outputShape = null,
    blockIconURI = null,
  } = finalConfig;

  // branches 需要是可变的（可能被自动分支检测逻辑更新）
  let branches = finalConfig.branches ?? 0;

  // 判断是否是 reporter 块（有输出形状）
  const isReporter = outputShape === 'round' || outputShape === 'hexagonal' ||
    type === BlockType.ROUND || type === BlockType.BOOLEAN;
  // reporter 块统一使用 32 的高度（MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT）
  const reporterHeight = isReporter ? MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT : null;

  // 旧式参数兼容
  const legacyBranchParts = blockData.branchParts || [];
  const legacyHasNotchAtBottom = blockData.hasNotchAtBottom !== undefined
    ? blockData.hasNotchAtBottom
    : hasNextConnection;

  // 处理 NEXT_BRANCH_MARKER 分隔符
  // 如果 parts 中包含 _NextBrach_，则自动分割内容到不同分支
  let topParts = parts;
  let autoBranchParts = [];
  let hasAutoBranchSplit = false;

  // 检测是否包含 NEXT_BRANCH_MARKER
  const markerIndices = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === NEXT_BRANCH_MARKER) {
      markerIndices.push(i);
    }
  }

  if (markerIndices.length > 0) {
    hasAutoBranchSplit = true;
    // 按 NEXT_BRANCH_MARKER 分割 parts
    const splitParts = [];
    let startIndex = 0;
    for (const markerIndex of markerIndices) {
      splitParts.push(parts.slice(startIndex, markerIndex));
      startIndex = markerIndex + 1;
    }
    // 添加最后一部分
    splitParts.push(parts.slice(startIndex));

    // 第一部分是顶部行内容
    topParts = splitParts[0];
    // 后续部分是各分支分隔行的内容
    autoBranchParts = splitParts.slice(1);

    // 自动计算分支数量
    // 分支数量 = 分隔标记数量 + 1（默认基础分支）
    // 或者等于 autoBranchParts.length + 1（每个分支分隔行对应一个分支）
    branches = Math.max(branches, autoBranchParts.length + 1);
  }

  // 创建容器
  const container = createSvgElement("g");
  container.classList.add("scratch-block");

  // 输入框索引用于高亮功能
  let inputIndex = 0;

  // 计算内容布局（使用 topParts 而非原始 parts）
  let cursorX = 0;
  const components = [];

  // 如果有 blockIconURI，在最前面添加图标组件
  if (blockIconURI) {
    const iconSize = 24; // 图标大小
    components.push({
      type: 'blockIcon',
      content: blockIconURI,
      width: iconSize,
      x: cursorX,
    });
    cursorX += iconSize + SEP_SPACE_X;
  }

  for (const part of topParts) {
    let comp;

    if (typeof part === "string") {
      // 文本组件
      const textWidth = getTextWidth(part);
      comp = {
        type: 'text',
        content: part,
        width: textWidth,
        x: cursorX,
      };
      cursorX += textWidth + SEP_SPACE_X;
    } else {
      // 输入框组件
      const inputType = normalizeInputType(part.inputType);
      // IMAGE 类型保持原始值对象，不进行 normalize
      const value = inputType === InputType.IMAGE ? part.value : normalizeInputValue(part.value);
      const inputWidth = calculateInputWidth(inputType, part.value);

      comp = {
        type: 'input',
        inputType,
        value,
        width: inputWidth,
        x: cursorX,
      };
      cursorX += inputWidth + SEP_SPACE_X;
    }

    components.push(comp);
  }

  // 移除最后的间距
  if (components.length > 0) {
    cursorX -= SEP_SPACE_X;
  }

  // 内容宽度
  let contentWidth = cursorX;

  // 检查第一个元素是否是输入框（需要避开凹槽）
  // 如果是，需要增加宽度来容纳偏移
  const firstComp = components[0];
  const hasTopNotch = type !== BlockType.HAT && type !== BlockType.EVENT && type !== BlockType.END && type !== BlockType.ROUND && type !== BlockType.BOOLEAN;
  const needsNotchOffset = firstComp && firstComp.type === 'input' && hasTopNotch;
  const notchOffset = needsNotchOffset ? Math.max(0, INPUT_AND_FIELD_MIN_X - SEP_SPACE_X) : 0;

  // 调整内容宽度
  if (notchOffset > 0) {
    contentWidth += notchOffset;
  }

  // 计算积木尺寸 - 需要加上左右 padding
  // scratch-blocks: reporter blocks use SHAPE_IN_SHAPE_PADDING
  let paddingStart = SEP_SPACE_X;
  let paddingEnd = SEP_SPACE_X;
  if (isReporter) {
    const outerShape = getOutputShapeCode(type, outputShape);
    if (outerShape && SHAPE_IN_SHAPE_PADDING[outerShape]) {
      const firstShape = getInnerShapeCodeForComponent(components[0]);
      const lastShape = getInnerShapeCodeForComponent(components[components.length - 1]);
      paddingStart = SHAPE_IN_SHAPE_PADDING[outerShape][firstShape];
      paddingEnd = SHAPE_IN_SHAPE_PADDING[outerShape][lastShape];
    }
  }
  const padding = paddingStart + paddingEnd;
  let blockWidth, blockHeight;

  // 确定使用的分支分隔行内容
  const effectiveBranchParts = hasAutoBranchSplit ? autoBranchParts : legacyBranchParts;

  // C型积木：预先计算每个分隔行的高度
  // 判断是否是 C型积木（基于 branches 数量或类型）
  // branches 会根据 parts 中的 _NextBrach_ 自动计算
  const isCBlock = branches > 0 || type === BlockType.C_BLOCK;

  let statementRowHeights = [];
  let maxBranchContentWidth = 0;
  if (isCBlock) {
    for (let i = 0; i < branches; i++) {
      const parts = effectiveBranchParts[i] || [];
      // 如果有内容，使用MIN_BLOCK_Y（48），否则使用EXTRA_STATEMENT_ROW_Y（32）
      const rowHeight = parts.length > 0 ? MIN_BLOCK_Y : EXTRA_STATEMENT_ROW_Y;
      statementRowHeights.push(rowHeight);
      maxBranchContentWidth = Math.max(maxBranchContentWidth, calculatePartsWidth(parts));
    }
  }

  switch (type) {
    case BlockType.HAT:
    case BlockType.EVENT:
      // 帽子类型需要额外保证宽度至少能容纳顶部圆弧
      blockWidth = Math.max(MIN_BLOCK_X, contentWidth + padding, HAT_MIN_WIDTH);
      blockHeight = MIN_BLOCK_Y;
      break;
    case BlockType.END:
      blockWidth = Math.max(MIN_BLOCK_X, contentWidth + padding);
      blockHeight = MIN_BLOCK_Y;
      break;
    case BlockType.ROUND:
      // Round 块：宽度由内容 + 左右 padding 决定
      blockWidth = Math.max(FIELD_WIDTH, contentWidth + padding, ROUND_MIN_WIDTH);
      blockHeight = reporterHeight;
      break;
    case BlockType.BOOLEAN:
      // 布尔块：宽度由内容 + 左右 padding 决定
      blockWidth = Math.max(FIELD_WIDTH, contentWidth + padding);
      blockHeight = reporterHeight;
      break;
    case BlockType.DEFINE_HAT:
      // define hat 也使用同样的帽子弧线
      blockWidth = Math.max(MIN_BLOCK_X, contentWidth + padding, HAT_MIN_WIDTH);
      blockHeight = MIN_BLOCK_Y + DEFINE_HAT_CORNER_RADIUS;
      break;
    case BlockType.C_BLOCK:
      // C型积木统一处理，通过 hasNextConnection 配置决定底部是否有凸起
      blockWidth = Math.max(MIN_BLOCK_X_WITH_STATEMENT, contentWidth + padding, maxBranchContentWidth + padding);
      // C型积木高度 = 顶部 + 分支*高度 + 各分隔行高度之和
      const totalStatementRowHeight = statementRowHeights.reduce((sum, h) => sum + h, 0);
      blockHeight = MIN_BLOCK_Y + branches * branchHeight + totalStatementRowHeight;
      break;
    // C_BLOCK_END 已合并到 C_BLOCK
    case BlockType.STACK:
    default:
      blockWidth = Math.max(MIN_BLOCK_X, contentWidth + padding);
      blockHeight = MIN_BLOCK_Y;
  }

  // 生成背景路径
  let bgPath;
  switch (type) {
    case BlockType.HAT:
    case BlockType.EVENT:
      bgPath = generateHatPath(blockWidth);
      break;
    case BlockType.END:
      bgPath = generateEndPath(blockWidth);
      break;
    case BlockType.ROUND:
      bgPath = generateRoundPath(blockWidth, reporterHeight);
      break;
    case BlockType.BOOLEAN:
      // generateBooleanPath 参数是内部宽度，blockWidth 已包含左右尖角
      bgPath = generateBooleanPath(blockWidth - reporterHeight, reporterHeight);
      break;
    case BlockType.DEFINE_HAT:
      bgPath = generateDefineHatPath(blockWidth);
      break;
    case BlockType.C_BLOCK:
      // 通过 hasNextConnection 配置决定底部是否有凸起
      bgPath = generateCBlockPath(blockWidth, branches, branchHeight, hasNextConnection, branchLabels, statementRowHeights);
      break;
    // C_BLOCK_END 已合并到 C_BLOCK
    case BlockType.STACK:
    default:
      bgPath = generateStackPath(blockWidth, hasNextConnection);
  }

  // 创建背景
  const background = createSvgElement("path", {
    class: "blocklyPath",
    d: bgPath,
    fill: primary,
    stroke: secondary,
    "stroke-width": 1,
  });
  container.appendChild(background);

  // 计算起始 X 位置
  // scratch-blocks: reporter blocks use shape-based padding
  const startX = isReporter ? paddingStart : SEP_SPACE_X;

  // C型积木：渲染分支标签
  if (isCBlock) {
    for (let i = 0; i < branchLabels.length; i++) {
      const label = branchLabels[i];
      if (label) {
        // 计算前面所有分隔行的高度之和
        let prevStatementRowHeight = 0;
        for (let j = 0; j < i; j++) {
          prevStatementRowHeight += statementRowHeights[j] || EXTRA_STATEMENT_ROW_Y;
        }

        // 当前分隔行的高度
        const currentRowHeight = statementRowHeights[i] || EXTRA_STATEMENT_ROW_Y;

        // 分支标签Y位置：在第 i 个分支之后的分隔行中居中
        const labelY = MIN_BLOCK_Y + (i + 1) * branchHeight + prevStatementRowHeight + currentRowHeight / 2;

        const labelText = createSvgElement("text", {
          class: "blocklyText",
          x: startX,
          y: labelY,
          "dominant-baseline": "middle",
          dy: 0,
          fill: "#FFFFFF",
          "font-family": TEXT_STYLE.fontFamily,
          "font-size": `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`,
          "font-weight": TEXT_STYLE.fontWeight,
        });
        labelText.textContent = label;
        container.appendChild(labelText);
      }
    }
  }

  // C型积木：渲染每个分支的内容 (使用 effectiveBranchParts)
  if (isCBlock && effectiveBranchParts) {
    for (let branchIndex = 0; branchIndex < effectiveBranchParts.length; branchIndex++) {
      const parts = effectiveBranchParts[branchIndex];
      if (!parts || parts.length === 0) continue;

      // 计算前面所有分隔行的高度之和
      let prevStatementRowHeight = 0;
      for (let j = 0; j < branchIndex; j++) {
        prevStatementRowHeight += statementRowHeights[j] || EXTRA_STATEMENT_ROW_Y;
      }

      // 当前分隔行的高度
      const currentRowHeight = statementRowHeights[branchIndex] || EXTRA_STATEMENT_ROW_Y;

      // 分支内容的Y位置：在该分支的分隔行中居中
      // Y = 顶部行 + 该分支高度 + 前面分隔行高度之和 + 当前分隔行的一半
      const branchContentY = MIN_BLOCK_Y + (branchIndex + 1) * branchHeight + prevStatementRowHeight + currentRowHeight / 2;

      let currentBranchX = startX;

      for (const part of parts) {
        if (typeof part === 'string') {
          // 纯文本
          const textWidth = getTextWidth(part);

          const text = createSvgElement("text", {
            class: "blocklyText",
            x: currentBranchX,
            y: branchContentY,
            "dominant-baseline": "middle",
            dy: 0,
            fill: "#FFFFFF",
            "font-family": TEXT_STYLE.fontFamily,
            "font-size": `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`,
            "font-weight": TEXT_STYLE.fontWeight,
          });
          text.textContent = part;
          container.appendChild(text);

          currentBranchX += textWidth + SEP_SPACE_X;
        } else if (part && typeof part === 'object') {
          // 输入框
          const inputType = normalizeInputType(part.inputType);
          const value = normalizeInputValue(part.value);
          const textWidth = getTextWidth(value);
          const inputWidth = calculateInputWidth(inputType, value);

          const inputY = branchContentY - INPUT_SHAPE_HEIGHT / 2;
          const inputPath = generateInputPath(inputType, inputWidth);

          const inputBg = createSvgElement("path", {
            class: "blocklyInput",
            d: inputPath,
            fill: getInputBgColor(inputType, primary, secondary, tertiary, part.value),
            stroke: secondary,
            "stroke-width": 1,
            "data-input-index": inputIndex++,
          });
          inputBg.setAttribute("transform", `translate(${currentBranchX}, ${inputY})`);
          container.appendChild(inputBg);

          // 输入框文本
          if (inputType !== InputType.BOOLEAN) {
            let textX;
            if (isDropdownLikeInput(inputType)) {
              const arrowWidth = 12 + DROPDOWN_ARROW_PADDING;
              textX = currentBranchX + (inputWidth - arrowWidth) / 2;
            } else {
              textX = currentBranchX + inputWidth / 2;
            }
            const inputText = createSvgElement("text", {
              class: "blocklyText",
              x: textX,
              y: branchContentY,
              "text-anchor": "middle",
              "dominant-baseline": "middle",
              dy: 0,
              fill: getInputTextColor(inputType, part.value),
              "font-family": TEXT_STYLE.fontFamily,
              "font-size": `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`,
              "font-weight": TEXT_STYLE.fontWeight,
            });
            inputText.textContent = value;
            container.appendChild(inputText);
          }


          // 下拉箭头
          if (isDropdownLikeInput(inputType)) {
            const arrowX = currentBranchX + BOX_FIELD_PADDING + textWidth + EDITABLE_FIELD_PADDING + DROPDOWN_ARROW_PADDING / 2;
            const arrowY = inputY + (INPUT_SHAPE_HEIGHT - 8.79) / 2;
            const arrow = createSvgElement("image", {
              x: arrowX,
              y: arrowY,
              width: 12,
              height: 8.79,
            });

            const arrowData = normalizeInputType(inputType) === InputType.DROPDOWN_READONLY
              ? DROPDOWN_ARROW_DARK_SVG
              : DROPDOWN_ARROW_SVG;
            const dataUri = 'data:image/svg+xml;base64,' + btoa(arrowData);
            arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUri);
            container.appendChild(arrow);
          }

          currentBranchX += inputWidth + SEP_SPACE_X;
        }
      }
    }
  }

  // 渲染组件
  // 布尔块和 Round 块路径起点有偏移，内容需要偏移
  let currentX = startX;
  // 计算文本/输入框的Y位置 - 对于C型积木在顶部行居中
  const contentY = isCBlock
    ? MIN_BLOCK_Y / 2
    : blockHeight / 2;

  for (const comp of components) {
    if (comp.type === 'blockIcon') {
      // 渲染积木图标
      const iconSize = comp.width || 24;
      const iconY = contentY - iconSize / 2;
      
      const iconEl = createSvgElement("image", {
        x: currentX,
        y: iconY,
        width: iconSize,
        height: iconSize,
      });
      iconEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', comp.content);
      container.appendChild(iconEl);
      
      currentX += comp.width + SEP_SPACE_X;
    } else if (comp.type === 'text') {
      // 文本垂直居中
      const text = createSvgElement("text", {
        class: "blocklyText",
        x: currentX,
        y: contentY,
        "dominant-baseline": "middle",
        dy: 0,
        fill: "#FFFFFF",
        "font-family": TEXT_STYLE.fontFamily,
        "font-size": `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`,
        "font-weight": TEXT_STYLE.fontWeight,
      });
      text.textContent = comp.content;
      container.appendChild(text);

      currentX += comp.width + SEP_SPACE_X;
    } else if (comp.type === 'input') {
      // 图片类型特殊处理
      if (comp.inputType === InputType.IMAGE) {
        const imageData = parseImageData(comp.value);
        if (imageData) {
          const imageEl = createImageField(imageData, currentX, contentY);
          container.appendChild(imageEl);
          currentX += imageData.width + SEP_SPACE_X;
        } else {
          // 无效图片数据，跳过
          currentX += DEFAULT_IMAGE_WIDTH + SEP_SPACE_X;
        }
        continue;
      }
      
      // 输入框位置 - 对于C型积木在顶部行居中
      // 如果是第一个元素且需要避开凹槽，应用偏移
      if (notchOffset > 0 && currentX === startX) {
        currentX += notchOffset;
      }

      const inputY = contentY - INPUT_SHAPE_HEIGHT / 2;
      const inputPath = generateInputPath(comp.inputType, comp.width);

      // 输入框颜色
      const bgColor = getInputBgColor(comp.inputType, primary, secondary, tertiary, comp.value);
      const textColor = getInputTextColor(comp.inputType, comp.value);

      // 创建输入框背景
      const inputBg = createSvgElement("path", {
        class: "blocklyInput",
        d: inputPath,
        fill: bgColor,
        stroke: secondary,
        "stroke-width": 1,
        transform: `translate(${currentX}, ${inputY})`,
        "data-input-index": inputIndex++,
      });
      container.appendChild(inputBg);

      const needString = inputType => {
        switch (inputType) {
          case InputType.BOOLEAN:
            return false
          default:
            return true
        }
      }
      // 输入框文本
      if (comp.value) {
        let textX;

        // 参考 scratch-blocks: centerTextX = (width - arrowWidth) / 2
        if (isDropdownLikeInput(comp.inputType)) {
          const arrowWidth = 12 + DROPDOWN_ARROW_PADDING;  // 20
          textX = currentX + (comp.width - arrowWidth) / 2;
        } else {
          // 普通输入框：文本居中
          textX = currentX + comp.width / 2;
        }
        if (needString(comp.inputType)) { //布尔没有文字
          const inputText = createSvgElement("text", {
            class: "blocklyText",
            x: textX,
            y: contentY,
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            dy: 0,
            fill: textColor,
            "font-family": TEXT_STYLE.fontFamily,
            "font-size": `${TEXT_STYLE.fontSize}${TEXT_STYLE.fontSizeUnit}`,
            "font-weight": TEXT_STYLE.fontWeight,
          });
          inputText.textContent = comp.value;
          container.appendChild(inputText);
        }
      }

      // 下拉框箭头
      if (isDropdownLikeInput(comp.inputType)) {
        // 参考 scratch-blocks field_dropdown.js positionArrow
        // arrowX = BOX_FIELD_PADDING + textWidth + EDITABLE_FIELD_PADDING + DROPDOWN_ARROW_PADDING / 2
        const textWidth = getTextWidth(comp.value);
        const arrowX = currentX + BOX_FIELD_PADDING + textWidth + EDITABLE_FIELD_PADDING + DROPDOWN_ARROW_PADDING / 2;
        const arrowY = inputY + (INPUT_SHAPE_HEIGHT - 8.79) / 2;

        const arrow = createSvgElement("image", {
          x: arrowX,
          y: arrowY,
          width: 12,
          height: 8.79,
        });

        // 使用 data URI 内嵌 SVG
        const arrowData = normalizeInputType(comp.inputType) === InputType.DROPDOWN_READONLY
          ? DROPDOWN_ARROW_DARK_SVG
          : DROPDOWN_ARROW_SVG;
        const dataUri = 'data:image/svg+xml;base64,' + btoa(arrowData);
        arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUri);
        container.appendChild(arrow);
      }

      currentX += comp.width + SEP_SPACE_X;
    }
  }

  // C型积木：渲染循环图标（如果 isLoop 为 true）
  if (isCBlock && isLoop) {
    // 计算循环图标位置：在最后一个分支的分隔行右侧
    // 参考 scratch-blocks control.js 中的 repeat.svg 位置
    let prevStatementRowHeight = 0;
    for (let j = 0; j < branches - 1; j++) {
      prevStatementRowHeight += statementRowHeights[j] || EXTRA_STATEMENT_ROW_Y;
    }

    const lastStatementRowHeight = statementRowHeights[branches - 1] || EXTRA_STATEMENT_ROW_Y;
    // 循环图标 Y 位置：在最后一个分支的分隔行中居中
    const loopIconY = MIN_BLOCK_Y + branches * branchHeight + prevStatementRowHeight + (lastStatementRowHeight - LOOP_ICON_SIZE) / 2;
    // 循环图标 X 位置：在右侧
    const loopIconX = blockWidth - LOOP_ICON_SIZE - SEP_SPACE_X;

    // 创建循环图标 image 元素
    const loopIcon = createSvgElement("image", {
      x: loopIconX,
      y: loopIconY,
      width: LOOP_ICON_SIZE,
      height: LOOP_ICON_SIZE,
    });

    // 使用 data URI 内嵌 SVG
    const loopDataUri = 'data:image/svg+xml;base64,' + btoa(LOOP_ARROW_SVG);
    loopIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', loopDataUri);
    container.appendChild(loopIcon);
  }

  if (standalone) {
    const svg = createSvgElement("svg", {
      xmlns: SVG_NS,
      width: blockWidth,
      height: blockHeight,
      viewBox: `0 0 ${blockWidth} ${blockHeight}`,
    });
    svg.appendChild(container);
    return svg;
  }

  return container;
}

/**
 * 渲染积木并返回 HTML 字符串
 */
function renderBlockToHTML(blockData) {
  const svg = renderBlock(blockData, { standalone: true });
  return new XMLSerializer().serializeToString(svg);
}

/**
 * 将 SVG 元素转换为字符串
 */
function svgToString(svgElement) {
  return new XMLSerializer().serializeToString(svgElement);
}


// ============== 导出 ==============
export const renderConstList = [
  NEXT_BRANCH_MARKER
]
export {
  renderBlock,
  renderBlockToHTML,
  svgToString,
  BlockType,
  InputType,
  DefaultColors,
  DefaultBlockConfig,
  getConfigForBlockType,
  resolveBlockConfig,
  getTextWidth,
  createSvgElement,
  generateCBlockPath,
  createImageField,
  parseImageData,
  // 常量
  GRID_UNIT,
  SEP_SPACE_X,
  MIN_BLOCK_X,
  MIN_BLOCK_Y,
  INPUT_SHAPE_HEIGHT,
  FIELD_HEIGHT,
  CORNER_RADIUS,
  // C型积木常量
  MIN_STATEMENT_INPUT_HEIGHT,
  STATEMENT_INPUT_EDGE_WIDTH,
  STATEMENT_INPUT_INNER_SPACE,
  MIN_BLOCK_X_WITH_STATEMENT,
  EXTRA_STATEMENT_ROW_Y,
  // 分支分隔标记
  NEXT_BRANCH_MARKER,
  // 循环图标
  LOOP_ICON_SIZE,
  LOOP_ARROW_SVG,
  // 图片字段常量
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_HEIGHT,
};

export default renderBlock;
