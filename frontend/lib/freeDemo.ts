// This is a public build-time feature switch, never a credential.
export const FREE_DEMO = process.env.NEXT_PUBLIC_FREE_DEMO === '1';
export const FREE_DEMO_ANALYSIS_MESSAGE = 'AI analysis and batch runs are disabled in this free demo. Open an email to read its original body and attachment text.';
export const FREE_DEMO_WAKE_MESSAGE = 'The free backend may be waking up. Wait about a minute, then refresh this page.';

export function isAnalysisRequest(path: string): boolean {
  const pathname = path.split('?')[0];
  return /^\/api\/analyse\//.test(pathname)
    || pathname === '/api/runs/full-inbox'
    || /^\/api\/runs\/[^/]+\/retry\//.test(pathname);
}
