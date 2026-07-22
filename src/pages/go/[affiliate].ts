export const prerender = false;

import type { APIRoute } from 'astro';

// Affiliate link destinations
const AFFILIATE_LINKS: Record<string, string> = {
  wise: 'https://wise.com/invite/ihpc/rogeriom', 
  kraken: 'https://proinvite.kraken.com/9f1e/acqvlxzj', 
  revolut: 'https://revolut.com/referral/?referral-code=rogeriomatsu!FEB1-26-AR&geo-redirect', 
  ynab: 'https://ynab.com/referral/?ref=refpk68bCJMxZQvZeiD&sponsor_name=Rog%C3%A9rio&utm_source=customer_referral',
  n26: 'https://n26.com/r/rogeriom7464',
  etoro: 'https://etoro.tw/48MXwwN',
};

export const GET: APIRoute = async ({ params, url }) => {
  const { affiliate } = params;
  const subId = url.searchParams.get('subid') || 'direct';

  console.log(`[AFFILIATE CLICK] ${affiliate} | SubID: ${subId} | Time: ${new Date().toISOString()}`);

  const link = AFFILIATE_LINKS[affiliate as string];
  if (!link) {
    return new Response('Affiliate not found', { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: link },
  });
};