# FarmLokal Backend 

High-performance, scalable backend for the FarmLokal marketplace, connecting households directly with local farmers. Built with **Node.js, TypeScript, MySQL, and Redis**.

---

##  Architecture Overview

The system follows a **Layered Architecture** to ensure separation of concerns, scalability, and maintainability:

*   **Controllers (`src/controllers`)**: Handle HTTP requests, parsing, validation, and sending responses. They are thin and delegate logic to services.
*   **Services (`src/services`)**: Encapsulate business logic, database interactions, and external API calls. This is where the core work happens.
*   **Data Access**:
    *   **MySQL**: Primary transactional database schema for Products.
    *   **Redis**: High-speed layer for Caching (Products, Tokens) and Rate Limiting.
*   **Middlewares (`src/middlewares`)**: Cross-cutting concerns like Global Error Handling and Rate Limiting.
*   **Configuration (`src/config`)**: Centralized type-safe environment variables and database connections.

---

##  Performance Optimizations

1.  **Cursor-Based Pagination**
    *   **Why**: Traditional `OFFSET` pagination becomes O(N) slow (scanning millions of rows) as you go deeper.
    *   **Implementation**: We use the `created_at` timestamp as a pointer. Queries use `WHERE created_at < cursor ORDER BY created_at DESC LIMIT N`.
    *   **Benefit**: Constant O(1) time complexity regardless of how many pages deep the user scrolls.

2.  **Database Indexing**
    *   Indexes created on high-cardinality fields: `category`, `price`, and `created_at` to support efficient filtering and sorting.

3.  **Connection Pooling**
    *   Utilized `mysql2` connection pool to maintain distinct connections for concurrent users, reducing the overhead of TCP handshakes for every request.

---

##  Caching Strategy

We implement a **Cache-Aside** (Lazy Loading) strategy using Redis to reduce database load and improve response times (P95 < 200ms).

1.  **Product Listings**:
    *   **Key**: Composite key based on query params (e.g., `products:electronics:0-100:cursorV1:...`).
    *   **Logic**: Check Cache -> Return if Hit -> Else Query DB -> Write to Cache -> Return.
    *   **TTL**: 60 seconds (Balances freshness with performance).

2.  **Authentication Tokens**:
    *   **Problem**: External Auth provider rate limits; "Thundering Herd" on expiry.
    *   **Solution**: Tokens are cached in Redis. A Singleton Promise pattern ensures only *one* request refreshes the token when expired, while others wait for the result.

---

## 🛠 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Docker & Docker Compose

### 1. Quick Start (Docker)
The easiest way to run the full stack (App + MySQL + Redis):
```bash
# Start all services
docker-compose up --build
```
*   API: `http://localhost:3000`
*   Database: Port 3307 (Mapped to host)

### 2. Manual Setup (Local Dev)
If you want to run the app locally while keeping DB in Docker:

```bash
# 1. Start Support Services (MySQL & Redis)
docker-compose up -d mysql redis

# 2. Install Dependencies
npm install

# 3. Seed the Database (Important! Creates Tables & Dummy Data)
npx ts-node scripts/seedProducts.ts

# 4. Run the App
npm run dev
```

---

## Trade-offs Made

1.  **Raw SQL vs. ORM**
    *   **Decision**: Used `mysql2` with raw SQL instead of Prisma/TypeORM.
    *   **Reason**: Maximum performance control and zero abstraction overhead. ORMs can generate inefficient queries for complex cursor pagination.

2.  **Synchronous API Retries**
    *   **Decision**: Implemented in-memory exponential backoff for the External API integration.
    *   **Trade-off**: Simple to implement but holds the connection open. For a larger system, a Message Queue (RabbitMQ) would be better to decouple reliability from response time.

3.  **Strict Project Structure**
    *   **Decision**: Avoided over-engineering with Dependency Injection frameworks (like Inversify or NestJS).
    *   **Reason**: Kept the code readable and accessible for any developer ("Junior friendly") while maintaining separation of concerns.

---

##  Key API Endpoints

*   `GET /products` - List products (supports `cursor`, `category`, `search`).
*   `GET /products/external/:id` - Fetch data from external API (demonstrates integration).
*   `GET /health` - Health check.
*   `POST /webhooks/update` - Receives async events (Idempotent).
