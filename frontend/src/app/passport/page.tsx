import { permanentRedirect } from 'next/navigation';

export default function LegacyPassportPage() {
  permanentRedirect('/');
}
