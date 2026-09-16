import LoginForm from './login-form';
import { authPortalFromHost, publicSiteKeyFromHost } from '@/lib/domain';
import { getRequestHostname } from '@/lib/request-site';

export default async function LoginPage() {
  const hostname = await getRequestHostname();
  return <LoginForm initialPortal={authPortalFromHost(hostname)} siteKey={publicSiteKeyFromHost(hostname)} />;
}
