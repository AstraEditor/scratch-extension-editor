/**
 * BlockSvgRenderer 使用示例
 * 演示如何通过JSON数据生成Scratch积木SVG
 */

import { renderBlock, svgToString, BlockType, InputType, MIN_BLOCK_Y } from "./blockSvgRenderer.js";

// ============== 示例数据 ==============

// 示例1: 简单的堆叠块 (move (10) steps)
const moveStepsBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#4C97FF",    // 主色
    secondary: "#4280D7",  // 输入框颜色
    tertiary: "#3373CC",   // 边框颜色
  },
  parts: [
    "move ",
    { inputType: InputType.TEXT_NUMBER, value: "10" },
    " steps",
  ],
};

// 示例2: 带下拉菜单的积木 (go to [random position])
const goToBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#4C97FF",
    secondary: "#4280D7",
    tertiary: "#3373CC",
  },
  parts: [
    "go to ",
    { inputType: InputType.DROPDOWN, value: "random position" },
  ],
};

// 示例3: 帽子块 (when green flag clicked)
const whenFlagClickedBlock = {
  type: BlockType.HAT,
  colors: {
    primary: "#FFBF00",
    secondary: "#E6AC00",
    tertiary: "#CC9900",
  },
  parts: ["when ", { inputType: InputType.DROPDOWN_READONLY, value: "green flag" }, " clicked"],
};

// 示例4: 结束块 (stop [all])
const stopBlock = {
  type: BlockType.END,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: ["stop ", { inputType: InputType.DROPDOWN_READONLY, value: "all" }],
};

// 示例4b: 可填入积木的下拉框 (go to x: y:)
const goToXYBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#4C97FF",
    secondary: "#4280D7",
    tertiary: "#3373CC",
  },
  parts: [
    "go to x:",
    { inputType: InputType.TEXT_NUMBER, value: "0" },
    " y:",
    { inputType: InputType.TEXT_NUMBER, value: "0" },
  ],
};

// 示例4c: 带可填入下拉框的积木
const glideToBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#4C97FF",
    secondary: "#4280D7",
    tertiary: "#3373CC",
  },
  parts: [
    "glide ",
    { inputType: InputType.TEXT_NUMBER, value: "1" },
    " secs to ",
    { inputType: InputType.DROPDOWN, value: "random position" },
  ],
};

// 示例5: 圆形报告块 ((10) + (20))
const additionBlock = {
  type: BlockType.ROUND,
  colors: {
    primary: "#59C059",
    secondary: "#46B946",
    tertiary: "#389438",
  },
  parts: [
    { inputType: InputType.TEXT_NUMBER, value: "10" },
    " + ",
    { inputType: InputType.TEXT_NUMBER, value: "20" },
  ],
};

// 示例6: 布尔块 (<() = ()>)
const equalsBlock = {
  type: BlockType.BOOLEAN,
  colors: {
    primary: "#59C059",
    secondary: "#46B946",
    tertiary: "#389438",
  },
  parts: [
    { inputType: InputType.TEXT_NUMBER, value: "" },
    " = ",
    { inputType: InputType.TEXT_NUMBER, value: "" },
  ],
};

// 示例7: 变量块
const variableBlock = {
  type: BlockType.ROUND,
  colors: {
    primary: "#FF8C1A",
    secondary: "#DB6E00",
    tertiary: "#E88300",
  },
  parts: [{ inputType: InputType.VARIABLE, value: "my variable" }],
};

// 示例8: 带布尔输入的积木 (if <> then)
const ifBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: [
    "if ",
    { inputType: InputType.BOOLEAN, value: "" },
    " then",
  ],
};

// 示例9: 复杂积木 (set [my variable] to (0))
const setVariableBlock = {
  type: BlockType.STACK,
  colors: {
    primary: "#FF8C1A",
    secondary: "#DB6E00",
    tertiary: "#E88300",
  },
  parts: [
    "set ",
    { inputType: InputType.VARIABLE, value: "my variable" },
    " to ",
    { inputType: InputType.TEXT_NUMBER, value: "0" },
  ],
};

// ============== C型积木示例 ==============

// 示例10: 单分支C型积木 (repeat (10))
const repeatBlock = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: [
    "repeat ",
    { inputType: InputType.TEXT_NUMBER, value: "10" },
  ],
  branches: 1,              // 1个分支
  branchHeight: MIN_BLOCK_Y, // 每个分支高度 = 1个块高度 (48)
};

// 示例11: 双分支C型积木 (if-else)
const ifElseBlock = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: [
    "if ",
    { inputType: InputType.BOOLEAN, value: "" },
    " then",
  ],
  branches: 2,              // 2个分支 (if 和 else)
  branchHeight: MIN_BLOCK_Y,
  // 方法1: 使用 branchLabels 简单标签
  branchLabels: ["", "else"],
};

// 示例11b: 双分支C型积木 - 使用 branchParts（更灵活）
const ifElseBlockWithParts = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: [
    "if ",
    { inputType: InputType.BOOLEAN, value: "" },
    " then",
  ],
  branches: 2,
  branchHeight: MIN_BLOCK_Y,
  // 方法2: 使用 branchParts 可以添加输入框
  branchParts: [
    [],  // 第一个分支后的分隔行（空）
    ["else"],  // 第二个分支后的分隔行
  ],
};

// 示例11c: 带输入框的分支标签
const ifElseBlockWithInput = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: [
    "if ",
    { inputType: InputType.BOOLEAN, value: "" },
    " then",
  ],
  branches: 2,
  branchHeight: MIN_BLOCK_Y,
  // 分支分隔行可以包含文本和输入框
  branchParts: [
    [],
    ["else if ", { inputType: InputType.BOOLEAN, value: "" }],
  ],
};

// 示例12: 三分支C型积木 (自定义)
const multiBranchBlock = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#9966FF",
    secondary: "#855CD6",
    tertiary: "#774DCB",
  },
  parts: [
    "custom ",
    { inputType: InputType.DROPDOWN, value: "choice" },
  ],
  branches: 3,              // 3个分支
  branchHeight: MIN_BLOCK_Y,
  branchParts: [
    [],
    ["case ", { inputType: InputType.TEXT_NUMBER, value: "2" }],
    ["default"],
  ],
};

// 示例13: 无底部凸起的C型积木 (forever)
const foreverBlock = {
  type: BlockType.C_BLOCK_END,  // 注意：使用 C_BLOCK_END 类型
  colors: {
    primary: "#FFAB19",
    secondary: "#EC9C13",
    tertiary: "#CF8B17",
  },
  parts: ["forever"],
  branches: 1,
  branchHeight: MIN_BLOCK_Y,
};

// 示例14: 自定义分支高度的C型积木
const tallCBlock = {
  type: BlockType.C_BLOCK,
  colors: {
    primary: "#59C059",
    secondary: "#46B946",
    tertiary: "#389438",
  },
  parts: ["wait until ", { inputType: InputType.BOOLEAN, value: "" }],
  branches: 1,
  branchHeight: MIN_BLOCK_Y * 2,  // 分支高度 = 2个块高度 (96)
};

// ============== 使用方法 ==============

// 方法1: 渲染到现有SVG容器
function exampleRenderToContainer() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const block = renderBlock(moveStepsBlock);
  svg.appendChild(block);
  document.body.appendChild(svg);
}

// 方法2: 生成独立SVG字符串
function exampleGenerateStandaloneSvg() {
  const svg = renderBlock(moveStepsBlock, { standalone: true });
  const svgString = svgToString(svg);
  console.log(svgString);
  return svgString;
}

// 方法3: 批量渲染多个积木
function exampleRenderMultipleBlocks() {
  const blocks = [
    whenFlagClickedBlock,
    moveStepsBlock,
    goToBlock,
    stopBlock,
  ];

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let yOffset = 0;

  for (const blockData of blocks) {
    const block = renderBlock(blockData);
    block.setAttribute("transform", `translate(0, ${yOffset})`);
    container.appendChild(block);
    yOffset += 60; // 积木间距
  }

  return container;
}

// ============== TypeScript 类型定义 (可选) ==============
/**
 * @typedef {Object} BlockColor
 * @property {string} primary - 主色 (#RRGGBB)
 * @property {string} secondary - 次色 (#RRGGBB)
 * @property {string} tertiary - 边框色 (#RRGGBB)
 */

/**
 * @typedef {Object} BlockInput
 * @property {string} inputType - 输入类型: textNumber|boolean|dropdown|variable
 * @property {string} value - 显示值
 */

/**
 * @typedef {Object} BlockData
 * @property {string} type - 积木类型: stack|hat|end|round|boolean|defineHat|cBlock|cBlockEnd
 * @property {BlockColor} colors - 颜色配置
 * @property {Array<string|BlockInput>} parts - 组成部分
 * @property {number} [branches] - C型积木分支数量
 * @property {number} [branchHeight] - 每个分支高度
 * @property {Array<string>} [branchLabels] - 分支标签（简单文本）
 * @property {Array<Array<string|BlockInput>>} [branchParts] - 每个分支分隔行的内容（支持输入框）
 */

export {
  moveStepsBlock,
  goToBlock,
  whenFlagClickedBlock,
  stopBlock,
  goToXYBlock,
  glideToBlock,
  additionBlock,
  equalsBlock,
  variableBlock,
  ifBlock,
  setVariableBlock,
  // C型积木
  repeatBlock,
  ifElseBlock,
  ifElseBlockWithParts,
  ifElseBlockWithInput,
  multiBranchBlock,
  foreverBlock,
  tallCBlock,
};
