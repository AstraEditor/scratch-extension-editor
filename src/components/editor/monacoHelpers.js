import { applyLanguageServiceSettings, VSCODE_DARK_PLUS } from './monacoConfig.js';
import VMAPI from './vm-api.js';
import VMAPI_CN from './vm-api-cn.js';
import SCRATCH_API from './scratch-api.js';
import SCRATCH_API_CN from './scratch-api-cn.js';
import { InputType } from '../../lib/blockSvgRenderer.js';

export const FUNCTION_BODY_DIAGNOSTIC_CODES = [1108];
export const ASYNC_FUNCTION_BODY_DIAGNOSTIC_CODES = [1308, 1375, 1378];

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

export const buildOpcodeDefinitions = (blocks, extensionId) => {
    const lines = [];
    Object.keys(blocks || {}).forEach(name => {
        const opcode = `${extensionId || 'extension'}_${name}`;
        lines.push('/**');
        lines.push(` * Return the opcode of the block`);
        lines.push(` * @returns {string} "${opcode}"`);
        lines.push(' */');
        lines.push(`declare const ${opcode}: "${opcode}";`);
    });
    return lines.join('\n');
};

export const buildBlockInputDefinitions = (block, extensionId, blocks, translateType) => {
    if (!block?.parts) return buildOpcodeDefinitions(blocks, extensionId);

    const inputDefs = [];
    let inputIdx = 0;

    block.parts.forEach(part => {
        if (typeof part !== 'object' || part === null) return;

        const inputId = part.id || `input_${inputIdx}`;
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

    const opcodeDefs = buildOpcodeDefinitions(blocks, extensionId);
    if (opcodeDefs) inputDefs.push(opcodeDefs);
    inputDefs.push('/**');
    inputDefs.push(' * This Block Inputs');
    inputDefs.push(' */');
    inputDefs.push('declare const args: Record<string, any>;');
    return inputDefs.join('\n');
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
            content: buildBlockInputDefinitions(block, extensionId, blocks, translateType)
        });
    }

    if (publicJS && publicJS.trim()) {
        entries.push({
            path: 'file:///generated/public-js.js',
            content: publicJS
        });
    }

    return entries;
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
        const matches = model.findMatches(
            `\\b${escapeRegExp(identifier)}\\b`,
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
