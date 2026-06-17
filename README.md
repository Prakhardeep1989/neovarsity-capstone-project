# HOMELY Meals - A Cloud Kitchen

A full-stack MERN restaurant ordering application for **HOMELY Meals**, a cloud kitchen in Chandausi, UP serving fresh homely food with online ordering and Stripe payments.

## Features

- Admin-only product management (backend-protected)
- Product browsing and category filtering
- User authentication with bcrypt password hashing
- Sign up with profile picture upload
- Shopping cart with quantity controls
- Authenticated checkout via Stripe
- Order history saved to MongoDB
- Session persistence across page refreshes
- 404 error page
- Responsive design with Tailwind CSS
- Redux Toolkit state management
- Deployed on Vercel (frontend) and Render (backend)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Payments | Stripe |
| Hosting | Vercel (FE), Render (BE) |

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe test account

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=your_admin_email@example.com
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
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
REACT_APP_ADMIN_EMAIL=your_admin_email@example.com
```

Start the app:

```bash
npm start
```

> **Note:** `REACT_APP_ADMIN_EMAIL` and `ADMIN_EMAIL` must match. Only this email can add new products.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Authenticate user |
| GET | `/product` | Get all products |
| POST | `/uploadProduct` | Add product (admin only) |
| POST | `/create-checkout-session` | Stripe checkout |
| POST | `/save-order` | Save order after payment |
| GET | `/orders/:email` | Get user order history |

## Demo Flow

1. Browse products on the home page
2. Filter by category (vegetable, dosa, rice, etc.)
3. Add items to cart
4. Sign up / log in
5. Proceed to Stripe test payment
6. Order confirmation on success page

## Important Notes

- Existing users registered before bcrypt was added will need to sign up again.
- Use Stripe test card `4242 4242 4242 4242` for payments.
- Set the same admin email in both frontend and backend `.env` files.
