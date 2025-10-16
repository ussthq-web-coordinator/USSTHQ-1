export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    const key = 'gdos_corrections'; // Key for storing the JSON in KV

    let response;
    if (request.method === 'GET') {
      // Retrieve the stored data
      const data = await env.KV.get(key);
      if (data) {
        response = new Response(data, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        response = new Response(JSON.stringify({}), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (request.method === 'PUT') {
      // Store the new data, merging with existing
      const body = await request.text();
      let incomingCorrections;
      try {
        incomingCorrections = JSON.parse(body);
      } catch (e) {
        return new Response('Invalid JSON', { status: 400 });
      }

      // Get current data
      const currentDataStr = await env.KV.get(key);
      let currentCorrections = {};
      if (currentDataStr) {
        try {
          currentCorrections = JSON.parse(currentDataStr);
        } catch (e) {
          // If current data is corrupted, start fresh
          console.error('Corrupted current data, starting fresh');
        }
      }

      // Merge incoming corrections into current (incoming takes precedence)
      const mergedCorrections = { ...currentCorrections, ...incomingCorrections };

      // Add timestamp
      mergedCorrections.lastUpdated = new Date().toISOString();

      await env.KV.put(key, JSON.stringify(mergedCorrections));
      response = new Response('OK', { status: 200 });
    } else {
      response = new Response('Method not allowed', { status: 405 });
    }

    // Add CORS headers to all responses
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  },
};