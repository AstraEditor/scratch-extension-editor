/* global __webpack_public_path__ */

// scratch-extension-editor is bundled into scratch-gui, but it still loads additional chunks/workers
// at runtime. Let the host page tell us where those resources live.
//
// Host can set:
//   window.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__ = "extension-editor/"
// The path must contain scratch-extension-editor's dist files (workers + chunk files).
(function () {
  const g =
    (typeof self !== 'undefined' && self) ||
    (typeof window !== 'undefined' && window) ||
    {};

  const normalize = value => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  };

  let publicPath = normalize(g.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__);

  // Standalone usage: if the host didn't configure a public path, infer it from the current script URL.
  // This works when scratch-extension-editor is loaded as its own script tag (e.g. /dist/index.js).
  if (!publicPath) {
    try {
      if (typeof document !== 'undefined') {
        const current = document.currentScript;
        const src = current && current.src;
        if (src) {
          publicPath = normalize(src.replace(/[^/]*$/, ''));
        }
      }
    } catch (e) {
      // Ignore.
    }
  }

  if (publicPath) {
    g.__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__ = publicPath;
    // eslint-disable-next-line no-undef
    __webpack_public_path__ = publicPath;
  }
})();
