/**
 * dsh-preview-market browser half.
 *
 * Registers one Settings → Plugins tab. The tab reads the Host catalog and the
 * active profile inventory, then either delegates installs/updates to
 * dsh-market's same-origin API or shows the official `dsh plugin add` command.
 * It never imports a preview plugin's client bundle; those stay independent
 * Loader entries.
 */
window.__ModuleLoader__.load({
  id: "dsh-preview-market",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    const React = require("react");

    /** Locale namespace and settings-tab id. */
    const NS = "previewMarket";
    const TAB_ID = "dsh-preview-market";
    const DEFAULT_ROUTE_ROOT = "/api/preview-market";

    const zh = {
      nav: "预览市场",
      title: "预览市场",
      subtitle: "按能力发现、安装和管理预览插件。每个插件仍是独立的 Loader 条目。",
      installed: "已安装",
      available: "可安装",
      install: "安装",
      update: "更新",
      copy: "复制安装命令",
      copied: "命令已复制",
      manual: "请在终端执行：",
      retry: "重试",
      loading: "正在读取目录与已安装插件…",
      failed: "读取失败",
      empty: "目录为空。",
      requires: "需要",
      formats: "格式",
      profile: "当前 profile",
      market: "dsh-market",
      marketOn: "已连接，可一键安装",
      marketOff: "未安装，使用命令安装",
      noUpdate: "已是最新",
      updateAvailable: "有新版",
      note: "安装/更新由 dsh-market 或 dsh CLI 完成；本页只做目录、状态与入口，不复制子插件代码。",
      version: "版本",
      notInstalled: "未安装",
      disabledHint: "启用/停用请到 设置 → 插件 列表。"
    };

    const en = {
      nav: "Preview market",
      title: "Preview market",
      subtitle: "Discover, install and manage preview plugins by capability. Each plugin remains an independent Loader entry.",
      installed: "Installed",
      available: "Available",
      install: "Install",
      update: "Update",
      copy: "Copy install command",
      copied: "Command copied",
      manual: "Run in a terminal:",
      retry: "Retry",
      loading: "Reading the catalog and installed plugins…",
      failed: "Failed to read",
      empty: "The catalog is empty.",
      requires: "Requires",
      formats: "Formats",
      profile: "Profile",
      market: "dsh-market",
      marketOn: "connected, one-click install available",
      marketOff: "not installed, use the command",
      noUpdate: "Up to date",
      updateAvailable: "Update available",
      note: "Installs and updates go through dsh-market or the dsh CLI; this page only provides the catalog, status and entry points. Child plugin code is never copied.",
      version: "Version",
      notInstalled: "Not installed",
      disabledHint: "Enable or disable it in Settings → Plugins."
    };

    /** Route root published by the Host at boot. */
    function routeRoot() {
      const config = globalThis.__DSH_PREVIEW_MARKET_CONFIG__;
      return config !== null && typeof config === "object" && typeof config.routeRoot === "string" && config.routeRoot !== ""
        ? config.routeRoot
        : DEFAULT_ROUTE_ROOT;
    }

    /** One same-origin JSON request; rejects on a non-2xx answer. */
    async function getJson(url) {
      const response = await fetch(url, { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok || body === null || body.ok !== true) {
        const message = body !== null && body.error !== undefined ? body.error.message : `HTTP ${response.status}`;
        throw new Error(typeof message === "string" ? message : `HTTP ${response.status}`);
      }
      return body;
    }

    /** The official install command for one catalog entry. */
    function installCommand(item, profile) {
      return `dsh plugin --profile ${profile || "desktop"} add ${item.name}@${item.version}`;
    }

    /** A single catalog card. */
    function Card({ item, installed, profile, dshmarket, busy, onInstall, onCopy, t }) {
      const current = installed !== undefined ? installed.version : "";
      const newer = current !== "" && current !== item.version;
      const formats = item.formats !== undefined
        ? Object.values(item.formats).flat().slice(0, 10)
        : item.extensions.slice(0, 10);
      return React.createElement(
        "article",
        { className: "dsh-pm-card", "data-installed": current !== "" ? "true" : "false" },
        React.createElement(
          "div",
          { className: "dsh-pm-card-head" },
          React.createElement("h3", { className: "dsh-pm-name" }, item.name),
          React.createElement(
            "span",
            { className: "dsh-pm-badge", "data-tone": current === "" ? "muted" : newer ? "warn" : "ok" },
            current === "" ? t("available") : newer ? `${t("installed")} ${current} · ${t("updateAvailable")}` : `${t("installed")} ${current}`
          )
        ),
        React.createElement("p", { className: "dsh-pm-desc" }, item.description !== undefined ? item.description.zh : ""),
        React.createElement(
          "div",
          { className: "dsh-pm-meta" },
          React.createElement("span", null, `${t("formats")}: ${formats.join(", ")}`),
          item.requires.length > 0
            ? React.createElement("span", { className: "dsh-pm-requires" }, `${t("requires")}: ${item.requires.join(", ")}`)
            : null
        ),
        React.createElement(
          "div",
          { className: "dsh-pm-actions" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "dsh-pm-button dsh-pm-primary",
              disabled: busy === item.name,
              onClick: () => onInstall(item)
            },
            busy === item.name ? "…" : current === "" ? t("install") : newer ? t("update") : t("noUpdate")
          ),
          React.createElement(
            "button",
            { type: "button", className: "dsh-pm-button", onClick: () => onCopy(item) },
            t("copy")
          ),
          current !== ""
            ? React.createElement("span", { className: "dsh-pm-hint" }, t("disabledHint"))
            : null
        )
      );
    }

    /** The settings tab's page. */
    function MarketPanel({ t }) {
      const marketRoute = routeRoot();
      const [state, setState] = React.useState({
        loading: true,
        error: "",
        catalog: [],
        installed: [],
        profile: "desktop",
        dshmarket: false
      });
      const [notice, setNotice] = React.useState("");
      const [busy, setBusy] = React.useState("");

      const load = React.useCallback(async () => {
        setState((previous) => ({ ...previous, loading: true, error: "" }));
        try {
          const [catalog, inventory, status] = await Promise.all([
            getJson(`${marketRoute}/catalog`),
            getJson(`${marketRoute}/installed`),
            fetch("/dsh-market/status", { cache: "no-store" })
              .then((response) => response.ok)
              .catch(() => false)
          ]);
          setState({
            loading: false,
            error: "",
            catalog: Array.isArray(catalog.plugins) ? catalog.plugins : [],
            installed: Array.isArray(inventory.installed) ? inventory.installed : [],
            profile: typeof inventory.profile === "string" && inventory.profile !== "" ? inventory.profile : "desktop",
            dshmarket: status === true
          });
        } catch (error) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error instanceof Error ? error.message : String(error)
          }));
        }
      }, [marketRoute]);

      React.useEffect(() => {
        void load();
      }, [load]);

      const installedByName = new Map(state.installed.map((entry) => [entry.name, entry]));

      const install = React.useCallback(async (item) => {
        setBusy(item.name);
        setNotice("");
        try {
          if (!state.dshmarket) throw new Error("dsh-market is not available");
          const response = await fetch("/dsh-market/install", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ url: item.repo, version: item.version })
          });
          const body = await response.json().catch(() => null);
          if (!response.ok || body === null || body.ok !== true) {
            throw new Error(body !== null && typeof body.error === "string" ? body.error : `HTTP ${response.status}`);
          }
          setNotice(`${t("installed")}: ${item.name}`);
          await load();
        } catch {
          setNotice(`${t("manual")} ${installCommand(item, state.profile)}`);
        } finally {
          setBusy("");
        }
      }, [state.dshmarket, state.profile, load, t]);

      const copy = React.useCallback(async (item) => {
        const command = installCommand(item, state.profile);
        try {
          await navigator.clipboard.writeText(command);
          setNotice(t("copied"));
        } catch {
          setNotice(`${t("manual")} ${command}`);
        }
      }, [state.profile, t]);

      installStyle();

      return React.createElement(
        "div",
        { className: "dsh-pm-root", "data-preview-market": true },
        React.createElement(
          "header",
          { className: "dsh-pm-header" },
          React.createElement("div", null,
            React.createElement("h2", { className: "dsh-pm-title" }, t("title")),
            React.createElement("p", { className: "dsh-pm-sub" }, t("subtitle"))
          ),
          React.createElement(
            "div",
            { className: "dsh-pm-status" },
            React.createElement("span", { className: "dsh-pm-pill" }, `${t("profile")}: ${state.profile}`),
            React.createElement("span", { className: "dsh-pm-pill", "data-tone": state.dshmarket ? "ok" : "muted" },
              `${t("market")}: ${state.dshmarket ? t("marketOn") : t("marketOff")}`
            )
          )
        ),
        state.loading
          ? React.createElement("p", { className: "dsh-pm-empty" }, t("loading"))
          : state.error !== ""
            ? React.createElement(
                "div",
                { className: "dsh-pm-error" },
                React.createElement("p", null, `${t("failed")}: ${state.error}`),
                React.createElement("button", { type: "button", className: "dsh-pm-button", onClick: () => void load() }, t("retry"))
              )
            : state.catalog.length === 0
              ? React.createElement("p", { className: "dsh-pm-empty" }, t("empty"))
              : React.createElement(
                  "div",
                  { className: "dsh-pm-grid" },
                  state.catalog.map((item) =>
                    React.createElement(Card, {
                      key: item.name,
                      item,
                      installed: installedByName.get(item.name),
                      profile: state.profile,
                      dshmarket: state.dshmarket,
                      busy,
                      onInstall: (entry) => void install(entry),
                      onCopy: (entry) => void copy(entry),
                      t
                    })
                  )
                ),
        notice !== ""
          ? React.createElement("p", { className: "dsh-pm-notice", role: "status" }, notice)
          : null,
        React.createElement("p", { className: "dsh-pm-foot" }, t("note"))
      );
    }

    /** Scoped styles, installed once per page. */
    function installStyle() {
      if (document.getElementById("dsh-preview-market.css") !== null) return;
      const style = document.createElement("style");
      style.id = "dsh-preview-market.css";
      style.textContent = [
        "[data-preview-market]{display:flex;flex-direction:column;gap:14px;padding:16px;color:var(--dsw-alias-label-primary,#1f2329)}",
        "[data-preview-market] .dsh-pm-header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}",
        "[data-preview-market] .dsh-pm-title{margin:0;font-size:16px;font-weight:650}",
        "[data-preview-market] .dsh-pm-sub{margin:4px 0 0;font-size:12px;line-height:1.55;opacity:.65;max-width:720px}",
        "[data-preview-market] .dsh-pm-status{display:flex;gap:6px;flex-wrap:wrap}",
        "[data-preview-market] .dsh-pm-pill{border-radius:999px;padding:3px 9px;font-size:11px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}",
        "[data-preview-market] .dsh-pm-pill[data-tone=ok]{color:#1f7a4d;background:rgba(46,160,92,.14)}",
        "[data-preview-market] .dsh-pm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}",
        "[data-preview-market] .dsh-pm-card{border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:9px;background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.02))}",
        "[data-preview-market] .dsh-pm-card-head{display:flex;justify-content:space-between;gap:8px;align-items:center}",
        "[data-preview-market] .dsh-pm-name{margin:0;font-size:13px;font-weight:650;overflow-wrap:anywhere}",
        "[data-preview-market] .dsh-pm-badge{font-size:10.5px;border-radius:999px;padding:2px 7px;white-space:nowrap;background:rgba(0,0,0,.05)}",
        "[data-preview-market] .dsh-pm-badge[data-tone=ok]{color:#1f7a4d;background:rgba(46,160,92,.14)}",
        "[data-preview-market] .dsh-pm-badge[data-tone=warn]{color:#9a6a00;background:rgba(230,170,40,.18)}",
        "[data-preview-market] .dsh-pm-desc{margin:0;font-size:12px;line-height:1.55;opacity:.78}",
        "[data-preview-market] .dsh-pm-meta{display:flex;flex-direction:column;gap:3px;font-size:11px;opacity:.62;overflow-wrap:anywhere}",
        "[data-preview-market] .dsh-pm-requires{color:#9a6a00}",
        "[data-preview-market] .dsh-pm-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:auto}",
        "[data-preview-market] .dsh-pm-button{appearance:none;border:0;border-radius:8px;padding:6px 10px;font:inherit;font-size:11.5px;line-height:1.2;cursor:pointer;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.07));color:inherit}",
        "[data-preview-market] .dsh-pm-button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.12))}",
        "[data-preview-market] .dsh-pm-button:disabled{opacity:.5;cursor:default}",
        "[data-preview-market] .dsh-pm-primary{background:var(--dsw-alias-label-accent,#2c6ef2);color:#fff}",
        "[data-preview-market] .dsh-pm-hint{font-size:10.5px;opacity:.5}",
        "[data-preview-market] .dsh-pm-empty,[data-preview-market] .dsh-pm-error{padding:18px;font-size:12px;opacity:.7}",
        "[data-preview-market] .dsh-pm-notice{margin:0;font-size:11.5px;color:#1f7a4d;overflow-wrap:anywhere}",
        "[data-preview-market] .dsh-pm-foot{margin:0;font-size:10.5px;line-height:1.5;opacity:.45}"
      ].join("\n");
      document.head.appendChild(style);
    }

    const inject = ["slots", "locale"];

    /**
     * Register the market's Settings → Plugins tab.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      installStyle();
      const t = ctx.locale.bind(NS);
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "preview-market: dictionaries");
      ctx.slots.inject("settings.plugins.tab", () =>
        ctx.slots.register(
          {
            name: "settings.plugins.tab",
            id: TAB_ID,
            order: 61,
            label: () => t("nav"),
            locale: NS,
            inject: () => ({ t })
          },
          () => React.createElement(MarketPanel, { t })
        )
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
