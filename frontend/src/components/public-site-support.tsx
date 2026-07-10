'use client';

import { ChevronUp, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { defaultPublicSiteProfile, normalizePublicSiteProfile, telHref, type PublicSiteProfile } from '@/lib/public-site';
import { ZaloIcon } from './zalo-icon';

export function FooterContactInfo() {
  const profile = usePublicSiteProfile();

  return (
    <div className="grid gap-2 text-sm font-medium text-slate-700">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Liên hệ</p>
      <a href={telHref(profile.hotline)} className="font-semibold text-ink hover:text-leaf">
        Hotline: {profile.hotlineDisplay}
      </a>
      <a href={`mailto:${profile.supportEmail}`} className="hover:text-leaf">
        {profile.supportEmail}
      </a>
      <p className="leading-6 text-slate-600">{profile.address}</p>
      {profile.zaloUrl && (
        <a href={profile.zaloUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-leaf">
          <ZaloIcon size={20} />
          Zalo hỗ trợ
        </a>
      )}
    </div>
  );
}

export function FloatingContactClient() {
  const siteProfile = usePublicSiteProfile();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-[calc(6.5rem+var(--safe-bottom))] right-2 z-40 grid gap-2 lg:bottom-6 lg:right-4">
      {siteProfile.hotline && (
        <a
          href={telHref(siteProfile.hotline)}
          className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-white shadow-soft md:h-10 md:w-10"
          aria-label="Gọi hotline"
        >
          <Phone size={16} aria-hidden="true" />
        </a>
      )}
      {siteProfile.zaloUrl && (
        <a
          href={siteProfile.zaloUrl}
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-0.5 md:h-10 md:w-10"
          aria-label="Chat Zalo"
          target="_blank"
          rel="noreferrer"
        >
          <ZaloIcon size={21} />
        </a>
      )}
      {siteProfile.messengerUrl && (
        <a
          href={siteProfile.messengerUrl}
          className="hidden h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-soft lg:grid"
          aria-label="Messenger"
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={19} aria-hidden="true" />
        </a>
      )}
      {showTop ? (
        <a href="#top" className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-soft md:h-10 md:w-10" aria-label="Lên đầu trang">
          <ChevronUp size={16} aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

function usePublicSiteProfile() {
  const [profile, setProfile] = useState<PublicSiteProfile>(defaultPublicSiteProfile);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`${API_URL}/settings/public/site-profile`, { cache: 'no-store' });
        if (!response.ok) return;
        const body = (await response.json()) as ApiEnvelope<Partial<PublicSiteProfile>>;
        if (!active) return;
        setProfile(normalizePublicSiteProfile(body.data));
      } catch {
        // Keep default public profile when API is unavailable.
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return profile;
}
