const API = (process.env.API_URL || 'https://api.htxonline.vn/api/v1').replace(/\/$/, '');
const email = process.env.E2E_HTX_ADMIN_EMAIL;
const password = process.env.E2E_HTX_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Missing E2E_HTX_ADMIN_EMAIL or E2E_HTX_ADMIN_PASSWORD');
  process.exit(2);
}

let token = '';
const created = [];
const results = [];
const REQUEST_TIMEOUT_MS = Number(process.env.E2E_REQUEST_TIMEOUT_MS || 15000);

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function request(method, path, body) {
  const response = await fetchWithTimeout(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // Some download endpoints do not return JSON.
  }
  return { status: response.status, data: payload.data, message: payload.message };
}

async function must(label, method, path, body) {
  const result = await request(method, path, body);
  results.push(`${label}:${result.status}`);
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`${label}:${result.status}:${result.message || 'request failed'}`);
  }
  return result.data;
}

try {
  const login = await fetchWithTimeout(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginPayload = await login.json();
  token = loginPayload.data?.accessToken;
  if (login.status !== 200 || !token) throw new Error(`login:${login.status}`);
  results.push(`login:${login.status}`);

  const products = await request('GET', '/products?limit=1');
  const sampleProduct = products.data?.[0];
  if (!sampleProduct) throw new Error('missing product dependency');

  const suffix = Date.now().toString(36).toUpperCase();
  const category = await must('product-category.create', 'POST', '/products/categories', {
    name: `E2E Cleanup Category ${suffix}`,
    slug: `e2e-cleanup-category-${suffix.toLowerCase()}`,
    description: 'Temporary E2E category',
    cooperativeId: sampleProduct.cooperativeId
  });
  created.push(['products/categories', category.id]);

  const zone = await must('zone.create', 'POST', '/zones', {
    name: `E2E Cleanup Zone ${suffix}`,
    code: `E2E-${suffix}`,
    address: 'E2E cleanup test',
    areaM2: 1200,
    latitude: 10.111111,
    longitude: 105.111111,
    isPublic: false,
    status: 'ACTIVE'
  });
  created.push(['zones', zone.id]);
  await must('zone.update', 'PATCH', `/zones/${zone.id}`, {
    name: `E2E Cleanup Zone Edited ${suffix}`,
    isPublic: true
  });

  const product = await must('product.create', 'POST', '/products', {
    code: `E2E-${suffix}`,
    name: `E2E Cleanup Product ${suffix}`,
    slug: `e2e-cleanup-${suffix.toLowerCase()}`,
    description: 'Temporary E2E record',
    price: 12345,
    unit: 'kg',
    status: 'PUBLISHED',
    zoneId: zone.id,
    farmerId: sampleProduct.farmerId
  });
  created.push(['products', product.id]);
  await must('product.update', 'PATCH', `/products/${product.id}`, {
    name: `E2E Cleanup Product Edited ${suffix}`,
    price: 23456,
    unit: 'kg'
  });

  const log = await must('log.create', 'POST', '/farming-logs', {
    productId: product.id,
    zoneId: zone.id,
    logDate: '2026-09-03T00:00:00.000Z',
    activityType: 'SEEDING',
    description: `E2E cleanup log ${suffix}`,
    status: 'DRAFT'
  });
  created.push(['farming-logs', log.id]);
  await must('log.update', 'PATCH', `/farming-logs/${log.id}`, {
    description: `E2E cleanup log edited ${suffix}`,
    status: 'PUBLISHED'
  });

  const certification = await must('cert.create', 'POST', '/certifications', {
    productId: product.id,
    zoneId: zone.id,
    name: `E2E Cleanup Certification ${suffix}`,
    issuer: 'E2E',
    isPublic: false
  });
  created.push(['certifications', certification.id]);
  await must('cert.update', 'PATCH', `/certifications/${certification.id}`, {
    name: `E2E Cleanup Certification Edited ${suffix}`,
    isPublic: true
  });

  const passport = await must('passport.create', 'POST', '/passports', {
    productId: product.id,
    status: 'DRAFT'
  });
  created.push(['passports', passport.id]);
  await must('passport.update', 'PATCH', `/passports/${passport.id}`, { status: 'PUBLISHED' });
} catch (error) {
  results.push(`ERROR:${error instanceof Error ? error.message : String(error)}`);
} finally {
  for (const [resource, id] of created.reverse()) {
    const result = await request('DELETE', `/${resource}/${id}`);
    results.push(`${resource}.cleanup:${result.status}`);
  }
}

console.log(results.join(' | '));
if (results.some((item) => item.startsWith('ERROR:') || item.endsWith(':400') || item.endsWith(':401') || item.endsWith(':403') || item.endsWith(':404') || item.endsWith(':500'))) {
  process.exitCode = 1;
}
