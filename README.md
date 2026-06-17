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
| Hosting | Vercel (FE), Render (BE) |

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

Create `backend/.env`:

```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://YOUR-PUBLIC-URL/api/payments/razorpay/webhook
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_...
FROM_EMAIL=HOMELY Meals <homely_meals@resend.dev>
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

Create `frontend/.env`:

```env
REACT_APP_SERVER_DOMIN=http://localhost:8080
REACT_APP_RAZORPAY_KEY_ID=rzp_test_...
```

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
- Resend sandbox: with `homely_meals@resend.dev`, emails can only be delivered to your Resend account email. Set `RESEND_SANDBOX_EMAIL=coolprakhar06@gmail.com` — order receipts to other customers are automatically redirected there in dev (with a notice in the email body). For production, verify a domain at [resend.com/domains](https://resend.com/domains) and update `FROM_EMAIL`.
