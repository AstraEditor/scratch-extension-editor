# 入门指南

## 最小扩展示例

### 你需要什么

本编辑器专为 **TurboWarp 风格的非沙箱扩展**设计：你编写 JavaScript，然后将其加载到 VM 中。

- 你的代码必须通过 `Scratch.extensions.register(new MyExtension())` 注册。
- 你的扩展必须实现 `getInfo()` 并返回 `id`、`name` 和 `blocks`。

### 最小模板（推荐）

```javascript
(function (Scratch) {
  "use strict";           // ① 使用严格模式，避免常见的错误
  
  const BlockType = Scratch.BlockType;       // ② 引入积木类型常量
  const ArgumentType = Scratch.ArgumentType; // ③ 引入参数类型常量

  class MyExtension {        // ④ 创建扩展类
    constructor() {
      // 仅在 TurboWarp/非沙箱环境中可用：
      this.runtime = Scratch.vm && Scratch.vm.runtime;
    }

    getInfo() {             // ⑤ 必须实现的方法，返回扩展信息
      return {
        id: "myextension",   // 唯一标识符，不能有空格或大写
        name: "我的扩展",      // 积木显示的名称
        color1: "#FF6680",     // 主色调
        color2: "#FF4D6A",     // 次色调
        color3: "#CC3D55",     // 边框颜色
        blocks: [             // ⑥ 定义积木列表
          {
            opcode: "hello",   // 积木的唯一标识符
            blockType: BlockType.COMMAND, // 积木类型：命令积木
            text: "问候 [NAME]", // 积木文本，[NAME] 是参数占位符
            arguments: {         // ⑦ 定义参数
              NAME: {
                type: ArgumentType.STRING,  // 参数类型：字符串
                defaultValue: "世界"          // 默认值
              }
            }
          }
        ]
      };
    }

    hello(args) {            // ⑧ 当积木执行时调用的方法
      console.log("你好，" + args.NAME);  // 在控制台输出问候消息
    }
  }

  // ⑧ 注册扩展到 Scratch
  Scratch.extensions.register(new MyExtension());
})(Scratch);
```

### 常见错误

- 忘记 IIFE 包装器：`((Scratch) => { ... })(Scratch)`
- 使用无效的 `id`（必须唯一；避免空格和大写字母）
- 注册太晚（每次加载只注册一次）

## 热重载与多次加载

### 为什么有时会"加载两次"

当你多次点击 **运行** 时，VM 会：

1) 卸载之前的扩展（如果可能），
2) 然后加载新代码。

如果你的扩展写入全局作用域（例如 `window.foo = ...`），可能会看到奇怪的行为。

### 推荐模式

- 将所有内容保留在 IIFE 内部。
- 避免全局变量。
- 仅在需要时使用 `Scratch.vm`/`Scratch.renderer`。

# Scratch API

## Scratch 对象概览

### TurboWarp 注入的内容

在 TurboWarp 的非沙箱扩展环境中，VM 会注入一个全局 `Scratch` 对象，包含以下 API。
此列表来自 TurboWarp 的 VM 实现：

- `scratch-vm/src/extension-support/tw-extension-api-common.js`
- `scratch-vm/src/extension-support/tw-unsandboxed-extension-runner.js`
- `scratch-vm/src/extension-support/tw-external.js`

### 常量与工具

这些在非沙箱扩展中始终可用：

- `Scratch.ArgumentType`
- `Scratch.BlockType`
- `Scratch.BlockShape`
- `Scratch.TargetType`
- `Scratch.Cast`
- `Scratch.external`（见下文）

### 注册你的扩展

TurboWarp 注入：

- `Scratch.extensions.unsandboxed === true`
- `Scratch.extensions.register(extensionObject)`

此外，TurboWarp 提供了 ScratchX 兼容的全局对象：

- `ScratchExtensions`（传统的 ScratchX 风格 API）

### VM 与渲染器

非沙箱扩展可以访问：

- `Scratch.vm`（VirtualMachine 实例）
- `Scratch.renderer`（渲染器实例；通常是 `Scratch.vm.runtime.renderer`）

重要提示：`Scratch.vm` 和 `Scratch.renderer` 是**强大但不稳定的公共 API**。尽可能使用正常的块 API。

### 翻译

- `Scratch.translate(...)`

你可以使用它来使块可本地化（高级用法）。

## 权限与安全功能

### 权限检查（can*）

TurboWarp 暴露异步权限检查：

- `Scratch.canFetch(url)`
- `Scratch.canOpenWindow(url)`
- `Scratch.canRedirect(url)`
- `Scratch.canDownload(url, name)`
- `Scratch.canEmbed(url)`
- `Scratch.canRecordAudio()`
- `Scratch.canRecordVideo()`
- `Scratch.canReadClipboard()`
- `Scratch.canNotify()`
- `Scratch.canGeolocate()`

这些返回 `Promise<boolean>`。

### 操作（fetch/openWindow/redirect/download）

TurboWarp 提供安全包装器，强制执行权限检查：

- `Scratch.fetch(url, options)`（类似 `fetch`，但检查 `Scratch.canFetch`）
- `Scratch.openWindow(url, features)`（打开新标签页；检查 `Scratch.canOpenWindow`）
- `Scratch.redirect(url)`（更改 `location.href`；检查 `Scratch.canRedirect`）
- `Scratch.download(url, name)`（通过 `<a download>` 下载；检查 `Scratch.canDownload`）

示例：

```javascript
async function getText(url) {
  const res = await Scratch.fetch(url);
  return res.text();
}
```

注意：

- URL 是相对于当前页面解析的（`new URL(url, location.href)`）。
- `javascript:` URL 在 open/redirect/download 中始终被拒绝。

## Scratch.external

### 它是什么

`Scratch.external` 是一个用于加载外部资源/模块的小型助手集。

它包括：

- `Scratch.external.importModule(url)` -> `import(url)`（需要**绝对** URL）
- `Scratch.external.fetch(url)` -> `fetch(url)` 并带有基本的 HTTP 错误处理
- `Scratch.external.dataURL(url)` -> fetch -> 转换为 `data:` URL
- `Scratch.external.blob(url)` -> fetch -> `Blob`
- `Scratch.external.evalAndReturn(url, returnExpression)` -> fetch JS -> `new Function(...)`

### URL 规则（非常重要）

TurboWarp 要求 URL 以下列之一开头：

- `http:`
- `https:`
- `data:`
- `blob:`

相对 URL 会被拒绝。

### 示例：导入 ES 模块

```javascript
const {default: md5} = await Scratch.external.importModule(
  "https://cdn.jsdelivr.net/npm/blueimp-md5@2.19.0/js/md5.min.js"
);
console.log(md5("hello"));
```

# 积木与 getInfo()

## 定义积木

### BlockType 快速参考

```javascript
const BlockType = Scratch.BlockType;

BlockType.COMMAND    // 命令积木（六边形）
BlockType.REPORTER   // 报告积木（椭圆形，返回值）
BlockType.BOOLEAN    // 布尔积木（六边形，返回 true/false）
BlockType.HAT        // 事件积木（顶部有缺口）
BlockType.EVENT      // 事件积木（顶部有缺口）
BlockType.LOOP       // 循环积木（C 形）
BlockType.CONDITIONAL // 条件积木（C 形）
BlockType.BUTTON     // 按钮积木（可点击）
BlockType.LABEL      // 标签积木（静态文本）
BlockType.XML        // 自定义 XML 积木
```

### ArgumentType 快速参考

```javascript
const ArgumentType = Scratch.ArgumentType;

ArgumentType.STRING   // 字符串类型
ArgumentType.NUMBER   // 数字类型
ArgumentType.BOOLEAN  // 布尔类型
ArgumentType.ANGLE    // 角度类型（0-360）
ArgumentType.COLOR    // 颜色类型
ArgumentType.MATRIX   // 矩阵类型
ArgumentType.NOTE     // 音符类型
ArgumentType.IMAGE    // 图片类型
ArgumentType.COSTUME  // 角色类型
ArgumentType.SOUND    // 声音类型
```

## 菜单

### 静态菜单

```javascript
class MyExtension {
  getInfo() {
      return {
        id: "fruitpicker",
        name: "水果选择器",
        color1: "#FF9800",
        color2: "#F57C00",
        color3: "#E65100",
        blocks: [
          {
            opcode: "pickFruit",
            blockType: Scratch.BlockType.COMMAND,
            text: "选择 [FRUIT]",
            arguments: {
              FRUIT: {
                type: Scratch.ArgumentType.STRING,
                menu: "fruitMenu"  // 引用菜单
              }
            }
          }
        ],
        menus: {
          fruitMenu: ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]
        }
      };
    }
    
    pickFruit(args) {
      console.log("你选择了：" + args.FRUIT);
    }
  }
}
```

关键点：

- `menu: "fruitMenu"` 让参数成为下拉菜单
- `menus` 对象定义菜单选项
- 菜单选项必须是数组

### 动态菜单（函数）

```javascript
class DynamicMenuExtension {
  getInfo() {
    return {
      id: "dynamic",
      name: "动态菜单",
      color1: "#4CAF50",
      color2: "#388E3C",
      color3: "#2E7D32",
      blocks: [
        {
          opcode: "listVars",
          blockType: Scratch.BlockType.REPORTER,
          text: "所有变量列表",
          disableMonitor: true
        }
      ]
    };
  }

  listVars() {
    // 获取所有变量
    const stage = Scratch.vm.runtime.getTargetForStage();
    const variables = stage.variables;
    
    // 提取变量名
    const varNames = Object.keys(variables);
    return varNames.join(", ");
  }
}
```

# VM 与运行时（高级）

## 访问运行时

### Scratch.vm.runtime

在非沙箱模式下，你可以访问：

```javascript
const vm = Scratch.vm;
const runtime = vm && vm.runtime;
```

这让你可以与目标、线程和内部 VM 状态进行交互。

警告：

- 许多运行时 API 不被认为是稳定的。
- 尽可能使用公共扩展 API。

## 常见模式

### 获取舞台目标

```javascript
const stage = Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.getTargetForStage();
```

### 读取变量值

```javascript
class VariableExtension {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getInfo() {
    return {
      id: "varreader",
      name: "变量读取器",
      color1: "#2196F3",
      color2: "1976D2",
      color3: "#0D47A1",
      blocks: [
        {
          opcode: "getVar",
          blockType: Scratch.BlockType.REPORTER,
          text: "变量 [VAR] 的值",
          arguments: {
            VAR: {
              type: Scratch.ArgumentType.STRING,
              menu: "variableMenu"
            }
          }
        }
      ],
      menus: {
        variableMenu: null  // 将动态生成
      }
    };
  }

  getVar(args) {
    // 获取舞台
    const stage = Scratch.vm.runtime.getTargetForStage();
    
    // 查找变量
    const variable = stage.lookupVariableByName(args.VAR);
    
    if (variable) {
      return variable.value;
    }
    return "";
  }
}
```

### 修改变量值

```javascript
setVar(args) {
  const stage = Scratch.vm.runtime.getTargetForStage();
  const variable = stage.lookupVariableByName(args.VAR);
  
  if (variable) {
    variable.value = args.VALUE;
  }
}
```

### 与角色交互

```javascript
class SpriteInteraction {
  getInfo() {
    return {
      id: "spritehelper",
      name: "角色助手",
      color1: "#E91E63",
      color2: "#C2185B",
      color3: "#880E4F",
      blocks: [
        {
          opcode: "getSpriteX",
          blockType: Scratch.REPORTER,
          text: "[SPRITE] 的 X 坐标",
          arguments: {
            SPRITE: {
              type: Scratch.ArgumentType.STRING,
              menu: "spriteMenu"
            }
          }
        },
        {
          opcode: "moveSprite",
          blockType: Scratch.COMMAND,
          text: "将 [SPRITE] 移动到 X: [X] Y: [Y]",
          arguments: {
            SPRITE: {
              type: Scratch.ArgumentType.STRING,
              menu: "spriteMenu"
            },
            X: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 0
            },
            Y: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 0
            }
          }
        }
      ],
      menus: {
        spriteMenu: null  // 动态生成
      }
    };
  }

  // 获取所有角色名
  spriteMenu() {
    const stage = Scratch.vm.runtime.getTargetForStage();
    const sprites = Scratch.vm.runtime.targets;
    
    // 过滤掉舞台，只保留角色
    return sprites
      .filter(t => t !== stage)
      .map(t => t.getName());
  }

  getSpriteX(args) {
    const stage = Scratch.vm.runtime.getTargetForStage();
    const sprite = stage.lookupSpriteByName(args.SPRITE);
    
    if (sprite) {
      return sprite.x;
    }
    return 0;
  }

  moveSprite(args) {
    const stage = Scratch.vm.runtime.getTargetForStage();
    const sprite = stage.lookupSpriteByName(args.SPRITE);
    
    if (sprite) {
      sprite.x = args.X;
      sprite.y = args.Y;
    }
  }
}
```

### 列出所有目标

```javascript
const targets = Scratch.vm.runtime.targets;
console.log(targets.map(t => t.getName ? t.getName() : t.sprite && t.sprite.name));
```

### 刷新积木 UI（依赖于宿主）

某些宿主暴露了辅助工具：

- `Scratch.vm.refreshWorkspace()`
- `Scratch.vm.emitWorkspaceUpdate()`

如果你的宿主提供了它们，可以在加载/卸载扩展后使用。

# 调试与发布

## 调试技巧

### Worker/Chunk 问题

如果语法高亮不工作：

- 确保 `ts.worker.js` 和 `editor.worker.js` 可访问。
- 确保宿主将 `window.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__` 设置为包含这些文件的文件夹。

### 使用控制台

在块实现中使用 `console.log`、`console.warn` 和 `console.error`。TurboWarp 会在 DevTools 中显示它们。

### 验证数据

```javascript
checkNumber(args) {
  if (typeof args.NUM !== "number") {
    console.warn("警告：参数不是数字类型");
    return 0;
  }
  if (isNaN(args.NUM)) {
    console.warn("警告：参数是 NaN");
    return 0;
  }
  return args.NUM * 2;
}
```

### 错误处理

```javascript
async riskyOperation() {
  try {
    // 可能失败的代码
    const result = await Scratch.fetch(url);
    return result;
  } catch (error) {
    console.error("操作失败：", error);
    return "错误";
  }
}
```

## 发布你的扩展

### 测试你的扩展

- 确保所有积木都能正常工作
- 测试边界情况（空值、异常值）
- 检查控制台是否有错误

### 优化代码

- 移除调试用的 console.log
- 添加必要的注释
- 确保代码格式规范

### 导出为 .js

此编辑器可以将你的代码导出为 `.js` 文件。然后你可以：

- 将其托管在静态服务器上（GitHub Pages 等），
- 在你的编辑器中通过 URL 加载它，
- 或者将其打包到你自己的 mod 中。

### 常见问题

**为什么我的积木没有显示？**

检查以下几点：

- 是否正确注册了扩展
- `id` 是否唯一
- `getInfo()` 是否正确返回对象
- 是否有语法错误

**如何获取特定角色的变量？**

```javascript
const target = Scratch.vm.runtime.getTargetByName("角色名");
const variable = target.lookupVariableByName("变量名");
```

**可以创建自定义的 UI 吗？**

可以，但这是高级主题。可以创建：

- 自定义模态框
- 设置页面
- 工具面板

需要深入了解 TurboWarp 的内部 API。

**如何监听项目状态变化？**

使用运行时事件：

```javascript
this.runtime.on("PROJECT_START", () => {
  console.log("项目开始运行");
});

this.runtime.on("PROJECT_STOP", () => {
  console.log("项目停止运行");
});
```

### 下一步学习

现在你已经掌握了扩展开发的基础知识！继续学习：

- 查看 API 文档了解更多可用功能
- 尝试创建不同类型的积木
- 探索高级交互功能
- 分享你的创作给社区

祝你编程愉快！