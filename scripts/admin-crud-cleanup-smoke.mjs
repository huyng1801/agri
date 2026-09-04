const API = (process.env.API_URL || 'https://api.htxonline.vn/api/v1').replace(/\/$/, '');
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD');
  process.exit(2);
}

let token = '';
const created = [];
const results = [];
const timeoutMs = Number(process.env.E2E_REQUEST_TIMEOUT_MS || 15000);

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let payload = {};
    try { payload = await response.json(); } catch { /* no JSON body */ }
    return { status: response.status, data: payload.data, message: payload.message };
  } finally {
    clearTimeout(timer);
  }
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
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginPayload = await login.json();
  token = loginPayload.data?.accessToken || '';
  if (login.status !== 200 || !token) throw new Error(`login:${login.status}`);
  results.push(`login:${login.status}`);

  const suffix = Date.now().toString(36).toUpperCase();
  const cooperative = await must('cooperative.create', 'POST', '/cooperatives', {
    name: `E2E Admin HTX ${suffix}`,
    code: `E2E-${suffix}`,
    address: 'Địa chỉ kiểm thử E2E',
    province: 'Đồng Tháp',
    phone: '0907001200',
    email: `e2e-admin-${suffix.toLowerCase()}@example.com`,
    representative: 'Quản trị E2E'
  });
  created.push(['cooperatives', cooperative.id]);
  await must('cooperative.update', 'PATCH', `/cooperatives/${cooperative.id}`, {
    name: `E2E Admin HTX Edited ${suffix}`,
    representative: 'Quản trị E2E đã sửa'
  });

  const user = await must('user.create', 'POST', '/users', {
    email: `e2e-admin-user-${suffix.toLowerCase()}@example.com`,
    fullName: `E2E Admin User ${suffix}`,
    password: 'StrongPass123!',
    role: 'ADMIN_HTX',
    cooperativeId: cooperative.id,
    phone: '0907001200'
  });
  created.push(['users', user.id]);
  await must('user.update', 'PATCH', `/users/${user.id}`, { fullName: `E2E Admin User Edited ${suffix}` });

  const plan = await must('plan.create', 'POST', '/subscription-plans', {
    name: `E2E Admin Plan ${suffix}`,
    slug: `e2e-admin-plan-${suffix.toLowerCase()}`,
    priceMonthly: 12345,
    priceYearly: 123450,
    featuresJson: ['E2E feature']
  });
  created.push(['subscription-plans', plan.id]);
  await must('plan.update', 'PATCH', `/subscription-plans/${plan.id}`, { name: `E2E Admin Plan Edited ${suffix}`, priceMonthly: 23456 });

  await must('subscription.assign', 'POST', `/cooperatives/${cooperative.id}/subscription`, {
    planId: plan.id,
    status: 'ACTIVE',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2027-09-01T00:00:00.000Z',
    autoRenew: false,
    createInvoice: false,
    note: 'Subscription kiểm thử E2E'
  });
  await must('subscription.update', 'PATCH', `/cooperatives/${cooperative.id}/subscription`, {
    status: 'TRIAL',
    autoRenew: true
  });
  created.push(['subscriptions', cooperative.id]);

  const invoice = await must('invoice.create', 'POST', '/invoices', {
    cooperativeId: cooperative.id,
    invoiceCode: `E2E-INV-${suffix}`,
    amount: 456789,
    currency: 'VND',
    status: 'UNPAID',
    dueDate: '2026-12-31T00:00:00.000Z',
    note: 'Hóa đơn kiểm thử E2E'
  });
  created.push(['invoices', invoice.id]);
  await must('invoice.update', 'PATCH', `/invoices/${invoice.id}`, { amount: 567890, note: 'Hóa đơn E2E đã sửa' });
  await must('invoice.mark-paid', 'POST', `/invoices/${invoice.id}/mark-paid`, { paymentMethod: 'E2E' });
  await must('invoice.mark-unpaid', 'POST', `/invoices/${invoice.id}/mark-unpaid`);

  const category = await must('news-category.create', 'POST', '/news/categories', {
    name: `E2E News Category ${suffix}`,
    slug: `e2e-news-category-${suffix.toLowerCase()}`,
    description: 'Danh mục kiểm thử E2E'
  });
  created.push(['news/categories', category.id]);
  await must('news-category.update', 'PATCH', `/news/categories/${category.id}`, { name: `E2E News Category Edited ${suffix}` });

  const article = await must('news.create', 'POST', '/news', {
    categoryId: category.id,
    title: `E2E News Article ${suffix}`,
    slug: `e2e-news-article-${suffix.toLowerCase()}`,
    bodyHtml: '<p>Nội dung kiểm thử E2E.</p>',
    excerpt: 'Mô tả kiểm thử E2E.',
    status: 'DRAFT'
  });
  created.push(['news', article.id]);
  await must('news.update', 'PATCH', `/news/${article.id}`, { title: `E2E News Article Edited ${suffix}` });
} catch (error) {
  results.push(`ERROR:${error instanceof Error ? error.message : String(error)}`);
} finally {
  for (const [resource, id] of created.reverse()) {
    const isActionCleanup = resource === 'invoices' || resource === 'subscriptions';
    const path = resource === 'invoices'
      ? `/${resource}/${id}/cancel`
      : resource === 'subscriptions'
        ? `/cooperatives/${id}/subscription/cancel`
        : `/${resource}/${id}`;
    const method = isActionCleanup ? 'POST' : 'DELETE';
    const result = await request(method, path);
    results.push(`${resource}.cleanup:${result.status}`);
  }
}

console.log(results.join(' | '));
if (results.some((item) => /:(400|401|403|404|500)$/.test(item) || item.startsWith('ERROR:'))) process.exitCode = 1;
