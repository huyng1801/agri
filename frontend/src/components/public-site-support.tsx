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
      <a href={`mailto:${profile.supportEmail}`} className="hover:text-leaf">{profile.supportEmail}</a>
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

  return (
    <div className="fixed bottom-[calc(5.8rem+var(--safe-bottom))] right-3 z-40 grid gap-2 lg:bottom-6">
      {siteProfile.hotline && (
        <a href={telHref(siteProfile.hotline)} className="grid h-11 w-11 place-items-center rounded-full bg-leaf text-white shadow-soft" aria-label="Gọi hotline">
          <Phone size={19} aria-hidden="true" />
        </a>
      )}
      {siteProfile.zaloUrl && (
        <a
          href={siteProfile.zaloUrl}
          className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-0.5"
          aria-label="Chat Zalo"
          target="_blank"
          rel="noreferrer"
        >
          <ZaloIcon size={28} />
        </a>
      )}
      {siteProfile.messengerUrl && (
        <a href={siteProfile.messengerUrl} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-soft" aria-label="Messenger" target="_blank" rel="noreferrer">
          <MessageCircle size={19} aria-hidden="true" />
        </a>
      )}
      <a href="#top" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-soft" aria-label="Lên đầu trang">
        <ChevronUp size={19} aria-hidden="true" />
      </a>
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
