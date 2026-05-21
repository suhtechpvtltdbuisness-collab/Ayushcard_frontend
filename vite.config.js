import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const PADDLE_CHUNK_RE =
  /[\\/]node_modules[\\/](@paddleocr|onnxruntime-web|@techstark[\\/]opencv-js|clipper-lib)[\\/]/;

const DEFAULT_API_PROXY_TARGET =
  "https://bkbsbackend-production.up.railway.app";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.VITE_API_BASE_URL ||
    DEFAULT_API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^clipper-lib$/,
          replacement: path.resolve(rootDir, "src/shims/clipper-lib.js"),
        },
        {
          find: /^@techstark\/opencv-js$/,
          replacement: path.resolve(rootDir, "src/shims/opencv-js.js"),
        },
      ],
    },
    optimizeDeps: {
      include: [
        "clipper-lib/clipper.js",
        "clipper-lib",
        "@techstark/opencv-js/dist/opencv.js",
        "js-yaml",
      ],
      needsInterop: [
        "clipper-lib",
        "clipper-lib/clipper.js",
        "@techstark/opencv-js",
        "@techstark/opencv-js/dist/opencv.js",
      ],
      exclude: ["@paddleocr/paddleocr-js"],
    },
    build: {
      target: "es2020",
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      commonjsOptions: {
        include: [/clipper-lib/, /@techstark[\\/]opencv-js/, /node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (PADDLE_CHUNK_RE.test(id)) {
              return "paddle-ocr";
            }
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
