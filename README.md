# HOMELY Meals - A Cloud Kitchen

A full-stack MERN restaurant ordering application for **HOMELY Meals**, a cloud kitchen in Chandausi, UP serving fresh homely food with online ordering, Stripe payments, and order receipt emails via Resend.

## Features

- JWT authentication with **CUSTOMER** and **ADMIN** roles
- Admin-only product management (create, edit, delete, status control)
- Product categories: **THALI**, **COMBO_MEAL**, **ADD_ON**
- Product status: **AVAILABLE** / **INACTIVE**
- Shopping cart with delivery details validation
- Stripe Checkout with webhook-confirmed payments
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
| Payments | Stripe (Checkout + Webhooks) |
| Email | Resend |
| Hosting | Vercel (FE), Render (BE) |

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe test account
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
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_...
FROM_EMAIL=HOMELY Meals <homely_meals@resend.dev>
```

Start the server:

```bash
npm run dev
```

For local Stripe webhooks, run in a separate terminal:

```bash
stripe listen --forward-to localhost:8080/api/payments/stripe/webhook
```

Copy the `whsec_...` secret into `STRIPE_WEBHOOK_SECRET` and restart the backend.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_SERVER_DOMIN=http://localhost:8080
```

Start the app:

```bash
npm start
```

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
| POST | `/api/orders/create-checkout-session` | Create DRAFT order + Stripe session (customer) |
| GET | `/api/orders/my-orders` | Customer's orders |
| GET | `/api/orders/admin/all` | All orders (admin) |
| PUT | `/api/orders/admin/:id/status` | Update order status (admin) |
| GET | `/api/orders/:id` | Get order by ID |

### Payments

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/stripe/webhook` | Stripe webhook (marks order PAID) |

## Demo Flow

1. Browse menu by category (Thali, Combo Meal, Add On)
2. Add items to cart (customers only)
3. Sign up / log in
4. Enter delivery address and contact number on cart page
5. Click **Pay Now** → Stripe Checkout (test card: `4242 4242 4242 4242`)
6. Webhook confirms payment → order status becomes **ORDERED**
7. Receipt email sent via Resend
8. View orders in the **Orders** tab

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

- Order payment status is updated **only** via the Stripe webhook, not the success page.
- Backend calculates order totals from MongoDB product prices (frontend prices are not trusted).
- Resend sandbox: with `homely_meals@resend.dev`, emails may only deliver to your Resend account email until a domain is verified.
- Use Stripe test card `4242 4242 4242 4242` for payments.
