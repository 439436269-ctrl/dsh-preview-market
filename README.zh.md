# dsh-preview-market

给 DeepSeek Harness 的**垂直预览市场**。一个设置页列出 DSH 可用的预览插件，显示当前 profile 已安装哪些，并把安装/更新交给 [dsh-market](https://github.com/dsh-market/dsh-market) 或官方 `dsh plugin` 命令。

它不是通用插件市场，也不自己实现预览：每个预览插件仍是独立的 Loader 条目，有自己的仓库、版本和设置；市场只提供目录、已安装视图和入口。

![设置里的预览市场](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-market-section.png)

## 安装

```sh
dsh plugin --profile <profile> add dsh-preview-market
```

打开 **设置 → 预览市场**（同一个面板也在 **设置 → 插件** 下）。

从 `dsh-media-preview` / `dsh-blend-preview` / `dsh-stl-preview` 升级？见 [MIGRATION.md](MIGRATION.md)。

## 功能

- **目录** — 第一方预览插件及其格式、宿主依赖、版本。
- **已安装** — 读当前 profile 的 `package.json`，默认按目录名匹配；包内声明 `dsh.preview` 清单时也认。不 import 子插件代码。
- **安装/更新** — 检测到 dsh-market 时委托给它；没有时显示可复制的 `dsh plugin --profile <profile> add <包>@<版本>` 命令。
- **独立插件** — media、Blender、STL 仍是独立包；本页不注册渲染器，也不合并它们的代码。

## 截图

### 预览市场

顶层 **设置 → 预览市场**，紧跟「插件市场」，包含发现 / 已安装两个 tab 和当前四个条目：

![设置里的预览市场](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-market-section.png)

### 已安装卡片与操作

已安装条目复用同一套操作：状态、可复制安装命令、通过 dsh-market 启用/停用，以及配置入口。

![已安装卡片与操作](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-market-toggle.png)

## 当前预览插件

| 插件 | 打开什么 | 格式 | 宿主依赖 |
|---|---|---|---|
| [`dsh-preview-media`](https://github.com/439436269-ctrl/dsh-preview-media) | 视频与音频 | mp4/mov/webm/mkv + mp3/flac/wav/… | — |
| [`dsh-preview-blender`](https://github.com/439436269-ctrl/dsh-preview-blender) | Blender 场景 | `.blend` | Blender 3.6+ |
| [`dsh-preview-stl`](https://github.com/439436269-ctrl/dsh-preview-stl) | STL 网格 | `.stl` | — |
| [`dsh-preview-snip`](https://github.com/439436269-ctrl/dsh-preview-snip) | 工具：圈选或引用选中 | 无文件扩展名 | — |

### dsh-preview-media

在右侧栏播放视频/音频，经带鉴权的 HTTP Range 路由流式读取；桌面端 seek 走 token 保护的 loopback 源，0.1.5 在 loopback 报 code 4 时再回退认证路由重试。

![视频预览](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-media.png)

### dsh-preview-blender

`.blend` 由 Blender headless 导出缓存 GLB，再用零依赖 WebGL 视口渲染，并给出场景统计。

![Blender 预览](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-blender.png)

### dsh-preview-stl

STL 在浏览器解析；视口给出尺寸、体积、表面积和水密性，不上传网格。

![STL 预览](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-stl.png)

### dsh-preview-snip

预览标题栏工具：在图片/PDF 上拖框截成 PNG，或把选中文字引用进输入框。

![预览圈选](https://raw.githubusercontent.com/439436269-ctrl/dsh-preview-market/main/docs/preview-snip.png)

## 目录（0.1.7）

每个插件是 [`catalog/plugins/`](catalog/plugins/) 下的**一个文件**，命名为 `<owner>__<repo>.json`。三方收录只需新增一个文件 + 重新生成 `catalog.json`，不用改市场代码；Host 启动时读取、校验并合并全部文件。字段与 PR 步骤见 [`catalog/README.md`](catalog/README.md)。

预览条目用 `kind: "media"` 或 `"three"` 并声明扩展名；`dsh-preview-snip` 用 `kind: "tool"`，没有文件扩展名，卡片显示为工具。

## 配置

设置 → 预览市场（命名空间 `preview-market`）：

| 键 | 默认 | 含义 |
|---|---|---|
| `enabled` | `true` | 注册路由与设置页。 |
| `routeRoot` | `/api/preview-market` | 带鉴权的路由根；必须在 `/api` 下。 |
| `profileDir` | `""` | 要检查的 profile；空则用 Host `profileContext`，再退到 `$DSH_HOME/profiles/desktop`。 |
| `debug` | `false` | 预留的请求诊断。 |

## 示例

- [`examples/profile-overrides.yml`](examples/profile-overrides.yml)：按 profile 覆盖媒体分块、Blender 路径、STL 单位。
- [`catalog.json`](catalog.json)：目录的机器可读快照，单测会检查它与代码一致。

## 开发

```sh
node --test test/*.test.js
```

客户端 bundle 是 `lib/client.js`（经典 `__ModuleLoader__.load` 工厂，无构建步骤）。

## 状态

`0.1.7` — 顶层「设置 → 预览市场」+ 发现/已安装两个 tab，同时保留「设置 → 插件」里的入口。目录改为 `catalog/plugins/` 下一插件一文件，支持预览插件和 `kind: "tool"` 的增强工具（如预览圈选），三方收录只需一个文件 PR。启用/停用走 dsh-market；一键安装要求对应包已进入所连接 dsh-market 的 registry，否则用可复制命令。配置仍在各子插件自己的 设置 → 插件 页面。
