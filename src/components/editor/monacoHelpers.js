import { applyLanguageServiceSettings, VSCODE_DARK_PLUS } from './monacoConfig.js';
import VMAPI from './vm-api.js';
import VMAPI_CN from './vm-api-cn.js';
import SCRATCH_API from './scratch-api.js';
import SCRATCH_API_CN from './scratch-api-cn.js';
import { BlockType, InputType } from '../../lib/blockSvgRenderer.js';

export const FUNCTION_BODY_DIAGNOSTIC_CODES = [1108];
export const ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES = [1308, 1375, 1378];

const READONLY_DIAGNOSTIC_OPTIONS = {
    noSemanticValidation: true,
    noSuggestionDiagnostics: true
};

const sharedExtraLibRegistryRef = { current: [] };

const getLanguageApiLibs = () => {
    switch (localStorage.getItem('app_language')) {
        case 'zh':
            return [
                { path: 'file:///types/vm-api.d.ts', content: VMAPI_CN },
                { path: 'file:///types/scratch-api.d.ts', content: SCRATCH_API_CN }
            ];
        default:
            return [
                { path: 'file:///types/vm-api.d.ts', content: VMAPI },
                { path: 'file:///types/scratch-api.d.ts', content: SCRATCH_API }
            ];
    }
};

export const defineEditorTheme = (monaco) => {
    monaco.editor.defineTheme('vscode-dark-plus', VSCODE_DARK_PLUS);
};

export const getFunctionBodyDiagnosticCodes = (block = null) => [
    ...FUNCTION_BODY_DIAGNOSTIC_CODES,
    ...(block?.blockConfig?.isAsync ? ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES : [])
];

export const configureScratchMonaco = (
    monaco,
    monacoConfig,
    {
        block = null,
        ignoredCodes = getFunctionBodyDiagnosticCodes(block),
        baseDiagnosticsOptions = {},
        readOnly = false
    } = {}
) => {
    defineEditorTheme(monaco);
    applyEditorDiagnostics(monaco, monacoConfig, {
        ignoredCodes,
        baseDiagnosticsOptions: {
            ...(readOnly ? READONLY_DIAGNOSTIC_OPTIONS : {}),
            ...baseDiagnosticsOptions
        }
    });
    monaco.editor.setTheme(monacoConfig.theme || 'vscode-dark-plus');
};

export const applyEditorDiagnostics = (
    monaco,
    monacoConfig,
    {
        ignoredCodes = [],
        baseDiagnosticsOptions = {}
    } = {}
) => {
    applyLanguageServiceSettings(monaco, monacoConfig);
    const userOptions = monacoConfig.languageService?.diagnosticsOptions || {};
    const currentCodes = Array.isArray(userOptions.diagnosticCodesToIgnore)
        ? userOptions.diagnosticCodesToIgnore
        : [];
    const diagnosticCodesToIgnore = Array.from(new Set([
        ...currentCodes,
        ...ignoredCodes
    ]));

    const diagnosticsOptions = {
        ...userOptions,
        ...baseDiagnosticsOptions,
        diagnosticCodesToIgnore
    };

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
};

export const disposeExtraLibs = (registryRef) => {
    if (!registryRef?.current) return;
    registryRef.current.forEach(disposable => disposable?.dispose?.());
    registryRef.current = [];
};

export const syncExtraLibs = (monaco, registryRef, entries) => {
    disposeExtraLibs(registryRef);

    const nextRegistry = [];
    const defaultsList = [
        monaco.languages.typescript.javascriptDefaults,
        monaco.languages.typescript.typescriptDefaults
    ];

    entries
        .filter(entry => entry?.path && typeof entry.content === 'string' && entry.content.trim())
        .forEach(entry => {
            defaultsList.forEach(defaults => {
                nextRegistry.push(defaults.addExtraLib(entry.content, entry.path));
            });
        });

    registryRef.current = nextRegistry;
};

export const syncScratchMonacoExtraLibs = (monaco, entries) => {
    syncExtraLibs(monaco, sharedExtraLibRegistryRef, entries);
};

const isValidIdentifier = (value) => /^[A-Za-z_$][\w$]*$/.test(value);

const toSafeIdentifier = (value, fallback = 'ExtensionContext') => {
    const base = String(value || fallback)
        .replace(/[^\w$]/g, '_')
        .replace(/^([^A-Za-z_$])/, '_$1');
    return isValidIdentifier(base) ? base : fallback;
};

const getBlockEntries = (blocks) => Object.entries(blocks || {})
    .filter(([, block]) => block && block !== '---' && typeof block === 'object');

export const getOpcodeIdentifiers = (blocks, extensionId) => getBlockEntries(blocks)
    .map(([name]) => `${extensionId || 'extension'}_${name}`);

export const getBlockInputIdentifiers = (block) => {
    const inputIds = [];
    let inputIdx = 0;

    (block?.parts || []).forEach(part => {
        if (typeof part === 'object' && part !== null) {
            inputIds.push(part.id || `input_${inputIdx}`);
            inputIdx += 1;
        }
    });

    return inputIds;
};

export const getScratchEditorIdentifiers = ({
    block = null,
    blocks = {},
    extensionId = 'extension',
    includeBlockInputs = false
}) => [
    ...(includeBlockInputs ? getBlockInputIdentifiers(block) : []),
    ...getOpcodeIdentifiers(blocks, extensionId)
];

export const buildOpcodeDefinitions = (blocks, extensionId) => {
    const lines = [];
    getBlockEntries(blocks).forEach(([name]) => {
        const opcode = `${extensionId || 'extension'}_${name}`;
        if (!isValidIdentifier(opcode)) return;
        lines.push('/**');
        lines.push(` * Return the opcode of the block`);
        lines.push(` * @returns {string} "${opcode}"`);
        lines.push(' */');
        lines.push(`declare const ${opcode}: "${opcode}";`);
    });
    return lines.join('\n');
};

export const buildBlockInputDefinitions = (block, translateType) => {
    if (!block?.parts) return '';

    const inputDefs = [];
    let hasDropdownInput = false;
    let inputIdx = 0;

    block.parts.forEach(part => {
        if (typeof part !== 'object' || part === null) return;

        const inputId = part.id || `input_${inputIdx}`;
        if (!isValidIdentifier(inputId)) {
            inputIdx += 1;
            return;
        }
        const inputType = part.inputType;
        let typeStr = 'any';

        if (
            inputType === InputType.NUMBER ||
            inputType === InputType.ANGLE ||
            inputType === InputType.NOTE
        ) {
            typeStr = 'number';
        } else if (
            inputType === InputType.TEXT ||
            inputType === InputType.TEXT_NUMBER ||
            inputType === InputType.COLOR ||
            inputType === InputType.MATRIX ||
            inputType === InputType.COSTUME ||
            inputType === InputType.SOUND
        ) {
            typeStr = 'string';
        } else if (inputType === InputType.BOOLEAN) {
            typeStr = 'boolean';
        } else if (
            inputType === InputType.DROPDOWN ||
            inputType === InputType.DROPDOWN_READONLY
        ) {
            typeStr = 'scratchDropdown';
            hasDropdownInput = true;
        }

        inputDefs.push('/**');
        inputDefs.push(` * Type: ${translateType(inputType)}`);
        if (inputType !== InputType.BOOLEAN) {
            inputDefs.push(` * Default Value: ${String(part.value ?? '')}`);
        }
        inputDefs.push(' */');
        inputDefs.push(`declare let ${inputId}: ${typeStr};`);
        inputIdx += 1;
    });

    if (hasDropdownInput) {
        inputDefs.unshift('type scratchDropdown = string | number | boolean;');
    }
    inputDefs.push('/**');
    inputDefs.push(' * This Block Inputs');
    inputDefs.push(' */');
    inputDefs.push('declare const args: Record<string, any>;');
    return inputDefs.join('\n');
};

const buildBlockInputAssignments = (block) => {
    const lines = [];
    let inputIdx = 0;

    (block?.parts || []).forEach(part => {
        if (typeof part !== 'object' || part === null) return;

        const inputId = part.id || `input_${inputIdx}`;
        if (isValidIdentifier(inputId)) {
            lines.push(`const ${inputId} = args[${JSON.stringify(inputId)}];`);
        }
        inputIdx += 1;
    });

    return lines;
};

const getClassMethodName = (name) => isValidIdentifier(name)
    ? name
    : `[${JSON.stringify(name)}]`;

export const buildExtensionProgramLib = ({
    blocks = {},
    extensionId = 'extension',
    publicJS = ''
}) => {
    const blockEntries = getBlockEntries(blocks);
    const hasBlockPrograms = blockEntries.some(([, block]) => typeof block.code === 'string' && block.code.trim());
    if (!hasBlockPrograms && !publicJS?.trim()) return '';

    const className = toSafeIdentifier(extensionId, 'ExtensionContext');
    const lines = [
        '/* Generated Monaco context for the whole extension. */',
        'const VM = Scratch.vm;'
    ];

    getOpcodeIdentifiers(blocks, extensionId)
        .filter(isValidIdentifier)
        .forEach(opcode => {
            lines.push(`const ${opcode} = ${JSON.stringify(opcode)};`);
        });

    if (publicJS?.trim()) {
        lines.push('// Public JS');
        lines.push(publicJS);
    }

    lines.push(`class ${className} {`);
    blockEntries.forEach(([name, block]) => {
        if (block.type === BlockType.LABEL) return;
        const asyncKeyword = block.blockConfig?.isAsync ? 'async ' : '';
        lines.push(`${asyncKeyword}${getClassMethodName(name)}(args = {}) {`);
        lines.push(...buildBlockInputAssignments(block));
        if (block.code) {
            lines.push(block.code);
        }
        lines.push('}');
    });
    lines.push('}');
    lines.push(`const __astraExtensionContext = new ${className}();`);

    return lines.join('\n');
};

export const buildSharedMonacoLibs = ({
    block = null,
    blocks = {},
    extensionId = 'extension',
    translateType = (value) => value,
    includeBlockInputs = false,
    publicJS = ''
}) => {
    const entries = [...getLanguageApiLibs()];

    const opcodeLib = buildOpcodeDefinitions(blocks, extensionId);
    if (opcodeLib) {
        entries.push({
            path: 'file:///generated/opcodes.d.ts',
            content: opcodeLib
        });
    }

    if (includeBlockInputs && block) {
        entries.push({
            path: 'file:///generated/block-inputs.d.ts',
            content: buildBlockInputDefinitions(block, translateType)
        });
    }

    const extensionProgram = buildExtensionProgramLib({
        blocks,
        extensionId,
        publicJS
    });
    if (extensionProgram) {
        entries.push({
            path: 'file:///generated/astra-extension-context.js',
            content: extensionProgram
        });
    }

    return entries;
};

export const syncScratchEditorContext = ({
    monaco,
    editor = null,
    decorationsRef = null,
    block = null,
    blocks = {},
    extensionId = 'extension',
    translateType = (value) => value,
    includeBlockInputs = false,
    publicJS = '',
    hoverLabel = 'Scratch Symbol'
}) => {
    syncScratchMonacoExtraLibs(
        monaco,
        buildSharedMonacoLibs({
            block,
            blocks,
            extensionId,
            translateType,
            includeBlockInputs,
            publicJS
        })
    );

    const identifiers = getScratchEditorIdentifiers({
        block,
        blocks,
        extensionId,
        includeBlockInputs
    });

    if (editor && decorationsRef) {
        updateIdentifierDecorations({
            monaco,
            editor,
            decorationsRef,
            identifiers,
            hoverLabel
        });
    }

    return identifiers;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const updateIdentifierDecorations = ({
    monaco,
    editor,
    decorationsRef,
    identifiers,
    hoverLabel = 'Scratch Symbol'
}) => {
    const model = editor?.getModel?.();
    if (!model) return;

    const uniqueIdentifiers = Array.from(new Set((identifiers || []).filter(Boolean)));
    const decorations = [];

    uniqueIdentifiers.forEach(identifier => {
        const wholeWord = isValidIdentifier(identifier);
        const matches = model.findMatches(
            wholeWord ? `\\b${escapeRegExp(identifier)}\\b` : escapeRegExp(identifier),
            false,
            true,
            false,
            null,
            true
        );

        matches.forEach(match => {
            decorations.push({
                range: new monaco.Range(
                    match.range.startLineNumber,
                    match.range.startColumn,
                    match.range.endLineNumber,
                    match.range.endColumn
                ),
                options: {
                    className: 'scratch-input-highlight',
                    inlineClassName: 'scratch-input-inline',
                    hoverMessage: { value: `**${hoverLabel}**: ${identifier}` },
                    color: '#4fc3f7',
                    inlineClassNameAffectsLetterSpacing: true
                }
            });
        });
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
};
