export default {
  async fetch(request, env, ctx) {
    const KV = env.CORRECTIONS_KV || env.KV;
    const CORS_HEADERS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Worker-Token',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // optional auth for mutating requests
    async function requireAuth(req) {
      if (!env.WORKER_SECRET) return true;
      const token = req.headers.get('X-Worker-Token');
      return token && token === env.WORKER_SECRET;
    }

    // safe JSON read
    async function readJsonSafe(req) {
      try { return await req.json(); } catch (e) { return null; }
    }

    const MAX_PAYLOAD_BYTES = 256 * 1024; // 256KB

    // helpers to get/put corrections under a single key
    async function getCorrections() {
      if (!KV) return {};
      const raw = await KV.get('corrections');
      if (!raw) return {};
      try { return JSON.parse(raw); } catch (e) { return {}; }
    }
    async function putCorrections(obj) {
      if (!KV) return;
      await KV.put('corrections', JSON.stringify(obj));
    }

    // legacy array -> object conversion
    function convertLegacyArray(arr) {
      const out = {};
      if (!Array.isArray(arr)) return out;
      arr.forEach(savedRow => {
        const key = `${savedRow.gdos_id}-${savedRow.correct === 'Zesty Name to Site Title' ? 'siteTitle' : savedRow.field}`;
        out[key] = { correct: savedRow.correct, value: savedRow.customZestyValue || savedRow.zesty_value };
      });
      return out;
    }

    try {
      if (request.method === 'GET') {
        const current = await getCorrections();
        return new Response(JSON.stringify(current), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      }

      // auth guard for writes
      if (!(await requireAuth(request))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      }

      if (request.method === 'PUT') {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES) return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
        let obj;
        try { obj = JSON.parse(text); } catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }); }
        if (obj && obj.data && Array.isArray(obj.data)) obj = convertLegacyArray(obj.data);
        if (Array.isArray(obj)) obj = convertLegacyArray(obj);
        if (!obj || typeof obj !== 'object') obj = {};
        await putCorrections(obj);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      }

      if (request.method === 'PATCH') {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES) return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
        let delta;
        try { delta = JSON.parse(text); } catch (e) { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }); }
        if (Array.isArray(delta)) delta = convertLegacyArray(delta);
        if (!delta || typeof delta !== 'object') return new Response(JSON.stringify({ error: 'Invalid delta' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });

        const current = await getCorrections();
        // apply delta: null => delete
        Object.entries(delta).forEach(([k, v]) => {
          if (v === null) delete current[k]; else current[k] = v;
        });
        await putCorrections(current);
        return new Response(JSON.stringify({ ok: true, merged: Object.keys(delta).length, current }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
    }
  }
};
