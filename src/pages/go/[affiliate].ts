import type { APIRoute } from 'astro';

const AFFILIATE_LINKS: Record<string, string> = {
  wise: 'https://wise.com/invite/ihpc/rogeriom',
  kraken: 'https://proinvite.kraken.com/9f1e/acqvlxzj',
  revolut: 'https://revolut.com/referral/?referral-code=rogeriomatsu!FEB1-26-AR&geo-redirect',
  ynab: 'https://ynab.com/referral/?ref=refpk68bCJMxZQvZeiD&sponsor_name=Rog%C3%A9rio&utm_source=customer_referral',
  n26: 'https://n26.com/r/rogeriom7464',
  etoro: 'https://etoro.tw/48MXwwN',
};

export const prerender = false;

// Reads an env var safely from every possible source. Cannot throw.
function getEnv(key: string): string | undefined {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
  } catch {
    /* ignore */
  }
  try {
    if (typeof process !== 'undefined' && process?.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function extractBrowser(ua: string): string {
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Other';
}

export const GET: APIRoute = async ({ params, url, request }) => {
  console.log('ROUTE VERSION 5'); // deploy verification marker

  const { affiliate } = params;
  const redirectUrl = AFFILIATE_LINKS[affiliate as string];
  if (!redirectUrl) {
    return new Response('Affiliate not found', { status: 404 });
  }

  const subId = url.searchParams.get('subid') || 'direct';
  const referrer =
    url.searchParams.get('ref') || request.headers.get('referer') || 'direct';
  const userAgent = request.headers.get('user-agent') || '';
  const deviceType =
    /Mobile|iPhone|Android/.test(userAgent) ? 'Mobile' : 'Desktop';
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const clickId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  try {
    const baseId = getEnv('AIRTABLE_BASE_ID');
    const apiKey = getEnv('AIRTABLE_API_KEY');
    console.log('Env check:', {
      baseId: baseId ? `found (${baseId.slice(0, 6)}...)` : 'MISSING',
      apiKey: apiKey ? `found (${apiKey.slice(0, 6)}...)` : 'MISSING',
    });

    if (baseId && apiKey) {
      const fields: Record<string, string> = {
        'Click ID': clickId,
        'Session': url.searchParams.get('session') || clickId,
        'Page URL': url.searchParams.get('page') || referrer,
        'Device Type': deviceType,
        'Browser': extractBrowser(userAgent),
        'IP Address': ip,
        'Timestamp': new Date().toISOString(),
        'affiliate': String(affiliate),
        'subId': subId,
        'referrer': referrer,
        'redirectUrl': redirectUrl,
      };
      const user = url.searchParams.get('user');
      if (user) fields['User'] = user;

      const res = await fetch(
        `https://api.airtable.com/v0/${baseId}/Clicks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: [{ fields }] }),
        }
      );
      const resText = await res.text();
      console.log('Airtable response:', res.status, resText.slice(0, 300));
    }
  } catch (error) {
    console.log('Airtable log failed (non-critical):', error);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
};