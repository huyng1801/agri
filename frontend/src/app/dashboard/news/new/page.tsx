'use client';

import { useSearchParams } from 'next/navigation';
import NewsEditorPage from '../news-editor';
import type { NewsSiteKey } from '@/lib/news';

export default function NewNewsPage() {
  const searchParams = useSearchParams();
  return <NewsEditorPage routeSiteKey={siteKeyFromQuery(searchParams.get('siteKey'))} />;
}

function siteKeyFromQuery(value: string | null): NewsSiteKey {
  if (value === 'PASSPORT' || value === 'HTXONLINE') return value;
  return 'AGRIPASSPORT';
}
