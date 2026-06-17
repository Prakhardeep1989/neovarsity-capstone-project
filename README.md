# HOMELY Meals - A Cloud Kitchen

A full-stack MERN restaurant ordering application for **HOMELY Meals**, a cloud kitchen in Chandausi, UP serving fresh homely food with online ordering, Razorpay payments, and order receipt emails via Resend.

## Features

- JWT authentication with **CUSTOMER** and **ADMIN** roles
- Admin-only product management (create, edit, delete, status control)
- Product categories: **THALI**, **COMBO_MEAL**, **ADD_ON**
- Product status: **AVAILABLE** / **INACTIVE**
- Shopping cart with delivery details validation
- Razorpay Checkout with server-side payment verification
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

## Razorpay Webhook (Optional)

In the Razorpay Dashboard → Webhooks, add:

- URL: `https://your-backend-url/api/payments/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`

Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.

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
| POST | `/api/orders/create-payment-order` | Create DRAFT order + Razorpay order (customer) |
| POST | `/api/orders/verify-payment` | Verify Razorpay payment signature (customer) |
| GET | `/api/orders/my-orders` | Customer's orders |
| GET | `/api/orders/admin/all` | All orders (admin) |
| PUT | `/api/orders/admin/:id/status` | Update order status (admin) |
| GET | `/api/orders/:id` | Get order by ID |

### Payments

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/razorpay/webhook` | Razorpay webhook (backup payment confirmation) |

## Demo Flow

1. Browse menu by category (Thali, Combo Meal, Add On)
2. Add items to cart (customers only)
3. Sign up / log in
4. Enter delivery address and contact number on cart page
5. Click **Pay Now** → Razorpay Checkout modal opens
6. Complete test payment (UPI / card in test mode)
7. Backend verifies signature → order status becomes **ORDERED**
8. Receipt email sent via Resend
9. View orders in the **Orders** tab

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

- Order payment is confirmed via **server-side signature verification** on `/api/orders/verify-payment`.
- The Razorpay webhook acts as a backup confirmation path.
- Backend calculates order totals from MongoDB product prices (frontend prices are not trusted).
- Use Razorpay **test mode** keys (`rzp_test_...`) during development.
- Resend sandbox: with `homely_meals@resend.dev`, emails may only deliver to your Resend account email until a domain is verified.
