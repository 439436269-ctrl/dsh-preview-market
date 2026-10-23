import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("the bundle registers one Settings → Plugins tab", async () => {
  const source = await readFile(new URL("../lib/client.js", import.meta.url), "utf8");
  let registration;
  const captured = [];
  const React = {
    createElement: () => ({}),
    useState: () => [],
    useEffect: () => {},
    useCallback: (fn) => fn
  };
  const document = {
    getElementById: () => null,
    createElement: () => ({ id: "", textContent: "" }),
    head: { appendChild: () => {} }
  };
  const window = {
    __ModuleLoader__: {
      load: (value) => {
        registration = value;
      }
    }
  };
  const context = vm.createContext({
    window,
    document,
    console,
    fetch: () => Promise.reject(new Error("not used")),
    globalThis: { __DSH_PREVIEW_MARKET_CONFIG__: { routeRoot: "/api/preview-market" } }
  });
  vm.runInContext(source, context);
  assert.equal(registration.id, "dsh-preview-market");
  const module = registration.factory((name) => {
    if (name === "react") return React;
    throw new Error(`unexpected require ${name}`);
  });
  const ctx = {
    locale: { bind: () => (key) => key, register: () => ({}) },
    effect: (fn) => {
      fn();
      return () => {};
    },
    slots: {
      inject: (name, fn) => {
        assert.equal(name, "settings.plugins.tab");
        fn();
      },
      register: (spec) => {
        captured.push(spec);
        return () => {};
      }
    }
  };
  module.apply(ctx);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].name, "settings.plugins.tab");
  assert.equal(captured[0].id, "dsh-preview-market");
  assert.equal(typeof captured[0].label(), "string");
});
