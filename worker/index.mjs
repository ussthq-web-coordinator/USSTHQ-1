export default {
  async fetch(request, env, ctx) {
    const KV = env.CORRECTIONS_KV || env.KV;

    // Build CORS headers per-request (reflect Origin when present)
    function buildCorsHeaders(req) {
      const origin = req.headers.get('Origin') || '*';
      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Worker-Token, Accept, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '600',
        'Vary': 'Origin'
      };
    }

    // Preflight handling
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
    }

    const mutatingMethods = ['PATCH', 'PUT', 'POST', 'DELETE'];

    // Require secret for mutating requests
    async function checkAuth(req) {
      if (!env.WORKER_SECRET) return true; // no secret set = open
      const token = req.headers.get('X-Worker-Token');
      return token && token === env.WORKER_SECRET;
    }

    async function readJsonSafe(req) {
      try { return await req.json(); } catch { return null; }
    }

    const MAX_PAYLOAD_BYTES = 256 * 1024; // 256KB limit

    async function getCorrections() {
      if (!KV) return {};
      const raw = await KV.get('corrections');
      if (!raw) return {};
      try { return JSON.parse(raw); } catch { return {}; }
    }

    async function putCorrections(obj) {
      if (KV) await KV.put('corrections', JSON.stringify(obj));
    }

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
      const corsHeaders = buildCorsHeaders(request);

      // --- GET: public read ---
      if (request.method === 'GET') {
        const current = await getCorrections();
        return new Response(JSON.stringify(current), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // --- Require secret for writes ---
      if (mutatingMethods.includes(request.method) && !(await checkAuth(request))) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid X-Worker-Token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // --- PUT: full overwrite ---
      if (request.method === 'PUT') {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES)
          return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

        let obj;
        try { obj = JSON.parse(text); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }); }

        if (obj && obj.data && Array.isArray(obj.data)) obj = convertLegacyArray(obj.data);
        if (Array.isArray(obj)) obj = convertLegacyArray(obj);
        if (!obj || typeof obj !== 'object') obj = {};

        await putCorrections(obj);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // --- PATCH: merge delta ---
      if (request.method === 'PATCH') {
        const text = await request.text();
        if (text.length > MAX_PAYLOAD_BYTES)
          return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

        let delta;
        try { delta = JSON.parse(text); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }); }

        if (Array.isArray(delta)) delta = convertLegacyArray(delta);
        if (!delta || typeof delta !== 'object')
          return new Response(JSON.stringify({ error: 'Invalid delta' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

        const current = await getCorrections();
        Object.entries(delta).forEach(([k, v]) => { if (v === null) delete current[k]; else current[k] = v; });
        await putCorrections(current);

        return new Response(JSON.stringify({ ok: true, merged: Object.keys(delta).length, current }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // --- Default fallback ---
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(request) } });
    }
  }
};
