// Máy chủ đồng bộ cho English App — chạy trên Cloudflare Workers (gói miễn phí).
// Cần một KV namespace gắn vào Worker với tên biến là SYNC.
// API:  GET /<mã>  → dữ liệu đã lưu (404 nếu chưa có)
//       PUT /<mã>  → lưu dữ liệu
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, PUT, OPTIONS',
  'access-control-allow-headers': 'content-type',
}
const MAX_BYTES = 5 * 1024 * 1024

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    const code = new URL(request.url).pathname.slice(1)
    if (!/^[a-z0-9-]{16,64}$/.test(code)) return new Response('Bad code', { status: 400, headers: CORS })

    if (request.method === 'GET') {
      const data = await env.SYNC.get(code)
      if (data === null) return new Response('Not found', { status: 404, headers: CORS })
      return new Response(data, { headers: { ...CORS, 'content-type': 'application/json', 'cache-control': 'no-store' } })
    }
    if (request.method === 'PUT') {
      const body = await request.text()
      if (body.length > MAX_BYTES) return new Response('Too large', { status: 413, headers: CORS })
      try { JSON.parse(body) } catch { return new Response('Bad JSON', { status: 400, headers: CORS }) }
      await env.SYNC.put(code, body)
      return new Response('OK', { headers: CORS })
    }
    return new Response('Method not allowed', { status: 405, headers: CORS })
  },
}
