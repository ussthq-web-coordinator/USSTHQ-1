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
        response = new Response(JSON.stringify({ data: [], lastUpdated: null }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (request.method === 'PUT') {
      // Store the new data
      const body = await request.text();
      await env.KV.put(key, body);
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