'use client';

import { useParams, useSearchParams } from 'next/navigation';
import NewsEditorPage from '../news-editor';
import type { NewsSiteKey } from '@/lib/news';

export default function EditNewsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  return <NewsEditorPage routeArticleId={params.id} routeSiteKey={siteKeyFromQuery(searchParams.get('siteKey'))} />;
}

function siteKeyFromQuery(value: string | null): NewsSiteKey {
  if (value === 'PASSPORT' || value === 'HTXONLINE') return value;
  return 'AGRIPASSPORT';
}
