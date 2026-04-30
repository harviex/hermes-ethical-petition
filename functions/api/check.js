export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // 获取客户端IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    // 从KV获取计数器数据
    let data = await env.COUNTER_KV.get("counter_data", { type: "json" });
    
    if (!data) {
      data = { count: 0, ips: [] };
    }
    
    const hasSupported = data.ips && data.ips.includes(clientIP);
    
    return new Response(JSON.stringify({ supported: hasSupported }), {
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
