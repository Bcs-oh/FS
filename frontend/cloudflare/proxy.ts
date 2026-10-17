export interface BackendEnv {
  BACKEND_URL?: string;
}

function errorResponse(status: number, detail: string): Response {
  return new Response(JSON.stringify({ detail }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/** Only the deployer's runtime variable chooses the upstream, never request data. */
function backendOrigin(value?: string): URL {
  if (!value) throw new Error('Set BACKEND_URL in Cloudflare Pages Functions environment variables.');
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('BACKEND_URL must be an HTTPS origin.'); }
  if (url.protocol !== 'https:' || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('BACKEND_URL must be an HTTPS origin without credentials, path, query or fragment.');
  }
  return url;
}

export async function proxyBackend(request: Request, env: BackendEnv, health = false): Promise<Response> {
  let target: URL;
  try { target = backendOrigin(env.BACKEND_URL); }
  catch (error) { return errorResponse(503, (error as Error).message); }

  const incoming = new URL(request.url);
  if (health) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return errorResponse(405, 'Use GET for backend health.');
    target.pathname = '/health';
  } else {
    if (!incoming.pathname.startsWith('/api/')) return errorResponse(404, 'Unknown proxy path.');
    target.pathname = incoming.pathname;
    target.search = incoming.search;
  }

  // Do not forward browser cookies, authorization, or the browser's Host header.
  // API keys belong exclusively in the backend service environment.
  const headers = new Headers();
  for (const name of ['accept', 'content-type', 'if-none-match', 'if-modified-since', 'range']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      // Never follow a backend redirect to a second, unvalidated upstream.
      redirect: 'manual',
    });
    if (response.status >= 300 && response.status < 400) {
      return errorResponse(502, 'The configured backend returned an unexpected redirect.');
    }
    const outgoing = new Headers(response.headers);
    outgoing.delete('set-cookie');
    outgoing.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: outgoing });
  } catch {
    return errorResponse(502, 'Backend unavailable. The free service may be waking up; wait about a minute and refresh.');
  }
}
