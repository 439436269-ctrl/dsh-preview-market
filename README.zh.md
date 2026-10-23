# dsh-preview-market

给 DeepSeek Harness 的**垂直预览市场**。一个设置页列出 DSH 可用的预览插件，显示当前 profile 已安装哪些，并把安装/更新交给 [dsh-market](https://github.com/dsh-market/dsh-market) 或官方 `dsh plugin` 命令。

它不是通用插件市场，也不自己实现预览：每个预览插件仍是独立的 Loader 条目，有自己的仓库、版本和设置；市场只提供目录、已安装视图和入口。

## 安装

```sh
dsh plugin --profile <profile> add dsh-preview-market
```

打开 **设置 → 插件 → 预览市场**。

## 功能

- **目录** — 第一方预览插件及其格式、宿主依赖、版本。
- **已安装** — 读当前 profile 的 `package.json` 与各包的 `dsh.preview` 清单，不 import 子插件代码。
- **安装/更新** — 检测到 dsh-market 时委托给它；没有时显示可复制的 `dsh plugin --profile <profile> add <包>@<版本>` 命令。
- **独立插件** — media、Blender、STL 仍是独立包；本页不注册渲染器，也不合并它们的代码。

## 目录（0.1.1）

| 包 | 格式 | 宿主依赖 |
|---|---|---|
| `dsh-preview-media` | mp4/mov/webm/mkv + mp3/flac/wav/… | — |
| `dsh-preview-blender` | `.blend` | Blender 3.6+ |
| `dsh-preview-stl` | `.stl` | — |

## 配置

设置 → 插件 → 预览市场（命名空间 `preview-market`）：

| 键 | 默认 | 含义 |
|---|---|---|
| `enabled` | `true` | 注册路由与设置页。 |
| `routeRoot` | `/api/preview-market` | 带鉴权的路由根；必须在 `/api` 下。 |
| `profileDir` | `""` | 要检查的 profile；空则用 Host `profileContext`，再退到 `$DSH_HOME/profiles/desktop`。 |
| `debug` | `false` | 预留的请求诊断。 |

## 开发

```sh
node --test test/*.test.js
```

客户端 bundle 是 `lib/client.js`（经典 `__ModuleLoader__.load` 工厂，无构建步骤）。

## 状态

`0.1.1` — 目录 + 已安装清单 + 设置页 + 通过 dsh-market 启用/停用。一键安装要求对应包已进入所连接 dsh-market 的 registry；否则用可复制命令。配置仍在各子插件自己的 设置 → 插件 页面。
