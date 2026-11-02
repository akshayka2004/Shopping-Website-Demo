# ATELIER VÉRA — Custom Clothing Store E-Commerce Website

A complete, production-ready online shopping and store-management platform built according to the **Custom Clothing Store E-Commerce Website Proposal (v1.1)**.

---

## 1. Key Features & Delivered Modules

### Customer-Facing Storefront
- **Branded Home Page (`/`)**: Hero promotional banner, value propositions, curated category cards (*Essentials, Menswear, Womenswear, Outerwear*), featured product arrivals, and editorial studio story.
- **Product Catalogue & Discovery (`/shop`)**: Keyword search, category filter, size filter (`XS`–`XL`), colour filter, price range filter, in-stock toggle, and sorting (*Featured, Newest, Price Low–High, Price High–Low, Name A–Z*).
- **Product Detail Page (`/product/[slug]`)**: High-resolution studio photography, interactive **Colour** and **Size** variant selectors, real-time variant stock validation, quantity control, and instant *Add to Cart* / *Buy It Now*.
- **Shopping Cart & Encrypted Checkout (`/cart`, `/checkout`)**: Quantity updates, free shipping threshold rules (`₹2,999`), server-side price & variant stock verification, **Razorpay Checkout** with server-side HMAC-SHA256 signature verification, Cash on Delivery (`COD`), and order confirmation receipt (`/orders/[id]/confirmation`).
- **Customer Accounts (`/login`, `/register`, `/forgot-password`, `/account`)**: JWT authentication with HTTP-only cookies, profile management, saved delivery addresses, and order history with status tracking.
- **Content & Legal Pages**: `/about`, `/contact`, `/policies/shipping`, `/policies/returns`, `/policies/privacy`, and `/policies/terms`.

### Administrative Dashboard (`/admin`)
- **Role-Based Access Control (RBAC)**: Protected `/admin` interface and `/api/admin/*` routes restricted to `ADMIN` accounts.
- **Overview & Analytics**: Real-time revenue, paid revenue, order status breakdown, total stock units, and low-stock variant alerts.
- **Product & Inventory Management**: Create, edit, activate/deactivate products, toggle featured status, and maintain size/colour variant stock quantities.
- **Category Management**: Create and manage storefront categories/collections.
- **Order & Fulfilment Management**: Search orders, inspect customer & line-item details, and update fulfilment statuses (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` — with automatic stock restoration on cancellation).

---

## 2. Demo Credentials (Handover Checklist)

| Role | Email | Password | Portal Path |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ateliervera.com` | `Admin@123` | `/admin` |
| **Customer** | `customer@ateliervera.com` | `Customer@123` | `/account` |

---

## 3. Local Development & Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Typecheck & build production bundle
npm run typecheck
npm run build

# Run End-to-End Selenium Test Suite
npm run test:e2e
```

---

## 4. Deploying to Vercel

This project is pre-configured for zero-friction deployment on **Vercel** (`vercel.json` + Next.js App Router API routes + automatic `/tmp` and PostgreSQL/Prisma compatibility):

1. Push the repository to GitHub or run `npx vercel` from the project root.
2. (Optional) Configure environment variables from `.env.example` (`JWT_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
3. Deploy — all storefront, checkout, customer account, and admin dashboard routes work immediately.

