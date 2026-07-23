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

export const GET: APIRoute = async ({ params, url }) => {
  const { affiliate } = params;
  const subId = url.searchParams.get('subid') || 'direct';

  // Log to Airtable
  try {
    await fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Clicks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              affiliate,
              subId,
              timestamp: new Date().toISOString(),
              referrer: url.searchParams.get('ref') || 'direct',
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.log('Airtable log failed (non-critical):', error);
  }

  // Get the affiliate link
  const link = AFFILIATE_LINKS[affiliate as string];
  if (!link) {
    return new Response('Affiliate not found', { status: 404 });
  }

  // Redirect
  return new Response(null, {
    status: 302,
    headers: { Location: link },
  });
};