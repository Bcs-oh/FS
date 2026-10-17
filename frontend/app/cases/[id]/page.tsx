import { Suspense } from 'react';
import CaseDetailClient from './CaseDetailClient';
import { demoEmailIds } from '@/lib/demoRoutes';

// Cloudflare Pages serves these actual demo routes as static files. All email
// content still comes from the same-origin backend API after the page opens.
export function generateStaticParams() {
  if (process.env.FREE_PAGES_EXPORT !== '1') return [];
  return demoEmailIds().map((id) => ({ id }));
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="empty">Loading…</div>}>
      <CaseDetailClient key={params.id} id={params.id} />
    </Suspense>
  );
}
