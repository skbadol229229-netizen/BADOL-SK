# Dhaka Threads

PROJECT NAME

TRIKON-CLOTHING

PROJECT PURPOSE

A premium, mobile-first men's clothing e-commerce website for customers in Bangladesh. The store sells T-shirts, shirts, shorts, boxers, and related men's clothing.

CORE CUSTOMER JOURNEY

Home → Browse category → View product → Select size/color → Add to cart → Checkout with Cash on Delivery → Order confirmation.

TECH STACK

- Build strictly as a React + Vite Single Page Application.

- Use TypeScript.

- Use Tailwind CSS for styling.

- Use reusable, maintainable React components.

- Use React Router for client-side routing.

- Do not use Next.js, SSR, server components, WordPress, or another framework.

- Use Supabase later for database, admin authentication, orders, products, categories, settings, and customer reviews.

- Use Supabase Edge Functions for secure integrations and external API calls.

- Use Cloudinary URLs for product and banner images.

- The final frontend will be deployed to Cloudflare Pages through GitHub.

DESIGN DIRECTION

The brand must feel premium, clean, modern, editorial, trustworthy, masculine, and fashion-focused.

Use:

- White and warm off-white backgrounds.

- Black and charcoal as primary text and action colors.

- Very subtle beige or sand accents.

- Editorial serif typography for major headings.

- Clean sans-serif typography for body text and interface controls.

- Generous whitespace.

- Strong visual hierarchy.

- Large, realistic fashion photography.

- Subtle borders and restrained shadows.

- Smooth but minimal interactions.

- Product images with a consistent 4:5 ratio.

Suggested typography:

- Headings: Cormorant Garamond or Playfair Display.

- Body and UI: Inter or Manrope.

Suggested palette:

- Primary: #111111

- Background: #FFFFFF

- Secondary background: #F7F5F1

- Muted border: #E7E3DC

- Muted text: #6B6B6B

- Warm accent: #B69A75

AVOID

- No colorful gradients.

- No random neon colors.

- No glassmorphism.

- No excessive rounded cards.

- No oversized decorative icons.

- No crowded sections.

- No generic SaaS dashboard appearance.

- No template-looking purple or blue AI-generated design.

- No unnecessary animations.

- Do not place large amounts of text inside banners.

- Do not make every section look like a floating card.

RESPONSIVE RULES

- Design mobile-first.

- Product grids must show exactly 2 columns on common mobile screens.

- Product grids may show 3 columns on tablets and 4 columns on desktop.

- Maintain comfortable tap targets and spacing.

- Use a sticky mobile bottom navigation.

- Use a standard desktop header on larger screens.

- Avoid horizontal overflow.

- Ensure long product names and sale prices do not break cards.

PUBLIC PAGES

- Home

- Shop

- Category results

- Search results

- Product details

- Cart

- Checkout

- Order success

- About

- Contact

- Delivery and exchange policy

- Privacy policy

- Terms and conditions

- 404 page

PRODUCT DATA

Each product should support:

- Name

- Slug

- Short description

- Full description

- Category

- Multiple images

- Regular price

- Sale price

- Available sizes

- Available colors

- Stock quantity

- SKU

- Featured status

- Best seller status

- New arrival status

- Active/inactive status

BANGLADESH E-COMMERCE REQUIREMENTS

- Display all prices using the ৳ BDT symbol.

- Cash on Delivery should be the default payment method.

- Collect customer name, mobile number, district, area, complete address, and optional order note.

- Allow separate delivery charges for inside Dhaka and outside Dhaka.

- Clearly show delivery time, exchange information, COD availability, and customer support.

- Design primarily for mobile users and slower mobile networks.

ADMIN REQUIREMENTS

The admin panel will later allow an authenticated admin to:

- Add, edit, activate, deactivate, and delete products.

- Manage categories.

- Upload and update homepage banners.

- Manage sizes, colors, prices, stock, and sale prices.

- View and update orders.

- Change order status.

- Manage delivery charges.

- Manage homepage sections and store settings.

- Manage customer reviews.

- View basic order statistics.

UX REQUIREMENTS

Every dynamic screen must include:

- Loading state

- Skeleton state where appropriate

- Empty state

- Error state

- Success feedback

- Form validation

- Disabled button state

- Clear mobile interactions

SECURITY RULES

- Never expose service-role keys, payment secrets, Telegram bot tokens, courier API secrets, or private credentials in frontend code.

- Only public browser variables may use VITE_ prefixes.

- Sensitive integrations must run through Supabase Edge Functions.

- Enable appropriate Supabase Row Level Security policies.

- Never commit .env files.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21f4ae27-7e35-4fe5-9b9e-ffde18b0cdae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
