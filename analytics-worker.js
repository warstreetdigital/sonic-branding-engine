export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle POST: Store Event
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const timestamp = Date.now();
        const key = `event:${timestamp}`;

        // Save to ANALYTICS KV Namespace
        await env.ANALYTICS.put(key, JSON.stringify(data));

        return new Response(JSON.stringify({ success: true, id: timestamp }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid Request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Handle GET: Retrieve All Events
    if (request.method === "GET") {
      try {
        const list = await env.ANALYTICS.list();
        const events = [];

        for (const key of list.keys) {
          const val = await env.ANALYTICS.get(key.name);
          if (val) events.push(JSON.parse(val));
        }

        return new Response(JSON.stringify(events), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "KV Storage Error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
};
