/**
 * ESM default export for @techstark/opencv-js (UMD). PaddleOCR imports it as default.
 */
import * as OpenCV from "@techstark/opencv-js/dist/opencv.js";

const cvModule = OpenCV.default ?? OpenCV;

export default cvModule;
