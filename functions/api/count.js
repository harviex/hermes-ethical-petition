export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // 从KV获取计数器数据
    let data = await env.COUNTER_KV.get("counter_data", { type: "json" });
    
    if (!data) {
      data = { count: 0, ips: [] };
      await env.COUNTER_KV.put("counter_data", JSON.stringify(data));
    }
    
    return new Response(JSON.stringify({ count: data.count }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
