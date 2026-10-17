import { proxyBackend, type BackendEnv } from '../cloudflare/proxy';

export const onRequest = ({ request, env }: { request: Request; env: BackendEnv }) =>
  proxyBackend(request, env, true);
