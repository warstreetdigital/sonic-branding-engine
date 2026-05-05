/**
 * WARSTREET ANALYTICS WORKER
 * Environment: Cloudflare Workers + KV
 * Namespace: ANALYTICS
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. POST /track - Store Event
    if (url.pathname === "/track" && method === "POST") {
      try {
        const payload = await request.json();
        const { brand, event, timestamp } = payload;

        if (!brand || !event || !timestamp) {
          return new Response("Invalid Payload", { status: 400, headers: corsHeaders });
        }

        const key = `brand:${brand}:events`;
        const existingEvents = await env.ANALYTICS.get(key, "json") || [];
        
        // Push new event
        existingEvents.push({ event, timestamp });
        
        // Limit history size per brand (optional safety)
        if (existingEvents.length > 5000) existingEvents.shift();

        await env.ANALYTICS.put(key, JSON.stringify(existingEvents));

        return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 2. GET /analytics - Aggregate and Return
    if (url.pathname === "/analytics" && method === "GET") {
      try {
        const brandsData = {};
        const list = await env.ANALYTICS.list({ prefix: "brand:" });

        for (const keyObj of list.keys) {
          const brandMatch = keyObj.name.match(/^brand:(.+):events$/);
          if (brandMatch) {
            const brandSlug = brandMatch[1];
            const events = await env.ANALYTICS.get(keyObj.name, "json") || [];
            
            const stats = { views: 0, plays: 0, clicks: 0 };
            events.forEach(e => {
              if (e.event === "view") stats.views++;
              if (e.event === "play") stats.plays++;
              if (e.event === "click") stats.clicks++;
            });

            brandsData[brandSlug] = stats;
          }
        }

        return new Response(JSON.stringify({ brands: brandsData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
