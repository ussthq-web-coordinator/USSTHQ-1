var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.mjs
var index_default = {
  async fetch(request, env, ctx) {
    const KV = env.CORRECTIONS_KV || env.KV;
    function buildCorsHeaders(req) {
      const origin = req.headers.get("Origin") || "*";
      return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Worker-Token, Accept, Authorization, If-None-Match",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin"
      };
    }
    __name(buildCorsHeaders, "buildCorsHeaders");
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
    }
    const mutatingMethods = ["PATCH", "PUT", "POST", "DELETE"];
    async function checkAuth(req) {
      return true;
    }
    __name(checkAuth, "checkAuth");
    async function readJsonSafe(req) {
      try {
        return await req.json();
      } catch {
        return null;
      }
    }
    __name(readJsonSafe, "readJsonSafe");
    const MAX_PAYLOAD_BYTES = 256 * 1024;
    async function getCorrections() {
      if (!KV) return {};
      const raw = await KV.get("corrections");
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    __name(getCorrections, "getCorrections");
    async function getVersion() {
      if (!KV) return null;
      const v = await KV.get("corrections_version");
      if (!v) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    }
    __name(getVersion, "getVersion");
    async function putVersion(ts) {
      if (!KV) return;
      await KV.put("corrections_version", String(ts));
    }
    __name(putVersion, "putVersion");
    async function putCorrections(obj) {
      if (KV) {
        await KV.put("corrections", JSON.stringify(obj));
        const ts = Date.now();
        await putVersion(ts);
      }
    }
    __name(putCorrections, "putCorrections");
    function convertLegacyArray(arr) {
      const out = {};
      if (!Array.isArray(arr)) return out;
      arr.forEach((savedRow) => {
        const key = `${savedRow.gdos_id}-${savedRow.correct === "Zesty Name to Site Title" ? "siteTitle" : savedRow.field}`;
        out[key] = { correct: savedRow.correct, value: savedRow.customZestyValue || savedRow.zesty_value };
      });
      return out;
    }
    __name(convertLegacyArray, "convertLegacyArray");
    try {
      const corsHeaders = buildCorsHeaders(request);
      if (request.method === "GET") {
        const current = await getCorrections();
        const version = await getVersion() || Date.now();
        const ifNone = request.headers.get("If-None-Match");
        if (ifNone && String(ifNone) === String(version)) {
          return new Response(null, { status: 304, headers: { ...corsHeaders, "ETag": String(version), "X-Last-Modified": new Date(Number(version)).toUTCString() } });
        }
        const payload = { current, version };
        return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json", "ETag": String(version), "X-Last-Modified": new Date(Number(version)).toUTCString(), ...corsHeaders } });
      }
      if (mutatingMethods.includes(request.method) && !await checkAuth(request)) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid X-Worker-Token" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      if (request.method === "PUT") {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES)
          return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } });
        let obj;
        try {
          obj = JSON.parse(text);
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }
        if (obj && obj.data && Array.isArray(obj.data)) obj = convertLegacyArray(obj.data);
        if (Array.isArray(obj)) obj = convertLegacyArray(obj);
        if (!obj || typeof obj !== "object") obj = {};
        await putCorrections(obj);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
      if (request.method === "PATCH") {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES)
          return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } });
        let delta;
        try {
          delta = JSON.parse(text);
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }
        if (Array.isArray(delta)) delta = convertLegacyArray(delta);
        if (!delta || typeof delta !== "object")
          return new Response(JSON.stringify({ error: "Invalid delta" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        const current = await getCorrections();
        Object.entries(delta).forEach(([k, v]) => {
          if (v === null) delete current[k];
          else current[k] = v;
        });
        await putCorrections(current);
        const version = await getVersion() || Date.now();
        return new Response(JSON.stringify({ ok: true, merged: Object.keys(delta).length, current, version }), {
          status: 200,
          headers: { "Content-Type": "application/json", "ETag": String(version), "X-Last-Modified": new Date(Number(version)).toUTCString(), ...corsHeaders }
        });
      }
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", ...buildCorsHeaders(request) } });
    }
  }
};

// ../../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-N0IXvB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-N0IXvB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
