# storefront-web

KlemStore’s location-aware grocery storefront built with Next.js App Router, TypeScript and Redux Toolkit. The visual language uses the supplied KlemStore mark, electric blue, warm editorial neutrals and playful produce-led product art instead of a conventional supermarket grid.

## Implemented routes

- `/` — editorial homepage, location promise, nearby edit, discovery categories and pantry-plan stories.
- `/shop` — searchable-style catalogue surface with category filters and price sorting.
- `/shop/[category]` — location-aware category route.
- `/product/[slug]` — product detail, freshness note, quantity selection and add-to-bag flow.
- `/cart` — editable bag, quantity controls, delivery threshold and order summary.
- `/checkout` — address context, delivery window selection, payment boundary and confirmation state.
- `/account` — account hub for orders, saved products, places and pantry plans.
- `/orders` — active delivery progress and previous-order repeat entry point.
- `/favorites` — saved product shelf.
- `/plans` — repeatable pantry-plan discovery surface.
- `/help` — searchable-style help surface with expandable FAQ answers.

## Client state rules

Redux Toolkit is the one global client-state standard. It owns the current fulfillment context, cart lines and saved product slugs. The storefront never chooses a store ID in the browser; the location control represents a delivery context, and the server remains responsible for resolving the fulfilling store.

Run with `npm install` then `npm run dev`. The supplied brand asset lives at `public/klemstore-logo.png`. Configure the versioned core API base URL through the server/client API boundary; never expose Google server keys or SyntriCore credentials in this app.

For local API wiring, copy `.env.local.example` to `.env.local`, set the development tenant UUID, and run the Core API with `KLEMSTORE_ALLOW_DEV_TENANT_HEADER=true`. The storefront resolves the delivery context, loads the active catalog, creates a guest cart, synchronizes additions, and requests a checkout quote when the API is available; it keeps the bundled catalogue as a safe offline fallback.
