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

export const GET: APIRoute = async ({ params, url, request }) => {
  const { affiliate } = params;
  const subId = url.searchParams.get('subid') || 'direct';
  const referrer = url.searchParams.get('ref') || request.headers.get('referer') || 'direct';
  const pageUrl = url.searchParams.get('page') || referrer;
  const userParam = url.searchParams.get('user') || null;
  const sessionId = url.searchParams.get('session') || `session-${Date.now()}`;

  // Extract device type and browser from User-Agent
  const userAgent = request.headers.get('user-agent') || '';
  const deviceType = userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android') ? 'Mobile' : 'Desktop';
  const browser = extractBrowser(userAgent);

  // Get IP address (Vercel provides this)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Generate Click ID
  const clickId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get the affiliate link
  const redirectUrl = AFFILIATE_LINKS[affiliate as string];
  if (!redirectUrl) {
    return new Response('Affiliate not found', { status: 404 });
  }

  // Log to Airtable
  try {
    await fetch(`https://api.airtable.com/v0/${process.meta.env.AIRTABLE_BASE_ID}/Clicks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.meta.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Click ID': clickId,
              'User': userParam,
              'Session': sessionId,
              'Page URL': pageUrl,
              'Device Type': deviceType,
              'Browser': browser,
              'IP Address': ip,
              'Timestamp': new Date().toISOString(),
              'affiliate': affiliate,
              'subId': subId,
              'referrer': referrer,
              'redirectUrl': redirectUrl,
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.log('Airtable log failed (non-critical):', error);
  }

  // Redirect
  return new Response(null, {
    status: 302,
    headers: { Location: redirectUrl },
  });
};

// Helper function to extract browser from User-Agent
function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Other';
}