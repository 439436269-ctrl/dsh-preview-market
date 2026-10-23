/**
 * The vertical preview catalog shipped with this release.
 *
 * The catalog is intentionally data-only: adding a new preview plugin should
 * be a catalog entry plus that plugin's own repository, not a change to the
 * market's renderer or routes. Third-party plugins can be added later with the
 * same fields; `dsh.preview` in the installed package is used to enrich the
 * installed view when present.
 *
 * @module dsh-preview-market/catalog
 */

/** Catalog schema version. */
export const CATALOG_SCHEMA = 1;

/** One preview plugin per entry. */
export const CATALOG = Object.freeze([
  {
    name: "dsh-preview-media",
    npm: "dsh-preview-media",
    capability: "media",
    kind: "media",
    repo: "https://github.com/439436269-ctrl/dsh-preview-media",
    version: "0.1.4",
    minDsh: "0.2.0-rc.2",
    requires: [],
    extensions: [
      "mp4", "m4v", "mov", "webm", "ogv", "ogg", "mkv", "avi", "wmv", "flv", "3gp", "ts", "m2ts", "mts",
      "mp3", "wav", "flac", "m4a", "aac", "oga", "opus", "weba", "wma", "aiff", "aif"
    ],
    formats: {
      video: ["mp4", "m4v", "mov", "webm", "ogv", "ogg", "mkv", "avi", "wmv", "flv", "3gp", "ts", "m2ts", "mts"],
      audio: ["mp3", "wav", "flac", "m4a", "aac", "oga", "opus", "weba", "wma", "aiff", "aif"]
    },
    description: {
      zh: "视频与音频：右侧栏原生播放器，HTTP Range 流式读取，桌面端可拖动进度。",
      en: "Video and audio in the right-Sidebar document preview, streamed with HTTP Range and seekable in the desktop app."
    }
  },
  {
    name: "dsh-preview-blender",
    npm: "dsh-preview-blender",
    capability: "blender",
    kind: "three",
    repo: "https://github.com/439436269-ctrl/dsh-preview-blender",
    version: "0.1.0",
    minDsh: "0.2.0-rc.2",
    requires: ["blender"],
    extensions: ["blend"],
    formats: { model: ["blend"] },
    description: {
      zh: "Blender 场景：headless 导出缓存 GLB，右侧栏 WebGL 视口 + 对象/三角面/mm 包围盒/材质统计。",
      en: "Blender scenes: a cached headless GLB export rendered in a WebGL viewport, with object, triangle, mm-bounds and material statistics."
    }
  },
  {
    name: "dsh-preview-stl",
    npm: "dsh-preview-stl",
    capability: "stl",
    kind: "three",
    repo: "https://github.com/439436269-ctrl/dsh-preview-stl",
    version: "0.1.0",
    minDsh: "0.2.0-rc.2",
    requires: [],
    extensions: ["stl"],
    formats: { model: ["stl"] },
    description: {
      zh: "STL 网格：浏览器解析二进制/ASCII，右侧栏 WebGL 视口 + 尺寸/体积/表面积/水密统计。",
      en: "STL meshes: binary/ASCII parsed in the browser, with a WebGL viewport and size, volume, surface-area and watertightness statistics."
    }
  }
]);

/** The catalog payload sent to the browser. */
export function catalogPayload() {
  return { schema: CATALOG_SCHEMA, plugins: CATALOG };
}
