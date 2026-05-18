/**
 * ESM default export for clipper-lib (CJS). PaddleOCR imports `clipper-lib` as default.
 * Must import via package subpath so Vite optimizeDeps applies CJS interop.
 */
import * as ClipperModule from "clipper-lib/clipper.js";

const ClipperLib = ClipperModule.default ?? ClipperModule;

export default ClipperLib;
