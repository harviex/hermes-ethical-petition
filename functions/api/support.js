export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 获取客户端IP（Cloudflare自动提供）
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    // 从KV获取计数器数据
    let data = await env.COUNTER_KV.get("counter_data", { type: "json" });
    
    if (!data) {
      data = { count: 0, ips: [] };
    }
    
    // 检查是否已支持
    if (data.ips && data.ips.includes(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Already supported', count: data.count }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // 添加支持
    if (!data.ips) data.ips = [];
    data.ips.push(clientIP);
    data.count = data.ips.length;
    
    // 保存到KV
    await env.COUNTER_KV.put("counter_data", JSON.stringify(data));
    
    return new Response(JSON.stringify({ success: true, count: data.count }), {
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
