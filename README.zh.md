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

## 目录（0.1.5）

每个插件是 [`catalog/plugins/`](catalog/plugins/) 下的**一个文件**，命名为 `<owner>__<repo>.json`。三方收录只需新增一个文件 + 重新生成 `catalog.json`，不用改市场代码；Host 启动时读取、校验并合并全部文件。字段与 PR 步骤见 [`catalog/README.md`](catalog/README.md)。

| 包 | 格式 | 宿主依赖 |
|---|---|---|
| `dsh-preview-media` | mp4/mov/webm/mkv + mp3/flac/wav/… | — |
| `dsh-preview-blender` | `.blend` | Blender 3.6+ |
| `dsh-preview-stl` | `.stl` | — |
| `dsh-preview-snip` | 工具：图片/PDF 圈选或引用选中 | — |

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

`0.1.5` — 顶层「设置 → 预览市场」+ 发现/已安装两个 tab，同时保留「设置 → 插件」里的入口。目录改为 `catalog/plugins/` 下一插件一文件，支持预览插件和 `kind: "tool"` 的增强工具（如预览圈选），三方收录只需一个文件 PR。启用/停用走 dsh-market；一键安装要求对应包已进入所连接 dsh-market 的 registry，否则用可复制命令。配置仍在各子插件自己的 设置 → 插件 页面。
