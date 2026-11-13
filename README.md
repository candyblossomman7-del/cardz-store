# Cardz — Cloudflare Pages starter

A responsive collectible-card storefront with product filters, search, persistent cart, and a Stripe Checkout endpoint.

## Deploy to Cloudflare Pages

1. Sign in to Cloudflare and open **Workers & Pages → Create → Pages → Upload assets**.
2. Upload the contents of this project folder (not the ZIP itself). Keep the `functions/api/create-checkout-session.js` path intact.
3. Choose a project name such as `cardz`. Cloudflare will assign a `*.pages.dev` address if that name is available.
4. For Pages Functions, use a deployment method that includes the `functions/` directory. If the dashboard's direct upload flow does not detect Functions, connect a Git repository or deploy with Wrangler instead.

## Enable real payments (Stripe)

1. Create a Stripe account and use test mode first.
2. In the Cloudflare Pages project, open **Settings → Variables and Secrets**.
3. Add a secret named `STRIPE_SECRET_KEY` with your Stripe test secret key (`sk_test_...`).
4. Redeploy. Test a complete checkout using Stripe's test card `4242 4242 4242 4242`, a future expiry, and any CVC.
5. Before accepting real payments, replace the demo catalog and prices in both `app.js` and `functions/api/create-checkout-session.js` with your actual inventory and prices, then add your live Stripe secret key (`sk_live_...`) as a secret.

## Important launch checklist

- The product cards and prices are sample/demo listings, not real inventory.
- This starter does not yet include inventory reservation, order database, shipping/tax rules, returns policy, privacy policy, or Stripe webhook/order fulfillment.
- Do not accept live payments until actual inventory, fulfillment, policies, taxes, and order notifications are configured.
- Never put Stripe secret keys in `app.js`, HTML, or any public file. Only store them as Cloudflare secrets.
- Add a Stripe webhook and persistent order/inventory system before production launch.

## Customize the catalog

Edit `PRODUCTS` in `app.js` and the matching server-side `CATALOG` in `functions/api/create-checkout-session.js`. Keep each product ID and price synchronized. Replace the stylized sample card artwork with photos of the actual cards you are selling.
