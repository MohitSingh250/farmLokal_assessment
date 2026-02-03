# FarmLokal Backend

High-performance backend for the FarmLokal marketplace, connecting households directly with local farmers and producers. Built with Node.js (TypeScript), MySQL, and Redis, with a focus on performance, reliability, and clean architecture.

## Architecture Overview

The system follows a **Layered Architecture** to ensure separation of concerns and maintainability:

*   **Controllers (`src/controllers`)**: Handle HTTP requests, input parsing, validation, and responses.
*   **Services (`src/services`)**: Contain business logic, database queries, Redis caching, OAuth token handling, and external API integrations.
*   **Data Layer**:
    *   **MySQL**: Primary database for product data.
    *   **Redis**: Used for caching, OAuth tokens, rate limiting, and webhook idempotency.
*   **Middlewares (`src/middlewares`)**: Global error handling, rate limiting, and request validation.
*   **Config (`src/config`)**: Centralized environment configuration and connection setup.

---

## 🚀 Performance Optimizations

1.  **Cursor-Based Pagination**
    *   **Why**: Offset-based pagination becomes slow for large datasets.
    *   **Implementation**: Uses `created_at` as a cursor:
        ```sql
        WHERE created_at < :cursor
        ORDER BY created_at DESC
        LIMIT :limit
        ```
    *   **Benefit**: Consistent performance even with 1M+ records.

2.  **Database Indexing**
    *   Indexes created on `category`, `price`, and `created_at` to support fast filtering, sorting, and pagination.

3.  **Connection Pooling**
    *   Uses `mysql2` connection pooling to reduce connection overhead and support concurrent traffic.

---

## ⚡️ Caching Strategy

A **Cache-Aside** strategy using Redis is implemented to reduce database load and meet the P95 < 200ms requirement.

1.  **Product Listing Cache**
    *   **Key**: Based on query parameters (example: `products:{category}:{priceRange}:{cursor}:{sort}`)
    *   **Flow**: Cache → DB (on miss) → Cache
    *   **TTL**: 60 seconds
    *   **Cache Invalidation**: On product create/update, product list cache keys can be invalidated. Broad invalidation is used to keep logic simple and fast.

2.  **OAuth Token Cache**
    *   Access tokens are cached in Redis with TTL.
    *   A **concurrency-safe refresh mechanism** ensures only one token fetch occurs on expiry, preventing redundant calls (Thundering Herd).

---

## 🔐 Authentication (OAuth2 – Client Credentials)

Implements OAuth2 Client Credentials flow:
*   Fetches access token from provider
*   Caches token in Redis
*   Automatically refreshes token on expiry
*   Ensures concurrent requests do not trigger multiple token fetches

This results in clean token lifecycle handling with no redundant network calls.

---

## 🔗 External API Integration

**API A – Synchronous**
*   Fetches product/order-like data.
*   Implements:
    *   Request timeouts
    *   Retries with exponential backoff

**API B – Webhook-Based**
*   Registers a callback URL.
*   Receives async updates.
*   Ensures:
    *   Idempotency using Redis
    *   Safe retries
    *   Duplicate event handling

---

## 🛡 Reliability & Performance

The following mechanisms are implemented to prioritize response time and stability:
*   Redis caching
*   Rate limiting
*   Connection pooling
*   Centralized error handling

---

## 🛠 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Docker & Docker Compose

### 1. Docker Setup
```bash
docker-compose up --build
```
*   API: `http://localhost:3000`
*   MySQL: Port 3307

### 2. Local Development
```bash
docker-compose up -d mysql redis
npm install
npx ts-node scripts/seedProducts.ts
npm run dev
```

---

## ⚖️ Trade-offs Made

1.  **Raw SQL vs ORM**
    *   Used raw SQL (`mysql2`) for better performance and control.
    *   Avoided ORM overhead for large datasets and cursor pagination.

2.  **Synchronous API Retries**
    *   Simpler retry logic with exponential backoff.
    *   Holds the request open; async queues would be better at larger scale.

3.  **Minimal Framework Usage**
    *   Avoided heavy frameworks to keep the codebase simple and readable.

---

## 📡 Key API Endpoints

*   `GET /products` – Product listing with cursor pagination, filters, sorting, and search
*   `GET /products/external/:id` – External API integration
*   `POST /webhooks/update` – Webhook receiver (idempotent)
*   `GET /health` – Health check
*   `GET /metrics` – Basic metrics (bonus)

---

## ☁️ Deployment

The backend is deployed on Render, using:
*   Managed Redis
*   External MySQL
*   Environment-based configuration

### Focus Area
I focused most on **performance optimization, Redis usage, and reliable API integrations**, as FarmLokal’s use case is read-heavy and latency-sensitive.
