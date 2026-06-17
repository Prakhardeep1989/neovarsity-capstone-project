# HOMELY Meals - A Cloud Kitchen

A full-stack MERN restaurant ordering application for **HOMELY Meals**, a cloud kitchen in Chandausi, UP serving fresh homely food with online ordering, Razorpay payments, and order receipt emails via Resend.

## Features

- JWT authentication with **CUSTOMER** and **ADMIN** roles
- Admin-only product management (create, edit, delete, status control)
- Product categories: **THALI**, **COMBO_MEAL**, **ADD_ON**
- Product status: **AVAILABLE** / **INACTIVE**
- Shopping cart with delivery details validation
- Razorpay Checkout with server-side payment verification and webhook backup
- Order lifecycle: DRAFT → ORDERED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
- Order receipt emails via **Resend**
- Customer order history and admin order management
- Responsive design with Tailwind CSS
- Redux Toolkit state management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Payments | Razorpay |
| Email | Resend |
| Hosting | Vercel (frontend), Render (backend) |

## Environments

| Environment | Frontend env file | Backend env file | Database | Razorpay | Resend |
|-------------|-------------------|------------------|----------|----------|--------|
| **Local** | `frontend/.env` | `backend/.env` | e.g. `homely-dev` | Test (`rzp_test_...`) | Sandbox |
| **Stage** | `frontend/.env.stage` | `backend/.env.stage` | e.g. `homely-stage` (same M0 cluster) | Same test keys as local | Same as local |
| **Production** | Vercel dashboard | Render dashboard | Separate DB | Live keys | Verified domain |

Templates (safe to commit): `.env.example`, `.env.stage.example`  
Secrets (gitignored): `.env`, `.env.stage`

### Create stage env files on your machine

```bash
# Backend
cd backend
copy .env.stage.example .env.stage    # Windows
# cp .env.stage.example .env.stage    # Mac/Linux

# Frontend
cd frontend
copy .env.stage.example .env.stage
```

Fill `backend/.env.stage`:

1. Copy `RAZORPAY_*`, `RESEND_*`, `FROM_EMAIL`, `CONTACT_EMAIL`, `RESEND_SANDBOX_EMAIL` from `backend/.env` (unchanged).
2. Set `MONGODB_URL` to the **same Atlas cluster** but a **different database name**, e.g. `.../homely-stage?retryWrites=true&w=majority`.
3. Leave `FRONTEND_URL` and `WEBHOOK_URL` as placeholders until after deploy.

Fill `frontend/.env.stage`:

1. Copy `REACT_APP_RAZORPAY_KEY_ID` from `frontend/.env`.
2. Set `REACT_APP_SERVER_DOMIN` after Render deploy.

Paste the same values into **Render** and **Vercel** dashboards (they do not read `.env.stage` files from the repo).

## Stage Deployment (Vercel + Render — free tier)

Test-mode Razorpay and Resend sandbox, separate Atlas DB, same keys as local. Deploy **backend first**, then frontend.

### 1. MongoDB Atlas — stage database

On your existing **M0 cluster** (same as local):

1. No new cluster needed — only a **new database name** in the connection string.
2. Local might use `.../homely-dev?...` → stage uses `.../homely-stage?...`
3. Network Access must allow `0.0.0.0/0` (Render free tier).
4. Put the stage connection string in `backend/.env.stage` → `MONGODB_URL`.

Atlas creates the database on first write (first API request after deploy).

### 2. Backend on Render (free tier)

**Option A — Blueprint:** Render → **New** → **Blueprint** → connect repo → use `render.stage.yaml`  
Creates service **`homely-meals-api-stage`** (`plan: free`, `rootDir: backend`).

**Option B — Manual:**

| Setting | Value |
|---------|--------|
| Name | `homely-meals-api-stage` |
| Plan | **Free** |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/` |

**Environment variables** — copy from `backend/.env.stage` into Render → Environment:

```env
NODE_ENV=production
PORT=8080
MONGODB_URL=mongodb+srv://...@cluster0.xxxxx.mongodb.net/homely-stage?retryWrites=true&w=majority
JWT_SECRET=<from .env.stage>
FRONTEND_URL=https://your-app-stage.vercel.app
RATE_LIMIT_MAX=200
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=<same as local>
RAZORPAY_WEBHOOK_SECRET=<random secret>
WEBHOOK_URL=https://homely-meals-api-stage.onrender.com/api/payments/razorpay/webhook
RESEND_API_KEY=<same as local>
FROM_EMAIL=HOMELY Meals <homely_meals@resend.dev>
CONTACT_EMAIL=<same as local>
RESEND_SANDBOX_EMAIL=<same as local>
```

After deploy, verify: `GET https://homely-meals-api-stage.onrender.com/` → `HOMELY Meals API is running`

**Free tier note:** Service sleeps after ~15 min idle; first request may take 30–60s (cold start).

### 3. Frontend on Vercel (free tier)

1. [vercel.com/new](https://vercel.com/new) → import repo.
2. **Root Directory:** `frontend`
3. **Framework:** Create React App | **Build:** `npm run build` | **Output:** `build`
4. **Plan:** Hobby (free)

**Environment variables** — copy from `frontend/.env.stage` (Environment: **Production**):

```env
REACT_APP_SERVER_DOMIN=https://homely-meals-api-stage.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_...
```

Deploy, then copy your Vercel URL (e.g. `https://neovarsity-capstone-project.vercel.app`).

### 4. Link frontend ↔ backend (CORS)

1. Set `FRONTEND_URL` in `backend/.env.stage` to your **exact** Vercel URL (no trailing `/`).
2. Paste the same value into **Render** → Environment.
3. **Redeploy** Render backend.

### 5. Razorpay webhook (test mode)

From `backend/` with `backend/.env.stage` filled:

```bash
npm run setup:webhook:stage
```

Or manually in [Razorpay Dashboard → Webhooks (Test Mode)](https://dashboard.razorpay.com/app/webhooks):

- URL: `https://homely-meals-api-stage.onrender.com/api/payments/razorpay/webhook`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET` on Render
- Events: `payment.captured`, `payment.failed`, `order.paid`

### 6. Stage checklist

- [ ] `backend/.env.stage` and `frontend/.env.stage` exist locally (gitignored)
- [ ] Stage DB name differs from local (e.g. `homely-stage` vs `homely-dev`)
- [ ] Render env matches `backend/.env.stage`
- [ ] Vercel env matches `frontend/.env.stage`
- [ ] `FRONTEND_URL` on Render = Vercel URL exactly
- [ ] Menu, login, checkout work with `success@razorpay`
- [ ] Webhook logs show `200` in Razorpay (Test Mode)
- [ ] Promote admin in **stage** DB only (see [Admin Setup](#admin-setup))

---

## Production Deployment (later)

When going live, use **live** Razorpay keys, a **verified Resend domain**, and a separate production DB. Use `render.yaml` (service `homely-meals-api`) and production env vars — do not reuse `.env.stage` for production.

Deploy the **backend first**, then the frontend, so you have the Render API URL for Vercel env vars.

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access (`0.0.0.0/0` for Render).
3. Copy the connection string into `MONGODB_URL`.

### 2. Backend on Render

**Option A — Blueprint (recommended):** Connect this repo on [Render](https://render.com) and use the root `render.yaml`. It creates a web service with `rootDir: backend`.

**Option B — Manual web service:**

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/` |

**Environment variables** (Render dashboard → Environment):

```env
PORT=8080
NODE_ENV=production
MONGODB_URL=mongodb+srv://...
JWT_SECRET=<long-random-string>
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=<random-secret>
WEBHOOK_URL=https://YOUR-SERVICE.onrender.com/api/payments/razorpay/webhook
FRONTEND_URL=https://YOUR-APP.vercel.app
RESEND_API_KEY=re_...
FROM_EMAIL=HOMELY Meals <orders@yourdomain.com>
CONTACT_EMAIL=your-email@example.com
```

After deploy, note your Render URL (e.g. `https://homely-meals-api.onrender.com`).

**Razorpay webhook (production):** Set `WEBHOOK_URL` to your Render URL, then run locally once with live keys:

```bash
cd backend
npm run setup:webhook
```

Or add the webhook manually in [Razorpay Dashboard → Webhooks](https://dashboard.razorpay.com/app/webhooks).

**MongoDB Atlas:** In Network Access, allow `0.0.0.0/0` or Render’s outbound IPs if you restrict access.

### 3. Frontend on Vercel

1. Import the repo at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Create React App** (build: `npm run build`, output: `build`).
4. `frontend/vercel.json` is included for React Router SPA rewrites.

**Environment variables** (Vercel → Settings → Environment Variables):

```env
REACT_APP_SERVER_DOMIN=https://YOUR-SERVICE.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_...
```

Redeploy after changing env vars (CRA bakes them in at build time).

### 4. Post-deploy checklist

- [ ] Backend health: `GET https://YOUR-SERVICE.onrender.com/` returns `HOMELY Meals API is running`
- [ ] Frontend loads menu and login works (CORS: `FRONTEND_URL` must match your Vercel URL exactly)
- [ ] Test checkout with Razorpay **live** keys on production
- [ ] Webhook logs show `200` in Razorpay Dashboard
- [ ] Resend: verify your domain and set production `FROM_EMAIL`
- [ ] Promote an admin user in MongoDB (see [Admin Setup](#admin-setup))

### Environment variable matrix

| Variable | Where | Purpose |
|----------|-------|---------|
| `REACT_APP_SERVER_DOMIN` | Vercel | Backend API base URL |
| `REACT_APP_RAZORPAY_KEY_ID` | Vercel | Razorpay Checkout public key |
| `MONGODB_URL` | Render | MongoDB connection |
| `JWT_SECRET` | Render | JWT signing |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Render | Payment API |
| `RAZORPAY_WEBHOOK_SECRET` / `WEBHOOK_URL` | Render | Webhook backup path |
| `FRONTEND_URL` | Render | CORS allowed origin (your Vercel URL) |
| `RESEND_API_KEY` / `FROM_EMAIL` / `CONTACT_EMAIL` | Render | Order receipts & contact form |

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account
- Resend account (for order receipt emails)

### Backend

```bash
cd backend
npm install
```

Copy the template and fill in your values:

```bash
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux
```

See `backend/.env.example` for comments on each variable. Minimum required:

```env
PORT=8080
FRONTEND_URL=http://localhost:3000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://YOUR-PUBLIC-URL/api/payments/razorpay/webhook
RESEND_API_KEY=re_...
FROM_EMAIL=HOMELY Meals <homely_meals@resend.dev>
CONTACT_EMAIL=your-email@example.com
RESEND_SANDBOX_EMAIL=your-email@example.com
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Copy the template and fill in your values:

```bash
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux
```

See `frontend/.env.example` for comments on each variable:

```env
REACT_APP_SERVER_DOMIN=http://localhost:8080
REACT_APP_RAZORPAY_KEY_ID=rzp_test_...
```

`REACT_APP_RAZORPAY_KEY_ID` must be the same Razorpay test key as `RAZORPAY_KEY_ID` in `backend/.env`.

Start the app:

```bash
npm start
```

## Order & Payment Flow

When a customer clicks **Pay Now**, the app creates a **DRAFT** order in MongoDB and a matching Razorpay order. Payment confirmation can arrive via two paths — both are idempotent (an already **PAID** order is never updated twice).

```
Cart (Pay Now)
    │
    ▼
POST /api/orders/create-payment-order
    │  Creates DRAFT order (payment: PENDING)
    │  Creates Razorpay order (notes include MongoDB orderId)
    ▼
Razorpay Checkout modal (customer pays)
    │
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
Primary (browser)                    Backup (server)
POST /api/orders/verify-payment      POST /api/payments/razorpay/webhook
    │  HMAC verify with KEY_SECRET         │  HMAC verify with WEBHOOK_SECRET
    │  Fetch payment details from Razorpay │  Events: payment.captured, order.paid
    ▼                                      ▼
markOrderAsPaid()  ◄──────────────────────┘
    │  status: DRAFT → ORDERED
    │  payment.status: PENDING → PAID
    │  Receipt email via Resend
    ▼
Customer sees /payment-success
Admin advances: ORDERED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
```

### Step-by-step

| Step | What happens |
|------|----------------|
| 1 | Customer submits cart with delivery address and phone |
| 2 | Backend validates items, loads prices from MongoDB, creates **DRAFT** order |
| 3 | Backend creates Razorpay order; frontend opens Checkout with `order_id` |
| 4 | Customer completes payment in Razorpay modal |
| 5a | **Primary:** Frontend calls `verify-payment` with Razorpay signature → order marked **ORDERED** / **PAID**, receipt email sent |
| 5b | **Backup:** If the browser closes before step 5a, Razorpay sends a webhook → same `markOrderAsPaid()` logic runs |
| 6 | Failed payments set `payment.status` to **FAILED** (via webhook `payment.failed` or failed signature verification) |
| 7 | Admin updates fulfillment status from the Orders page |

### Payment paths compared

| | `verify-payment` | Webhook |
|--|------------------|---------|
| Trigger | Razorpay Checkout `handler` callback in browser | Razorpay POST to your public URL |
| Auth | `RAZORPAY_KEY_SECRET` (payment signature) | `RAZORPAY_WEBHOOK_SECRET` (webhook signature) |
| When needed | Normal happy path — always runs if customer stays on page | Backup when tab closes, network drops, or verify call fails |
| Receipt email | Yes | Yes (whichever path confirms first) |

Configure the webhook for local dev with ngrok and `npm run setup:webhook` (see below). In production, set `WEBHOOK_URL` to your Render backend URL.

## Razorpay Webhook Setup

Razorpay pushes payment events to your backend over HTTPS. This is the **backup** confirmation path; the primary path is still the browser calling `POST /api/orders/verify-payment` after Checkout succeeds.

**Endpoint:** `POST /api/payments/razorpay/webhook`  
**Events handled:** `payment.captured`, `payment.failed`, `order.paid`

### 1. Generate a webhook secret

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any long random string
```

Add to `backend/.env`:

```env
RAZORPAY_WEBHOOK_SECRET=your_random_secret_here
WEBHOOK_URL=https://YOUR-PUBLIC-URL/api/payments/razorpay/webhook
```

### 2. Local development (ngrok)

Razorpay must reach your server over HTTPS. Use [ngrok](https://ngrok.com):

```bash
ngrok http 8080
```

Copy the HTTPS URL and set:

```env
WEBHOOK_URL=https://abc123.ngrok-free.app/api/payments/razorpay/webhook
```

### 3. Register the webhook with Razorpay

From the `backend` folder:

```bash
npm run setup:webhook
```

This creates or updates the webhook in your Razorpay **Test Mode** account using `WEBHOOK_URL` and `RAZORPAY_WEBHOOK_SECRET`. It registers `payment.captured`, `payment.failed`, and `order.paid`.

Restart the backend after updating `.env`.

### 4. Production (Render / similar)

Set the same env vars on your host:

```env
WEBHOOK_URL=https://your-backend.onrender.com/api/payments/razorpay/webhook
RAZORPAY_WEBHOOK_SECRET=your_secret
```

Run `npm run setup:webhook` once with **live** API keys, or add the webhook manually in [Razorpay Dashboard → Webhooks](https://dashboard.razorpay.com/app/webhooks).

### Manual dashboard setup (alternative)

1. Razorpay Dashboard → **Webhooks** → **+ Add New Webhook**
2. URL: `https://your-backend-url/api/payments/razorpay/webhook`
3. Secret: same value as `RAZORPAY_WEBHOOK_SECRET`
4. Events: `payment.captured`, `payment.failed`, `order.paid`
5. Save and copy the secret into `.env` if Razorpay generated it

### Verify it works

1. Place a test order and complete payment
2. Check backend logs for `[RAZORPAY] Order ... marked ORDERED/PAID via webhook`
3. In Razorpay Dashboard → Webhooks → your webhook → **Logs**, confirm `200` responses

## API Endpoints

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register (role: CUSTOMER) |
| POST | `/login` | Login, returns JWT |

### Products

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products (AVAILABLE for customers, all for admin) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products/admin` | Create product (admin) |
| PUT | `/api/products/admin/:id` | Update product (admin) |
| DELETE | `/api/products/admin/:id` | Delete product (admin) |

### Orders

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders/create-payment-order` | Create DRAFT order + Razorpay order, return Checkout details (customer) |
| POST | `/api/orders/verify-payment` | Verify Razorpay payment signature; mark order ORDERED/PAID (customer, primary path) |
| GET | `/api/orders/my-orders` | Customer's orders |
| GET | `/api/orders/admin/all` | All orders (admin) |
| PUT | `/api/orders/admin/:id/status` | Update order status (admin) |
| GET | `/api/orders/:id` | Get order by ID |

### Payments

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/razorpay/webhook` | Razorpay webhook — backup payment confirmation (no JWT; signature verified) |

## Demo Flow

1. Browse menu by category (Thali, Combo Meal, Add On)
2. Add items to cart (customers only)
3. Sign up / log in
4. Enter delivery address and contact number on cart page
5. Click **Pay Now** → Razorpay Checkout modal opens
6. Complete test payment (UPI / card in test mode)
7. Frontend verifies payment with the backend → order becomes **ORDERED** / **PAID**
8. If the browser closes before step 7, the Razorpay webhook confirms the same order (check backend logs for `[RAZORPAY] Order ... marked ORDERED/PAID via webhook`)
9. Receipt email sent via Resend
10. View orders in the **Orders** tab; admin can update fulfillment status

## Test Payments (Razorpay Test Mode)

Indian merchant accounts **do not accept international cards**. If you see *"international cards are not allowed"*, you used a foreign card or an international test card — use one of the options below instead.

### UPI (recommended — easiest)

1. In the Razorpay modal, select **UPI** from the payment methods list
2. Enter UPI ID: `success@razorpay`
3. Click Pay → choose **Success** on the mock bank page

If **UPI does not appear** in the checkout modal, enable it in the [Razorpay Dashboard](https://dashboard.razorpay.com) → **Account & Settings** → **Payment Methods** → turn on **UPI** (test mode).

For a failed payment test, use `failure@razorpay`.

### Domestic test card

| Network    | Card number           | CVV   | Expiry        |
|------------|-----------------------|-------|---------------|
| Mastercard | `5267 3181 8797 5449` | Any   | Any future date |

Do **not** use international test cards (e.g. `4012 8888 8888 1881`, `5555 5555 5555 4444`) on an India-only account.

## Admin Setup

Promote a user to admin in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Log out and log back in to refresh the JWT.

## Important Notes

- **Payment confirmation** uses two paths: primary `POST /api/orders/verify-payment` (browser callback) and backup `POST /api/payments/razorpay/webhook`. Both call the same `markOrderAsPaid()` helper; duplicate events are ignored when `payment.status` is already **PAID**.
- **Webhook setup:** set `WEBHOOK_URL`, `RAZORPAY_WEBHOOK_SECRET`, and run `npm run setup:webhook` from `backend/` (see [Razorpay Webhook Setup](#razorpay-webhook-setup)). For local dev, keep ngrok running on port 8080.
- Backend calculates order totals from MongoDB product prices (frontend prices are not trusted).
- Use Razorpay **test mode** keys (`rzp_test_...`) during development.
- Resend sandbox: with `homely_meals@resend.dev`, emails can only be delivered to addresses allowed by Resend. Set `RESEND_SANDBOX_EMAIL` to your Resend account email so order receipts to other customers are redirected in dev (with a notice in the email body). For production, verify a domain at [resend.com/domains](https://resend.com/domains) and update `FROM_EMAIL`.
