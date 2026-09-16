import RegisterForm from './register-form';
import { authPortalFromHost, publicSiteKeyFromHost } from '@/lib/domain';
import { getRequestHostname } from '@/lib/request-site';

export default async function RegisterPage() {
  const hostname = await getRequestHostname();
  return <RegisterForm initialPortal={authPortalFromHost(hostname)} siteKey={publicSiteKeyFromHost(hostname)} />;
}
