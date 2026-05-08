# GoGo Rental — Backend

A RESTful API server for the GoGo Rental car booking platform. Built with Express.js and MongoDB, it handles authentication, provider and car management, rental booking with date conflict detection, a mock bank payment webhook, cancellation and refund tracking, provider reviews, and in-app notifications.

**Live:** [car-rental-backend-henna.vercel.app](https://car-rental-backend-henna.vercel.app)  
**API Docs:** [gogorental.vercel.app/api-docs](https://gogorental.vercel.app/api-docs)  
**Frontend:** [github.com/LittleKidz/GoGo_Rental_Application](https://github.com/LittleKidz/GoGo_Rental_Application)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB via Mongoose v9 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, HPP, express-mongo-sanitize, express-xss-sanitizer |
| Deployment | Vercel (serverless) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB connection string (local or Atlas)

### Installation

```bash
git clone https://github.com/LittleKidz/GoGo_Rental_Application_Backend.git
cd GoGo_Rental_Application_Backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/gogorental
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRE` | Token expiry duration (e.g. `30d`) |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port to listen on (default 5000) |
| `FRONTEND_URL` | Allowed CORS origin |

### Running Locally

```bash
npm run dev    # starts with nodemon (auto-restart on changes)
npm start      # starts with node directly
```

The server will be available at `http://localhost:5000`.  
Swagger UI is served at `http://localhost:5000/api-docs`.

---

## Project Structure

```
server.js               # Entry point — Express app setup, middleware, route mounting
config/
  db.js                 # Mongoose connection
controllers/
  auth.js               # Register, login, logout, me
  cars.js               # Car CRUD, booking availability
  providers.js          # Provider CRUD, detail bundle
  rentals.js            # Booking, payment, cancellation, receipt
  reviews.js            # Provider reviews with eligibility check
  notifications.js      # Per-user notification management
middleware/
  auth.js               # JWT verification and role guard
  error.js              # Centralised error response handler
models/
  User.js
  Provider.js
  Car.js
  Rental.js
  Review.js
  Notification.js
routes/
  auth.js
  cars.js
  providers.js
  rentals.js
  reviews.js
  notifications.js
swagger.json            # Full OpenAPI 3.0 spec (auto-served by swagger-ui-express)
swagger.schemas.js      # Reusable schema definitions
vercel.json             # Vercel serverless routing config
```

---

## API Overview

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/logout` | Clear the session cookie |
| GET | `/api/auth/me` | Return the authenticated user |

### Providers

| Method | Path | Description |
|---|---|---|
| GET | `/api/providers` | List all providers (paginated, sortable) |
| POST | `/api/providers` | Create a provider (admin) |
| GET | `/api/providers/:id` | Get a single provider |
| PUT | `/api/providers/:id` | Update a provider (admin) |
| DELETE | `/api/providers/:id` | Delete a provider and cascade cars and rentals (admin) |
| GET | `/api/providers/:id/detail` | Provider with cars, bookings, and reviews in one request |

### Cars

| Method | Path | Description |
|---|---|---|
| GET | `/api/cars` | List all cars |
| GET | `/api/cars/:id` | Get a single car |
| GET | `/api/providers/:providerId/cars` | List cars for a specific provider |
| POST | `/api/providers/:providerId/cars` | Create a car under a provider (admin) |
| GET | `/api/providers/:providerId/cars/:id` | Get a single car under a provider |
| PUT | `/api/providers/:providerId/cars/:id` | Update a car (admin) |
| DELETE | `/api/providers/:providerId/cars/:id` | Delete a car (admin) |
| GET | `/api/providers/:providerId/cars/bookings` | Active (non-refunded) bookings for all provider cars |

### Rentals

| Method | Path | Description |
|---|---|---|
| GET | `/api/rentals` | Own rentals (user) or all rentals (admin) |
| POST | `/api/rentals` | Create a booking (max 3 active per user) |
| GET | `/api/rentals/:id` | Get a single rental (populated) |
| PUT | `/api/rentals/:id` | Update rental dates (recalculates total if pending) |
| DELETE | `/api/rentals/:id` | Delete a rental |
| GET | `/api/rentals/:id/qr` | Get mock bank QR URL for payment |
| GET | `/api/rentals/:id/status` | Poll payment and refund status |
| GET | `/api/rentals/:id/receipt` | Full receipt for a paid rental |
| PATCH | `/api/rentals/:id/payment-status` | Manually update payment or refund status (admin) |
| POST | `/api/rentals/:id/cancel` | Cancel a booking (3+ days before pickup) |
| POST | `/api/rentals/webhook/payment` | Payment webhook called by mock bank on confirmation |

### Reviews

| Method | Path | Description |
|---|---|---|
| GET | `/api/reviews` | All reviews across all providers (admin) |
| GET | `/api/providers/:providerId/reviews` | Reviews for a provider (public) |
| POST | `/api/providers/:providerId/reviews` | Submit a review (requires completed rental) |
| GET | `/api/providers/:providerId/reviews/can-review` | Check review eligibility |
| PUT | `/api/providers/:providerId/reviews/:reviewId` | Update own review |
| DELETE | `/api/providers/:providerId/reviews/:reviewId` | Delete a review (owner or admin) |

### Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | Notifications for the current user |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/read` | Mark one as read |

---

## Data Models

**User** — `name`, `email`, `password` (hashed), `telephone`, `role` (`user` | `admin`)

**Provider** — `name`, `address`, `telephone`, `avgRating`, `reviewCount`

**Car** — `brand`, `model`, `color`, `licensePlate`, `dailyRate`, `available`, `image`, `provider` (ref)

**Rental** — `rentalDate`, `returnDate`, `user`, `provider`, `car`, `totalAmount`, `paymentStatus` (`pending` | `paid` | `refunded`), `refundStatus` (`none` | `requested` | `completed`), `paidAt`, `cancelledAt`

**Review** — `user`, `provider`, `rental`, `rating` (1–5), `comment`

**Notification** — `user`, `rental`, `message`, `read`

---

## Payment Flow

Payments are handled through a mock bank to simulate a QR-based payment gateway without a real provider.

1. Client calls `GET /api/rentals/:id/qr` to receive a mock bank URL containing the rental ID and total amount.
2. The frontend generates a QR code from this URL and displays it to the user.
3. The user opens the mock bank page and clicks to confirm.
4. The mock bank page calls `POST /api/rentals/webhook/payment` with `{ ref: rentalId, status: "paid" }`.
5. The API marks the rental as paid, records `paidAt`, restores the car's availability flag, and creates a notification.
6. The frontend, which is polling `GET /api/rentals/:id/status` every three seconds, detects the status change and redirects to the receipt page.

---

## Business Rules

- A user may have at most three active (non-cancelled, non-expired) rentals at a time.
- Rental dates may not overlap for the same car.
- A booking that reaches its pickup date without payment is automatically expired when rentals are fetched.
- Cancellation is only permitted when the pickup date is at least three days away. A cancelled paid rental sets `refundStatus` to `requested`; the admin manually completes the refund via `PATCH /api/rentals/:id/payment-status`.
- A review can only be submitted after a confirmed, paid rental with that provider. One review per rental is enforced.
- Deleting a provider cascades to all associated cars, rentals, and reviews.

---

## Security

The following middleware layers are applied globally:

- **Helmet** — sets secure HTTP response headers
- **HPP** — prevents HTTP parameter pollution
- **express-mongo-sanitize** — strips MongoDB operator characters from request input
- **express-xss-sanitizer** — sanitises request body against XSS payloads
- **CORS** — restricted to the origin defined in `FRONTEND_URL`

Passwords are hashed with bcryptjs before storage. JWT tokens are verified on every protected route by the `auth` middleware, which also enforces role checks for admin-only operations.

---

## Docker

A Dockerfile is included for containerised deployments.

```bash
docker build -t gogo-rental-backend .
docker run -p 5000:5000 --env-file .env gogo-rental-backend
```

---

## Deployment

The backend is deployed on Vercel as a serverless function. The `vercel.json` routes all requests to `server.js` via `@vercel/node`. Set the environment variables listed above in the Vercel project settings before deploying.

```bash
vercel --prod
```
