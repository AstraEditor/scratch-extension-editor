# 了解

## 什么是 Scratch 扩展？

### 什么是 Scratch 扩展？

Scratch 扩展是通过 JavaScript 编写的模块，可以为 Scratch 添加全新的功能和积木。扩展可以访问 Scratch 虚拟机的 API，与角色、变量、舞台等进行交互。
---

## 扩展基本结构

### 完整的扩展模板

```javascript
class MyExtension {

  getInfo() {
    return {
      id: 'myextension',           // 扩展唯一标识
      name: '我的扩展',             // 显示名称
      color1: '#FF6680',           // 主颜色
      color2: '#FF4D6A',           // 次颜色
      color3: '#CC3D55',           // 第三颜色
      blocks: [...]                 // 积木定义数组
    };
  }

  // 积木实现方法
  myBlock(args) {
    // 积木逻辑
  }
}

// 注册扩展
Scratch.extensions.register(new MyExtension());
```

### 关键说明

- 类名可以任意命名，但建议基于扩展名称
- `getInfo()` 必须返回扩展的元数据
- 每个积木都需要一个对应的实现方法
- 扩展必须使用 `Scratch.extensions.register()` 注册

---

## 扩展配置

### getInfo() 方法详解

#### 完整配置选项

```javascript
getInfo() {
  return {
    // === 必需属性 ===
    id: 'myextension',              // 唯一标识符，只能包含 a-z, 0-9，无空格
    name: '我的扩展',                // 在工具箱中显示的名称

    // === 颜色配置 ===
    color1: '#FF6680',              // 主颜色
    color2: '#FF4D6A',              // 次颜色（可选）
    color3: '#CC3D55',              // 第三颜色（可选）

    // === 图标配置 ===
    blockIconURI: 'data:image/png;base64,...',  // 积木边缘图标（可选）
    menuIconURI: 'data:image/png;base64,...',   // 菜单图标（可选）

    // === 文档链接 ===
    docsURI: 'https://example.com/docs',        // 文档链接（可选）

    // === 积木定义 ===
    blocks: [
      // 积木定义数组...
    ],

    // === 菜单定义 ===
    menus: {
      // 菜单定义...
    }
  };
}
```

#### id 属性说明

- 扩展的唯一标识符
- 只能使用字母 a-z 和数字 0-9
- 不能包含空格或特殊字符
- 多个扩展不能共享相同的 ID
- 用作扩展的命名空间

---

# 积木

## 积木类型指南

### 积木类型概览

Scratch 提供了多种积木类型，每种类型都有特定的形状和用途：

1. **命令积木（COMMAND）** - 执行动作但不返回值
2. **报告积木（REPORTER）** - 返回字符串或数字值
3. **布尔积木（BOOLEAN）** - 返回 true 或 false
4. **事件积木（HAT）** - 在特定条件触发时启动
5. **专用积木（EVENT/LOOP/CONDITIONAL）** - 特殊用途积木

### 积木类型快速参考

```javascript
const BlockType = Scratch.BlockType;

// 所有可用的积木类型
BlockType.COMMAND      // 命令积木 - 矩形
BlockType.REPORTER     // 报告积木 - 圆形
BlockType.BOOLEAN      // 布尔积木 - 六边形
BlockType.HAT          // 事件积木 - 帽子
BlockType.EVENT        // 事件积木 - 专用事件
BlockType.LOOP         // 循环积木 - 控制流
BlockType.CONDITIONAL  // 条件积木 - 控制流
BlockType.BUTTON       // 按钮积木 - 仅在积木区里作为按钮
```

---

## 命令积木（COMMAND）

### 定义命令积木

命令积木是最常见的积木类型，用于执行动作但不返回任何值。它们的形状是矩形，可以像堆叠其他积木一样堆叠它们。

#### 示例：移动积木

```javascript
{
  opcode: 'moveSteps',           // 方法名
  blockType: Scratch.BlockType.COMMAND,
  text: '移动 [STEPS] 步',
  arguments: {
    STEPS: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 10
    }
  }
}

// 实现方法
moveSteps(args) {
  const steps = args.STEPS;
  // 执行移动逻辑
  // 注意：命令积木不返回值
}
```

#### 使用场景

- 改变角色位置、方向、大小
- 播放声音或显示/隐藏角色
- 创建或修改变量
- 发送广播消息
- 任何不需要返回值的操作

---

## 报告积木（REPORTER）

### 定义报告积木

报告积木返回一个值，可以是字符串、数字或其他类型。它们的形状是圆形，可以插入到其他积木的输入槽中。

#### 示例：随机数积木

```javascript
{
  opcode: 'randomNumber',
  blockType: Scratch.BlockType.REPORTER,
  text: '随机数 [MIN] 到 [MAX]',
  arguments: {
    MIN: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 1
    },
    MAX: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 100
    }
  }
}

// 实现方法
randomNumber(args) {
  const min = args.MIN;
  const max = args.MAX;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

#### 返回值类型

报告积木可以返回：

- 数字（整数或小数）
- 字符串
- 布尔值（会自动转换为布尔积木）
- 数组（某些情况下）

---

## 布尔积木（BOOLEAN）

### 定义布尔积木

布尔积木返回 true 或 false，用于条件判断。它们的形状是六边形，通常用于"如果"、"重复直到"等积木的条件输入。

#### 示例：判断偶数

```javascript
{
  opcode: 'isEven',
  blockType: Scratch.BlockType.BOOLEAN,
  text: '[NUMBER] 是偶数?',
  arguments: {
    NUMBER: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 10
    }
  }
}

// 实现方法
isEven(args) {
  return args.NUMBER % 2 == 0;
}
```

#### 使用场景

- 条件判断（如果...那么...）
- 循环条件（重复直到...）
- 逻辑运算（与、或、非）
- 比较运算（大于、小于、等于）

---

## 事件积木（HAT）

### 定义事件积木

事件积木（帽子积木）在特定事件发生时触发执行。它们的形状像一顶帽子，通常放在脚本的顶部。当事件触发时，会启动一个新的脚本。

#### 示例：按键事件

```javascript
{
  opcode: 'whenKeyPressed',
  blockType: Scratch.BlockType.HAT,
  text: '当按下 [KEY] 键',
  arguments: {
    KEY: {
      type: Scratch.ArgumentType.STRING,
      menu: 'KEYS',
      defaultValue: 'space'
    }
  }
}

// 菜单定义
getInfo() {
  return {
    menus: {
      KEYS: {
        acceptReporters: false,
        items: ['space', 'up', 'down', 'left', 'right']
      }
    },
    blocks: [...]
  };
}

// 实现方法（通常不需要实现，事件由 VM 处理）
whenKeyPressed(args) {
  // 当按下指定键时，这个脚本会自动启动
}
```

#### 事件触发机制

- HAT 积木是"边缘触发"的
- 当条件从 false 变为 true 时触发
- 每次触发都会创建新的线程
- 需要使用 runtime 来监听事件

---

## 高级积木类型

### 循环积木（LOOP）

LOOP 积木用于控制流，可以重复执行子积木。类似于 CONDITIONAL，但每次子分支完成后会再次调用循环积木。

```javascript
{
  opcode: 'repeatForever',
  blockType: Scratch.BlockType.LOOP,
  text: '重复执行',
  branchCount: 1,                 // 子分支数量
  terminal: true,                 // 是否终止堆栈
  arguments: {}
}
```

### 条件积木（CONDITIONAL）

CONDITIONAL 积木用于条件分支，可以根据条件执行不同的子分支。可以返回 1-based 索引来指定运行哪个分支。

```javascript
{
  opcode: 'ifElse',
  blockType: Scratch.BlockType.CONDITIONAL,
  text: '如果 <CONDITION> 那么 [ELSE]',
  branchCount: 2,                 // 两个分支：then 和 else
  arguments: {
    CONDITION: {
      type: Scratch.ArgumentType.BOOLEAN
    },
    ELSE: {
      type: Scratch.ArgumentType.BOOLEAN
    }
  }
}
```

---

# 参数

## 参数类型指南

### 参数类型概览

Scratch 支持多种参数类型，每种类型都有不同的输入界面和用途：

1. **STRING** - 字符串输入
2. **NUMBER** - 数字输入
3. **ANGLE** - 角度输入（带有圆形选择器）
4. **BOOLEAN** - 布尔输入（六边形槽）
5. **COLOR** - 颜色选择器
6. **MATRIX** - 5x5 矩阵
7. **NOTE** - 音符选择器
8. **IMAGE** - 内联图像
9. **COSTUME** - 造型选择
10. **SOUND** - 声音选择

### 参数类型快速参考

```javascript
const ArgumentType = Scratch.ArgumentType;

ArgumentType.STRING    // 字符串输入
ArgumentType.NUMBER    // 数字输入
ArgumentType.ANGLE     // 角度输入
ArgumentType.BOOLEAN   // 布尔输入
ArgumentType.COLOR     // 颜色选择器
ArgumentType.MATRIX    // 5x5 矩阵
ArgumentType.NOTE      // 音符选择器
ArgumentType.IMAGE     // 内联图像
ArgumentType.COSTUME   // 造型选择
ArgumentType.SOUND     // 声音选择
```

---

## 字符串参数（STRING）

### 定义字符串参数

字符串参数接受文本输入，也可以插入其他报告积木。这是最常用的参数类型之一。

#### 示例：打招呼积木

```javascript
{
  opcode: 'sayHello',
  blockType: Scratch.BlockType.COMMAND,
  text: '说 [MESSAGE]',
  arguments: {
    MESSAGE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '你好'
    }
  }
}

sayHello(args) {
  const message = args.MESSAGE;
  console.log(message);
  // 可以访问 runtime 来在 Scratch 中显示消息
  // this.runtime.emit('SAY', target, 'say', message);
}
```

#### 特性说明

- 可接受纯文本输入
- 可插入报告积木
- 适用于名称、消息、路径等文本数据

---

## 数字参数（NUMBER）

### 定义数字参数

数字参数只接受数字输入，包括整数和小数。也可以插入返回数字的报告积木。

#### 示例：数学运算

```javascript
{
  opcode: 'addNumbers',
  blockType: Scratch.BlockType.REPORTER,
  text: '[A] 加 [B]',
  arguments: {
    A: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 10
    },
    B: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 20
    }
  }
}

addNumbers(args) {
  return args.A + args.B;
}
```

#### 特性说明

- 只接受数字输入
- 支持整数和小数
- 可插入数字报告积木
- 适用于计算、坐标、大小等

---

## 角度参数（ANGLE）

### 定义角度参数

角度参数接受 0-360 的角度值，并带有一个圆形的角度选择器 UI。特别适合用于方向和旋转相关的积木。

#### 示例：设置方向

```javascript
{
  opcode: 'setDirection',
  blockType: Scratch.BlockType.COMMAND,
  text: '面向 [DIRECTION] 度',
  arguments: {
    DIRECTION: {
      type: Scratch.ArgumentType.ANGLE,
      defaultValue: 90
    }
  }
}

setDirection(args) {
  const direction = args.DIRECTION;
  // 设置角色方向
  const target = this.runtime.editingTarget;
  if (target && !target.isStage) {
    target.direction = direction;
  }
}
```

---

## 布尔参数（BOOLEAN）

### 定义布尔参数

布尔参数接受六边形的布尔报告积木。这个输入槽不能直接输入值，只能插入布尔积木。

#### 示例：逻辑运算

```javascript
{
  opcode: 'notOperator',
  blockType: Scratch.BlockType.BOOLEAN,
  text: '不 [CONDITION]',
  arguments: {
    CONDITION: {
      type: Scratch.ArgumentType.BOOLEAN
    }
  }
}

notOperator(args) {
  return !args.CONDITION;
}
```

#### 使用场景

- 逻辑运算（与、或、非）
- 条件组合
- 只能插入布尔报告积木
- 不能直接输入值

---

## 颜色参数（COLOR）

### 定义颜色参数

颜色参数显示一个颜色样本，点击可以打开颜色选择器，可以选择色相、饱和度和亮度。

#### 示例：设置颜色

```javascript
{
  opcode: 'setPenColor',
  blockType: Scratch.BlockType.COMMAND,
  text: '将画笔颜色设为 [COLOR]',
  arguments: {
    COLOR: {
      type: Scratch.ArgumentType.COLOR,
      defaultValue: '#FF6680'
    }
  }
}

setPenColor(args) {
  const color = args.COLOR;
  // color 是十六进制颜色值，如 #FF6680
  console.log('设置颜色为:', color);
}
```

#### 颜色值格式

- 返回十六进制颜色值（如 #FF6680）
- 可以设置默认颜色
- 如果不设置默认值，会使用随机颜色

---

## 矩阵参数（MATRIX）

### 定义矩阵参数

矩阵参数显示一个 5x5 的格子矩阵，每个格子可以填充或清除。适用于 LED 矩阵或图案相关的功能。

#### 示例：显示图案

```javascript
{
  opcode: 'showMatrix',
  blockType: Scratch.BlockType.COMMAND,
  text: '显示图案 [MATRIX]',
  arguments: {
    MATRIX: {
      type: Scratch.ArgumentType.MATRIX,
      defaultValue: '01110,01110,01110,01110,01110'
    }
  }
}

showMatrix(args) {
  const matrix = args.MATRIX;
  // matrix 是一个字符串，每行用逗号分隔
  // 0 表示关闭，1 表示开启
  const rows = matrix.split(',');
  console.log('显示图案:', rows);
}
```

#### 矩阵格式

- 5x5 的格子矩阵
- 返回逗号分隔的字符串
- 每个字符表示一个格子的状态（0 或 1）

---

## 音符参数（NOTE）

### 定义音符参数

音符参数显示一个虚拟键盘，可以选择音符。特别适合音乐相关的扩展。

#### 示例：播放音符

```javascript
{
  opcode: 'playNote',
  blockType: Scratch.BlockType.COMMAND,
  text: '演奏音符 [NOTE] [BEATS] 拍',
  arguments: {
    NOTE: {
      type: Scratch.ArgumentType.NOTE,
      defaultValue: 60  // 中央 C
    },
    BEATS: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 0.5
    }
  }
}

playNote(args) {
  const note = args.NOTE;
  const beats = args.BEATS;
  // note 是 MIDI 音符编号（0-127）
  console.log(`播放音符 ${note}，时长 ${beats} 拍`);
}
```

---

## 内联图像参数（IMAGE）

### 定义内联图像

内联图像不是真正的参数，而是在积木上显示的图像。它不表示值，也不接受其他积木插入。

#### 示例：带图标的积木

```javascript
{
  opcode: 'showIcon',
  blockType: Scratch.BlockType.COMMAND,
  text: '显示图标 [ICON]',
  arguments: {
    ICON: {
      type: Scratch.ArgumentType.IMAGE,
      dataURI: 'data:image/svg+xml;base64,...',  // 图像的 Data URI
      alt: '我的图标',                            // 替代文本
      flipRTL: false                               // RTL 语言时是否翻转
    }
  }
}
```

#### 注意事项

- IMAGE 不是真正的参数
- 不表示值，不接受其他积木
- 需要提供 dataURI
- 可选设置 flipRTL

---

## 造型参数（COSTUME）

### 定义造型参数

造型参数显示一个下拉菜单，可以选择当前目标的造型。

#### 示例：切换造型

```javascript
{
  opcode: 'switchCostume',
  blockType: Scratch.BlockType.COMMAND,
  text: '切换到造型 [COSTUME]',
  arguments: {
    COSTUME: {
      type: Scratch.ArgumentType.COSTUME
    }
  }
}

switchCostume(args) {
  const costumeName = args.COSTUME;
  const target = this.runtime.editingTarget;
  if (target && !target.isStage) {
    // 查找并切换到指定造型
    const costumeIndex = target.getCostumeIndexByName(costumeName);
    if (costumeIndex !== -1) {
      target.setCostume(costumeIndex);
    }
  }
}
```

---

## 声音参数（SOUND）

### 定义声音参数

声音参数显示一个下拉菜单，可以选择当前目标的声音。

#### 示例：播放声音

```javascript
{
  opcode: 'playSound',
  blockType: Scratch.BlockType.COMMAND,
  text: '播放声音 [SOUND]',
  arguments: {
    SOUND: {
      type: Scratch.ArgumentType.SOUND
    }
  }
}

playSound(args) {
  const soundName = args.SOUND;
  const target = this.runtime.editingTarget;
  if (target) {
    // 查找并播放指定声音
    const sound = target.sprite.sounds.find(s => s.name === soundName);
    if (sound) {
      target.audioEngine.playSound(target, sound.name);
    }
  }
}
```

---

# Suratch-VM

## Scratch-VM API

### Runtime 对象详解

Runtime 是 Scratch 虚拟机的核心对象，管理着所有目标、线程、变量等。扩展通过 `this.runtime` 可以访问虚拟机的所有功能。

#### 基本用法

```javascript
constructor(runtime) {
  // 存储 runtime 引用
  this.runtime = runtime;
}

// 在积木方法中使用 runtime
myMethod(args) {
  // 获取目标、线程等信息
  const target = this.runtime.getEditingTarget();
  const threads = this.runtime.threads;

  // 触发事件
  this.runtime.emit('MY_EVENT', data);
}
```

#### Runtime 常用属性和方法

- **targets** - 所有目标的数组
- **executableTargets** - 可执行目标的数组
- **threads** - 当前运行的线程数组
- **getEditingTarget()** - 获取当前编辑的目标
- **getTargetForStage()** - 获取舞台目标
- **ioDevices** - I/O 设备（键盘、鼠标等）
- **sequencer** - 脚本序列器

---

## 访问角色（Target）

### 获取当前角色

Target 对象代表一个角色或舞台，包含角色的所有属性和方法。

#### 常用 Target 属性和方法

```javascript
// 获取当前编辑的目标
const target = this.runtime.getEditingTarget();

// 角色基本信息
const name = target.getName();           // 角色名称
const x = target.x;                       // X 坐标
const y = target.y;                       // Y 坐标
const direction = target.direction;       // 方向（0-360）
const size = target.size;                 // 大小（百分比）
const visible = target.visible;           // 是否可见
const isStage = target.isStage;           // 是否是舞台

// 造型相关
const costumes = target.getCostumes();    // 获取所有造型
const currentCostume = target.currentCostume;  // 当前造型
target.setCostume(index);                 // 设置造型

// 声音相关
const sounds = target.getSounds();        // 获取所有声音

// 变量相关
const variables = target.variables;       // 变量对象
const localVar = target.lookupVariableByNameAndType('变量名', '');  // 查找局部变量

// 线程相关
const threads = this.runtime.threads.filter(t => t.target === target);
```

#### 获取特定目标

```javascript
// 获取舞台
const stage = this.runtime.getTargetForStage();

// 遍历所有目标
const allTargets = this.runtime.targets;
for (const target of allTargets) {
  if (!target.isStage) {
    // 这是一个角色
    console.log(target.getName());
  }
}
```

---

## 操作变量

### 读取变量

可以通过 Target 对象读取和修改变量。变量可以是全局的（舞台）或局部的（角色）。

#### 读写变量示例

```javascript
const target = this.runtime.getEditingTarget();

// 查找变量（先在局部找，再在全局找）
// 参数：变量名，类型（''=普通变量，'list'=列表变量）
let variable = target.lookupVariableByNameAndType('我的变量', '');

// 检查是否是云变量
if (variable && variable.isCloud) {
  // 这是云变量
}

// 读取变量值
const value = variable ? variable.value : null;

// 修改变量值
if (variable) {
  variable.value = 100;
}

// 创建新变量
const newVar = target.createVariable('新变量', '变量名', '', false);  // false = 非云变量

// 获取舞台变量（全局变量）
const stage = this.runtime.getTargetForStage();
const globalVar = stage.lookupVariableByNameAndType('全局变量', '');
if (globalVar) {
  globalVar.value = '新值';
}
```

#### 变量类型

变量可以是以下类型：

- 普通变量（空字符串类型）
- 列表变量（list 类型）
- 广播消息（broadcast_msg 类型）

---

## 广播消息

### 发送广播

可以通过 runtime 发送广播消息，触发所有"当接收到消息"的帽子积木。

#### 发送广播示例

```javascript
// 方法 1：使用 startHats
const stage = this.runtime.getTargetForStage();
this.runtime.startHats('event_whenbroadcastreceived', {
  BROADCAST_OPTION: '我的消息'
});

// 方法 2：查找广播变量并发送
const stage = this.runtime.getTargetForStage();
const broadcastVar = stage.lookupBroadcastMsg(null, '我的消息');
if (broadcastVar) {
  this.runtime.startHats('event_whenbroadcastreceived', {
    BROADCAST_OPTION: broadcastVar.name
  });
}

// 方法 3：创建广播并发送
const stage = this.runtime.getTargetForStage();
const newBroadcast = stage.createVariable(
  '新消息',
  'broadcast_msg'  // 广播消息类型
);
this.runtime.startHats('event_whenbroadcastreceived', {
  BROADCAST_OPTION: newBroadcast.name
});
```

---

## 使用事件（Events）

### Runtime 事件

Runtime 是一个事件发射器，可以触发和监听各种事件。

#### 常用事件

```javascript
// 触发事件
this.runtime.emit('MY_EVENT', data);

// 监听事件
this.runtime.on('MY_EVENT', (data) => {
  console.log('收到事件:', data);
});

// 移除监听器
const listener = (data) => { /* ... */ };
this.runtime.on('MY_EVENT', listener);
// ...
this.runtime.removeListener('MY_EVENT', listener);

// 常用预定义事件
this.runtime.emit('PROJECT_START');           // 项目开始
this.runtime.emit('PROJECT_RUN_START');       // 运行开始
this.runtime.emit('PROJECT_RUN_STOP');        // 运行停止
this.runtime.emit('TURBO_MODE_ON');           // 开启加速模式
this.runtime.emit('TURBO_MODE_OFF');          // 关闭加速模式
this.runtime.emit('MONITORS_UPDATE', data);   // 更新监视器
```

---

## 访问 I/O 设备

### 可用的 I/O 设备

Runtime 提供了访问各种输入/输出设备的接口。

#### 常用设备示例

```javascript
// 访问键盘
const keyboard = this.runtime.ioDevices.keyboard;
const isPressed = keyboard.getKeyIsDown('space');

// 访问鼠标
const mouse = this.runtime.ioDevices.mouse;
const x = mouse.getScratchX();      // Scratch 坐标系的 X
const y = mouse.getScratchY();      // Scratch 坐标系的 Y
const isDown = mouse.getIsDown();   // 鼠标是否按下

// 访问时钟
const clock = this.runtime.ioDevices.clock;
const timer = clock.projectTimer();  // 项目运行时间（秒）

// 访问视频（摄像头）
const video = this.runtime.ioDevices.video;
// 获取视频帧等

// 访问用户数据
const userData = this.runtime.ioDevices.userData;
// 获取用户名、角色 ID 等

// 访问云变量
const cloud = this.runtime.ioDevices.cloud;
const hasCloudData = cloud.hasCloudData();  // 是否有云数据连接
```

---

## 最佳实践

### 命名规范

- **扩展 ID**：使用小写字母和数字，如 `myextension`
- **类名**：使用大驼峰，如 `MyExtension`
- **方法名**：使用小驼峰，如 `myMethod`
- **常量**：使用大写下划线，如 `MAX_VALUE`

### 错误处理

```javascript
// 始终检查 null/undefined
const target = this.runtime.getEditingTarget();
if (!target) return;

// 检查角色是否是舞台
if (target.isStage) {
  // 某些操作只适用于角色
}

// 提供默认值
const value = args.VALUE || defaultValue;

// 捕获错误
try {
  // 可能失败的代码
} catch (error) {
  console.error('扩展错误:', error);
}
```

### 性能优化

- 避免在循环中创建对象
- 缓存常用引用
- 使用事件而不是轮询
- 限制计算复杂度

---

## 兼容性考虑

### 向后兼容

Scratch 设计为完全向后兼容。积木定义和 opcode 永远不应该改变，以免导致之前保存的项目无法加载。

#### 兼容性清单

- 不要更改现有积木的 opcode
- 不要更改积木的类型
- 不要移除积木参数
- 如果需要更改，创建新的积木
- 保持默认值不变

### 跨平台兼容

- 确保代码在所有浏览器中运行
- 测试移动设备
- 考虑不同的屏幕尺寸
- 处理触摸事件

---

## 消息格式化

### 使用 formatMessage

对于需要国际化的扩展，可以使用 `formatMessage` 函数来格式化消息。

#### 示例

```javascript
// 引入 formatMessage（仅适用于核心/团队/官方扩展）
const formatMessage = require('format-message');

getInfo() {
  return {
    name: formatMessage({
      id: 'extensionName',
      defaultMessage: 'My Extension',
      description: 'The name of the extension'
    }),
    blocks: [
      {
        text: formatMessage({
          id: 'blockText',
          defaultMessage: 'Hello [NAME]',
          description: 'Text for the hello block'
        }),
        arguments: {
          NAME: {
            defaultValue: formatMessage({
              id: 'nameDefault',
              defaultMessage: 'World',
              description: 'Default name'
            })
          }
        }
      }
    ]
  };
}
```

---

## 扩展翻译

### 使用 translation_map

可以在扩展内部定义翻译映射，为不同语言提供翻译。

#### 示例

```javascript
getInfo() {
  return {
    name: 'My Extension',
    blocks: [...],
    translation_map: {
      zh: {  // 中文
        'extensionName': '我的扩展',
        'blockText': '你好 [NAME]',
        'nameDefault': '世界'
      },
      es: {  // 西班牙语
        'extensionName': 'Mi Extensión',
        'blockText': 'Hola [NAME]',
        'nameDefault': 'Mundo'
      }
    }
  };
}
```

---

## 沙箱环境

### 沙箱模式

扩展可以在沙箱中运行，此时 runtime 是一个异步代理对象。需要使用 await 来访问异步方法。

#### 兼容性建议

```javascript
// 沙箱兼容的代码
async myMethod(args) {
  // 在沙箱中，runtime 方法可能是异步的
  const target = await this.runtime.getEditingTarget();
  const stage = this.runtime.getTargetForStage();

  // 使用变量查找方法
  const variable = target.lookupVariableByNameAndType('变量名', '');
}

// 非沙箱环境会自动处理异步/同步
```

#### 注意事项

- 核心扩展可以使用 require 引入 VM 代码
- 非官方扩展必须自包含
- 需要确保浏览器兼容性（ES5）
- 使用 async/await 确保沙箱兼容
