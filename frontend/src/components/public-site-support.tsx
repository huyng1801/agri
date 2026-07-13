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
  const [showFloating, setShowFloating] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const isMobile = window.innerWidth < 1024;
      setMobileViewport(isMobile);
      setShowTop(window.scrollY > (isMobile ? 1320 : 500));
      setShowFloating(!isMobile || window.scrollY > 760);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const showContactActions = showFloating && (!footerVisible || !mobileViewport);
  const showHotline = showContactActions && Boolean(siteProfile.hotline) && !mobileViewport;
  const showZalo = showContactActions && Boolean(siteProfile.zaloUrl) && !mobileViewport;
  const showTopButton = showTop && (!footerVisible || !mobileViewport);

  if (!showHotline && !showZalo && !showTopButton && !(showContactActions && siteProfile.messengerUrl)) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(6.4rem+var(--safe-bottom))] right-3 z-40 grid gap-2 lg:bottom-6 lg:right-4">
      {showHotline && (
        <a href={telHref(siteProfile.hotline)} className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-white shadow-soft" aria-label="Gọi hotline">
          <Phone size={16} aria-hidden="true" />
        </a>
      )}
      {showZalo && (
        <a
          href={siteProfile.zaloUrl}
          className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-0.5"
          aria-label="Chat Zalo"
          target="_blank"
          rel="noreferrer"
        >
          <ZaloIcon size={21} />
        </a>
      )}
      {showContactActions && siteProfile.messengerUrl && (
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
      {showTopButton ? (
        <a href="#top" className="grid h-9 w-9 place-items-center rounded-full bg-white/96 text-ink shadow-soft ring-1 ring-slate-200/80" aria-label="Lên đầu trang">
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
