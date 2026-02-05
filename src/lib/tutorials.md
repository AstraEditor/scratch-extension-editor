# Getting Started

## Minimal Extension

### What You Need

This editor is designed for **TurboWarp-style unsandboxed extensions**: you write JavaScript, then load it into the VM.

- Your code must register via `Scratch.extensions.register(new MyExtension())`.
- Your extension must implement `getInfo()` and return `id`, `name`, and `blocks`.

### Minimal Template (Recommended)

```javascript
(function (Scratch) {
  "use strict";           // ① Use strict mode to avoid common errors
  
  const BlockType = Scratch.BlockType;       // ② Import block type constants
  const ArgumentType = Scratch.ArgumentType; // ③ Import argument type constants

  class MyExtension {        // ④ Create extension class
    constructor() {
      // Only available in TurboWarp/unsandboxed environment:
      this.runtime = Scratch.vm && Scratch.vm.runtime;
    }

    getInfo() {             // ⑤ Required method, returns extension info
      return {
        id: "myextension",   // Unique identifier, no spaces or uppercase
        name: "My Extension", // Display name
        color1: "#FF6680",     // Primary color
        color2: "#FF4D6A",     // Secondary color
        color3: "#CC3D55",     // Border color
        blocks: [             // ⑥ Define block list
          {
            opcode: "hello",   // Unique block identifier
            blockType: BlockType.COMMAND, // Block type: command block
            text: "say hello [NAME]", // Block text, [NAME] is parameter placeholder
            arguments: {         // ⑦ Define arguments
              NAME: {
                type: ArgumentType.STRING,  // Parameter type: string
                defaultValue: "world"          // Default value
              }
            }
          }
        ]
      };
    }

    hello(args) {            // ⑧ Method called when block executes
      console.log("Hello, " + args.NAME);  // Output greeting to console
    }
  }

  // ⑧ Register extension to Scratch
  Scratch.extensions.register(new MyExtension());
})(Scratch);
```

### Common Mistakes

- Forgetting the IIFE wrapper: `((Scratch) => { ... })(Scratch)`
- Using an invalid `id` (must be unique; avoid spaces and uppercase)
- Registering too late (only register once per load)

## Hot Reload & Multiple Loads

### Why It Sometimes "Loads Twice"

When you click **Run** multiple times, the VM will:

1) unload the previous extension (if possible),
2) then load the new code.

If your extension writes to global scope (e.g. `window.foo = ...`), you may see weird behavior.

### Recommended Pattern

- Keep everything inside the IIFE.
- Avoid global variables.
- Use `Scratch.vm`/`Scratch.renderer` only when needed.

# Scratch API

## Scratch Object Overview

### What TurboWarp Injects

In TurboWarp's unsandboxed extension environment, the VM injects a global `Scratch` object with the following API.
This list comes from TurboWarp's VM implementation:

- `scratch-vm/src/extension-support/tw-extension-api-common.js`
- `scratch-vm/src/extension-support/tw-unsandboxed-extension-runner.js`
- `scratch-vm/src/extension-support/tw-external.js`

### Constants & Utilities

These are always available in unsandboxed extensions:

- `Scratch.ArgumentType`
- `Scratch.BlockType`
- `Scratch.BlockShape`
- `Scratch.TargetType`
- `Scratch.Cast`
- `Scratch.external` (see below)

### Registering Your Extension

TurboWarp injects:

- `Scratch.extensions.unsandboxed === true`
- `Scratch.extensions.register(extensionObject)`

Also, TurboWarp provides a ScratchX compatibility global:

- `ScratchExtensions` (legacy ScratchX-like API)

### VM & Renderer

Unsandboxed extensions can access:

- `Scratch.vm` (VirtualMachine instance)
- `Scratch.renderer` (renderer instance; usually `Scratch.vm.runtime.renderer`)

Important: `Scratch.vm` and `Scratch.renderer` are **powerful but not stable public APIs**. Prefer normal block APIs when possible.

### Translation

- `Scratch.translate(...)`

You can use it to make blocks localizable (advanced usage).

## Permissions & Safe Capabilities

### Permission Checks (can*)

TurboWarp exposes async permission checks:

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

These return `Promise<boolean>`.

### Actions (fetch/openWindow/redirect/download)

TurboWarp provides safe wrappers that enforce the permission checks:

- `Scratch.fetch(url, options)` (like `fetch`, but checks `Scratch.canFetch`)
- `Scratch.openWindow(url, features)` (opens a new tab; checks `Scratch.canOpenWindow`)
- `Scratch.redirect(url)` (changes `location.href`; checks `Scratch.canRedirect`)
- `Scratch.download(url, name)` (downloads via `<a download>`; checks `Scratch.canDownload`)

Example:

```javascript
async function getText(url) {
  const res = await Scratch.fetch(url);
  return res.text();
}
```

Note:

- URLs are resolved against the current page (`new URL(url, location.href)`).
- `javascript:` URLs are always rejected for open/redirect/download.

## Scratch.external

### What It Is

`Scratch.external` is a small helper set for loading external resources/modules.

It includes:

- `Scratch.external.importModule(url)` -> `import(url)` (requires **absolute** URL)
- `Scratch.external.fetch(url)` -> `fetch(url)` with basic HTTP error handling
- `Scratch.external.dataURL(url)` -> fetch -> convert to `data:` URL
- `Scratch.external.blob(url)` -> fetch -> `Blob`
- `Scratch.external.evalAndReturn(url, returnExpression)` -> fetch JS -> `new Function(...)`

### URL Rules (Very Important)

TurboWarp requires the URL to start with one of:

- `http:`
- `https:`
- `data:`
- `blob:`

Relative URLs are rejected.

### Example: Import an ES Module

```javascript
const {default: md5} = await Scratch.external.importModule(
  "https://cdn.jsdelivr.net/npm/blueimp-md5@2.19.0/js/md5.min.js"
);
console.log(md5("hello"));
```

# Blocks & getInfo()

## Defining Blocks

### BlockType Quick Reference

```javascript
const BlockType = Scratch.BlockType;

BlockType.COMMAND     // Command block (hexagon)
BlockType.REPORTER    // Reporter block (oval, returns value)
BlockType.BOOLEAN     // Boolean block (hexagon, returns true/false)
BlockType.HAT         // Event block (hat shape)
BlockType.EVENT       // Event block (hat shape)
BlockType.LOOP        // Loop block (C shape)
BlockType.CONDITIONAL // Conditional block (C shape)
BlockType.BUTTON      // Button block (clickable)
BlockType.LABEL       // Label block (static text)
BlockType.XML         // Custom XML block
```

### ArgumentType Quick Reference

```javascript
const ArgumentType = Scratch.ArgumentType;

ArgumentType.STRING   // String type
ArgumentType.NUMBER   // Number type
ArgumentType.BOOLEAN  // Boolean type
ArgumentType.ANGLE    // Angle type (0-360)
ArgumentType.COLOR    // Color type
ArgumentType.MATRIX   // Matrix type
ArgumentType.NOTE     // Note type
ArgumentType.IMAGE    // Image type
ArgumentType.COSTUME  // Costume type
ArgumentType.SOUND    // Sound type
```

## Menus

### Static Menu

```javascript
class MyExtension {
  getInfo() {
      return {
        id: "fruitpicker",
        name: "Fruit Picker",
        color1: "#FF9800",
        color2: "#F57C00",
        color3: "#E65100",
        blocks: [
          {
            opcode: "pickFruit",
            blockType: Scratch.BlockType.COMMAND,
            text: "pick [FRUIT]",
            arguments: {
              FRUIT: {
                type: Scratch.ArgumentType.STRING,
                menu: "fruitMenu"  // Reference menu
              }
            }
          }
        ],
        menus: {
          fruitMenu: ["apple", "banana", "orange", "grape", "watermelon"]
        }
      };
    }
    
    pickFruit(args) {
      console.log("You picked: " + args.FRUIT);
    }
  }
}
```

Key points:

- `menu: "fruitMenu"` makes the argument a dropdown menu
- `menus` object defines menu options
- Menu options must be an array

### Dynamic Menu (Function)

```javascript
class DynamicMenuExtension {
  getInfo() {
    return {
      id: "dynamic",
      name: "Dynamic Menu",
      color1: "#4CAF50",
      color2: "#388E3C",
      color3: "#2E7D32",
      blocks: [
        {
          opcode: "listVars",
          blockType: Scratch.BlockType.REPORTER,
          text: "all variable list",
          disableMonitor: true
        }
      ]
    };
  }

  listVars() {
    // Get all variables
    const stage = Scratch.vm.runtime.getTargetForStage();
    const variables = stage.variables;
    
    // Extract variable names
    const varNames = Object.keys(variables);
    return varNames.join(", ");
  }
}
```

# VM & Runtime (Advanced)

## Accessing the Runtime

### Scratch.vm.runtime

In unsandboxed mode, you can access:

```javascript
const vm = Scratch.vm;
const runtime = vm && vm.runtime;
```

This lets you interact with targets, threads, and internal VM state.

Warning:

- Many runtime APIs are not considered stable.
- Prefer public extension APIs when possible.

## Common Patterns

### Get the Stage Target

```javascript
const stage = Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.getTargetForStage();
```

### Read Variable Values

```javascript
class VariableExtension {
  constructor(runtime) {
    this.runtime = runtime;
  }

  getInfo() {
    return {
      id: "varreader",
      name: "Variable Reader",
      color1: "#2196F3",
      color2: "1976D2",
      color3: "#0D47A1",
      blocks: [
        {
          opcode: "getVar",
          blockType: Scratch.BlockType.REPORTER,
          text: "variable [VAR] value",
          arguments: {
            VAR: {
              type: Scratch.ArgumentType.STRING,
              menu: "variableMenu"
            }
          }
        }
      ],
      menus: {
        variableMenu: null  // Will be dynamically generated
      }
    };
  }

  getVar(args) {
    // Get stage
    const stage = Scratch.vm.runtime.getTargetForStage();
    
    // Find variable
    const variable = stage.lookupVariableByName(args.VAR);
    
    if (variable) {
      return variable.value;
    }
    return "";
  }
}
```

### Modify Variable Values

```javascript
setVar(args) {
  const stage = Scratch.vm.runtime.getTargetForStage();
  const variable = stage.lookupVariableByName(args.VAR);
  
  if (variable) {
    variable.value = args.VALUE;
  }
}
```

### Interact with Sprites

```javascript
class SpriteInteraction {
  getInfo() {
    return {
      id: "spritehelper",
      name: "Sprite Helper",
      color1: "#E91E63",
      color2: "#C2185B",
      color3: "#880E4F",
      blocks: [
        {
          opcode: "getSpriteX",
          blockType: Scratch.REPORTER,
          text: "[SPRITE] x position",
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
          text: "move [SPRITE] to x: [X] y: [Y]",
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
        spriteMenu: null  // Dynamically generated
      }
    };
  }

  // Get all sprite names
  spriteMenu() {
    const stage = Scratch.vm.runtime.getTargetForStage();
    const sprites = Scratch.vm.runtime.targets;
    
    // Filter out stage, keep only sprites
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

### List All Targets

```javascript
const targets = Scratch.vm.runtime.targets;
console.log(targets.map(t => t.getName ? t.getName() : t.sprite && t.sprite.name));
```

### Refresh Blocks UI (Host-dependent)

Some hosts expose helpers:

- `Scratch.vm.refreshWorkspace()`
- `Scratch.vm.emitWorkspaceUpdate()`

If your host provides them, they can be used after loading/unloading extensions.

# Debugging & Publishing

## Debugging Tips

### Worker/Chunk Problems

If syntax highlighting does not work:

- Make sure `ts.worker.js` and `editor.worker.js` are accessible.
- Make sure the host sets `window.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__` to the folder containing those files.

### Use the Console

Use `console.log`, `console.warn`, and `console.error` in block implementations. TurboWarp will show them in DevTools.

### Validate Data

```javascript
checkNumber(args) {
  if (typeof args.NUM !== "number") {
    console.warn("Warning: parameter is not a number type");
    return 0;
  }
  if (isNaN(args.NUM)) {
    console.warn("Warning: parameter is NaN");
    return 0;
  }
  return args.NUM * 2;
}
```

### Error Handling

```javascript
async riskyOperation() {
  try {
    // Code that might fail
    const result = await Scratch.fetch(url);
    return result;
  } catch (error) {
    console.error("Operation failed:", error);
    return "error";
  }
}
```

## Publishing Your Extension

### Test Your Extension

- Make sure all blocks work correctly
- Test edge cases (null values, invalid values)
- Check console for errors

### Optimize Code

- Remove debug console.log statements
- Add necessary comments
- Ensure code formatting is correct

### Export as .js

This editor can export your code as a `.js` file. You can then:

- host it on a static server (GitHub Pages, etc.),
- load it by URL in your editor,
- or bundle it into your own mod.

### Common Questions

**Why are my blocks not showing?**

Check the following:

- Did you correctly register the extension
- Is `id` unique
- Does `getInfo()` return the correct object
- Are there any syntax errors

**How to get a specific sprite's variable?**

```javascript
const target = Scratch.vm.runtime.getTargetByName("sprite name");
const variable = target.lookupVariableByName("variable name");
```

**Can I create custom UI?**

Yes, but this is an advanced topic. You can create:

- Custom modals
- Settings pages
- Tool panels

Need to deeply understand TurboWarp's internal API.

**How to listen to project state changes?**

Use runtime events:

```javascript
this.runtime.on("PROJECT_START", () => {
  console.log("Project started running");
});

this.runtime.on("PROJECT_STOP", () => {
  console.log("Project stopped running");
});
```

### Next Steps

Now you have mastered the basics of extension development! Continue learning:

- Check API documentation for more available features
- Try creating different types of blocks
- Explore advanced interaction features
- Share your creations with the community

Happy coding!