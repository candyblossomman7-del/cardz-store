// Cloudflare Pages Function. Configure STRIPE_SECRET_KEY as a secret in Pages settings.
// Prices and product IDs are validated on the server; never accept client-supplied prices.
const CATALOG = {
  "sport-001": { name: "Rookie Season", cents: 2400 },
  "poke-001": { name: "Radiant Horizon", cents: 1850 },
  "mtg-001": { name: "Verdant Guardian", cents: 3200 },
  "anime-001": { name: "Grand Voyage", cents: 1400 },
  "sport-002": { name: "The Big Moment", cents: 4200 },
  "poke-002": { name: "Moonlit Spark", cents: 2700 },
  "other-001": { name: "Pop Culture Icon", cents: 2100 },
  "mtg-002": { name: "Arcane Relic", cents: 1600 }
};

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Secure checkout is not configured yet. Add your Stripe secret key in Cloudflare Pages settings." }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return Response.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", new URL("/?checkout=success", request.url).toString());
  params.set("cancel_url", new URL("/?checkout=cancelled", request.url).toString());
  params.set("billing_address_collection", "required");
  params.set("allow_promotion_codes", "true");
  let index = 0;
  for (const item of body.items) {
    const product = CATALOG[item.id];
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return Response.json({ error: "One or more cart items are invalid." }, { status: 400 });
    }
    params.set(`line_items[${index}][price_data][currency]`, "usd");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(product.cents));
    params.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    params.set(`line_items[${index}][quantity]`, String(quantity));
    index++;
  }
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const result = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return Response.json({ error: result.error?.message || "Unable to start checkout." }, { status: 502 });
  }
  return Response.json({ url: result.url });
}