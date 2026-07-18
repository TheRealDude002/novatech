# NovaTech Gadgets & Accessories

A production-ready, full-stack e-commerce platform for a phone gadgets & accessories business based in Lekki, Lagos. Built with the MERN stack (MongoDB · Express · React · Node).

> _Quality gadgets, smarter living._

---

## Stack

**Frontend** — React 18, Vite, React Router, Tailwind CSS, Framer Motion, React Hook Form, React Icons, React Hot Toast, Axios.

**Backend** — Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, express-validator, express-rate-limit, Helmet, Compression, Morgan.

---

## Folder structure

```
novatech/
├── backend/
│   ├── server.js                  # Entry point
│   ├── package.json
│   ├── .env.example
│   ├── uploads/                   # Multer destination (auto-created)
│   └── src/
│       ├── app.js                 # Express app config
│       ├── config/db.js           # Mongoose connection
│       ├── models/                # User, Product, Category, Order, Cart,
│       │                          #   Wishlist, Review, Banner, Coupon
│       ├── controllers/           # One per resource
│       ├── routes/                # RESTful routes
│       ├── middleware/            # auth, error, upload, validate
│       └── utils/                 # helpers, seed.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js             # Dev-server proxy → /api
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx
        ├── App.jsx                # Routes (lazy-loaded)
        ├── index.css              # Tailwind + design tokens
        ├── components/            # Header, Footer, ProductCard, ui…
        ├── context/               # Auth, Cart, Wishlist
        ├── pages/                 # Home, Shop, ProductDetails, Cart…
        │   └── admin/             # AdminLayout + 5 admin pages
        └── services/api.js        # Axios instance + endpoint helpers
```

---

## Quick start

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB ≥ 6 (local or Atlas)

### 2. Backend

```bash
cd novatech/backend
cp .env.example .env            # then edit values
npm install
npm run seed                   # seeds admin, customers, 15 categories, ~30 products, banners, coupons
npm run dev                    # http://localhost:5000
```

Seed creates an admin user you can sign in with:

```
email:    admin@novatech.com
password: admin12345
```

### 3. Frontend

```bash
cd novatech/frontend
npm install
npm run dev                    # http://localhost:5173
```

Vite proxies `/api` and `/uploads` to `http://localhost:5000`, so the frontend talks to the backend seamlessly.

---

## Environment variables

### backend/.env

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/novatech

JWT_SECRET=replace-with-a-long-random-string-in-production
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300

UPLOAD_DIR=uploads
MAX_FILE_UPLOAD=5242880
```

The frontend does not require any environment variables in development — it relies on the Vite proxy. For production, set `VITE_API_URL` and update `src/services/api.js` if you host the API on a different origin.

---

## Design system

The frontend design follows an editorial / spec-sheet aesthetic that intentionally avoids the three default AI-design looks (cream + terracotta serif; near-black + acid-green; broadsheet hairlines).

**Palette**

| Token            | Hex       | Use                                          |
| ---------------- | --------- | -------------------------------------------- |
| `ink`            | `#0B0F1A` | Primary text, hero background                |
| `ink.soft`       | `#1A1F2E` | Elevated dark surfaces                       |
| `paper`          | `#F5F2EB` | Page background (warm off-white)             |
| `paper.cool`     | `#FAFAF7` | Cards and inputs                             |
| `accent`         | `#FF4D2E` | CTAs, sale badges, hover accents             |
| `accent.deep`    | `#D63B1F` | Pressed states                               |
| `electric`       | `#4F46E5` | Focus rings, link underlines                 |
| `mist` / `mist.dark` | `#C9C4B8` / `#7A7468` | Borders, secondary text    |

**Typography**

- Display: **Space Grotesk** — characterful geometric sans, used for hero headlines and section titles.
- Body: **Inter** — neutral, readable, used for body copy and form labels.
- Mono: **JetBrains Mono** — used for the "spec stamp" detail (SKUs, stock states, eyebrows).

**Signature element**

Every product card carries a **spec stamp** — a small monospace label that surfaces the SKU and stock state on hover. This treats the catalog like a tech inventory rather than a generic shop, and reinforces the brand promise of "quality gadgets, smarter living."

**Motion**

Framer Motion is used sparingly: page-load fades, scroll-triggered reveals, and hover micro-interactions. All animations honor `prefers-reduced-motion`.

---

## API reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint                   | Auth         | Description                |
| ------ | -------------------------- | ------------ | -------------------------- |
| POST   | `/auth/register`           | Public       | Register a new customer    |
| POST   | `/auth/login`              | Public       | Sign in                    |
| GET    | `/auth/me`                 | Customer+    | Current user               |
| PUT    | `/auth/me`                 | Customer+    | Update profile             |
| PUT    | `/auth/me/password`        | Customer+    | Change password            |
| POST   | `/auth/me/addresses`       | Customer+    | Add shipping address       |
| PUT    | `/auth/me/addresses/:id`   | Customer+    | Update address             |
| DELETE | `/auth/me/addresses/:id`   | Customer+    | Remove address             |

### Products

| Method | Endpoint                  | Auth         | Description                |
| ------ | ------------------------- | ------------ | -------------------------- |
| GET    | `/products`               | Public       | List + filter + paginate   |
| GET    | `/products/featured`      | Public       | Featured products          |
| GET    | `/products/latest`        | Public       | Latest arrivals            |
| GET    | `/products/brands`        | Public       | All brands                 |
| GET    | `/products/:slug`         | Public       | Single product             |
| GET    | `/products/:slug/related` | Public       | Related products           |
| POST   | `/products`               | Admin        | Create product             |
| PUT    | `/products/:id`           | Admin        | Update product             |
| DELETE | `/products/:id`           | Admin        | Delete product             |
| POST   | `/products/:id/stock`     | Admin        | Adjust stock               |

### Categories, Banners, Coupons

Standard CRUD. See `src/routes/` for the exact shape.

### Orders

| Method | Endpoint                  | Auth         | Description                |
| ------ | ------------------------- | ------------ | -------------------------- |
| POST   | `/orders`                 | Customer+    | Place order                |
| POST   | `/orders/coupon/verify`   | Customer+    | Verify a coupon code       |
| GET    | `/orders/mine`            | Customer+    | My orders                  |
| GET    | `/orders/:orderNumber`    | Customer+    | Single order               |
| GET    | `/orders`                 | Admin        | All orders                 |
| PUT    | `/orders/:id/status`      | Admin        | Update status              |

### Cart, Wishlist, Reviews

Cart and Wishlist sync to the server for authenticated users and to `localStorage` for guests. Reviews can be created by any authenticated user; admins can delete any review.

### Dashboard (admin only)

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| GET    | `/dashboard/stats`             | Revenue, orders, low-stock   |
| GET    | `/dashboard/sales?days=30`     | Daily sales chart data       |
| GET    | `/dashboard/top-products`      | Best sellers                 |
| GET    | `/dashboard/categories`        | Revenue split by category    |
| GET    | `/dashboard/recent-orders`     | Latest 5 orders              |

### Uploads

| Method | Endpoint                       | Auth  | Description                |
| ------ | ------------------------------ | ----- | -------------------------- |
| POST   | `/uploads`                     | Admin | Single image (field: image)|
| POST   | `/uploads/multiple`            | Admin | Up to 8 images             |
| POST   | `/uploads/:folder`             | Admin | Into named subfolder       |

Files are served statically from `http://localhost:5000/uploads/<folder>/<filename>`.

---

## Security

- **JWT auth** with 7-day expiry and `passwordChangedAt` invalidation.
- **bcrypt** password hashing with salt rounds = 12.
- **Role-based authorization** (`customer`, `admin`) via `protect` and `admin` middleware.
- **Helmet** for secure HTTP headers.
- **express-rate-limit** on `/api` to mitigate brute-force.
- **express-validator** on every mutation endpoint.
- **CORS** locked to `CLIENT_URL` from env.
- **Multer** validates file type (images only) and size (5 MB).
- Input is sanitized at the model layer with Mongoose validators.

---

## Performance

- Frontend pages are **lazy-loaded** with `React.lazy` + `Suspense`.
- Tailwind purges unused styles in production.
- Product list is paginated server-side (default 12 per page, max 48).
- Images use native `loading="lazy"`.
- Mongoose queries select only the fields each route needs.
- Compression middleware shrinks JSON responses.

---

## Responsive design

- Mobile-first Tailwind breakpoints (`sm`, `md`, `lg`, `xl`).
- Mobile drawer navigation, mobile filter drawer on Shop, mobile admin top bar.
- Spec stamps and product cards collapse gracefully on small screens.

---

## Seed data

Running `npm run seed` clears the database and inserts:

- 1 admin user (`admin@novatech.com` / `admin12345`)
- 3 sample customers (see `seed.js`)
- 15 categories
- ~30 realistic products across all categories, with images, specs, colors, warranties
- 3 banners (hero, promo, midpage)
- 2 coupon codes (`NOVA10`, `LEKKI5000`)
- Sample reviews on featured products
- 1 sample delivered order

---

## Production checklist

Before going live:

1. Replace `JWT_SECRET` with a long random string.
2. Set `NODE_ENV=production` and `CLIENT_URL` to your real domain.
3. Move uploads to S3/Cloudinary (the `multer` storage adapter in `upload.middleware.js` is the only file to change).
4. Put both apps behind HTTPS — Nginx reverse-proxy is recommended.
5. Run `npm run build` in the frontend and serve `dist/` statically.
6. Run the backend under PM2 or as a systemd service.
7. Set up MongoDB backups.

---

## License

Proprietary — © NovaTech Gadgets & Accessories.
