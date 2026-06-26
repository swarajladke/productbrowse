# Product Catalog API

This is a production-quality full-stack application backend for browsing a large product catalog. The backend is built to ensure correctness, scalability, and high performance even when querying across millions of records with active writes.

## Architecture

- **Backend**: FastAPI with standard (synchronous) SQLAlchemy sessions.
- **Database**: PostgreSQL (Neon compatible).
- **Frontend**: React + Vite + TypeScript (separate application, deployable to Vercel).

**Why not async SQLAlchemy?**
Async code adds significant complexity (asyncpg, async sessions, implicit IO errors). In typical CRUD applications, the real bottleneck is the database, not Python's thread pool. Using synchronous code with `psycopg2` makes the system much simpler to reason about, test, and explain during interviews, while maintaining excellent performance under normal connection pooling.

**Why PostgreSQL?**
PostgreSQL offers advanced indexing capabilities, robustness, and ACID compliance. It is ideal for large datasets and handles complex queries like keyset pagination smoothly.

## Pagination Strategy

**Why Keyset (Cursor) Pagination?**
Traditional `OFFSET/LIMIT` pagination degrades in performance linearly. The database must read and then discard all `OFFSET` rows before returning the `LIMIT` rows. Keyset pagination utilizes a `B-Tree` index directly, keeping query times $O(1)$ regardless of how many pages the user has scrolled.

**How it Works:**
1. A composite index is defined on `(updated_at DESC, id DESC)`.
2. When the frontend requests a page, it passes a `cursor`.
3. We decode the Base-64 cursor to extract `{ updated_at: "...", id: ... }`.
4. The database queries for products where `updated_at < cursor.updated_at OR (updated_at == cursor.updated_at AND id < cursor.id)`.

## Data Consistency: Snapshotting

**The Problem:** 
During infinite scroll, if a new product is inserted into the first page, all subsequent rows shift. An offset-based query or even a simple keyset query without snapshotting might cause products to be duplicated or skipped on the user's screen.

**The Solution:**
- On the very first request (no snapshot provided), the server generates a timestamp (`snapshot`).
- This `snapshot` is sent back to the client.
- The client passes this `snapshot` back in every subsequent page request.
- The query always adds a bound: `updated_at <= snapshot`.
- This creates a consistent "view" of the catalog exactly as it existed when the user began scrolling.

## Getting Started Locally

1. Create a virtual environment and install requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

2. Run a local PostgreSQL instance (or set `DATABASE_URL` in your `.env` to a Neon URI). By default, it expects:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products_db
   ```

3. Seed the database with 200,000 products:
   ```bash
   python seed.py
   ```
   *Note: `seed.py` inserts rows in batches of 5000 using `bulk_save_objects` to optimize the insertion speed, taking seconds instead of minutes.*

4. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```

## Deployment

We recommend the following stack:
- **Database**: Neon (Serverless Postgres)
- **Backend**: Render (Web Service running Uvicorn)
- **Frontend**: Vercel

Provide the `DATABASE_URL` environment variable in the Render dashboard and deploy directly from GitHub.

## Future Improvements
- **Connection Pooling**: Use PgBouncer if deploying highly concurrent environments.
- **Caching**: Introduce Redis to cache category counts or initial landing pages.
- **Full Text Search**: Implement Postgres `tsvector` for optimized text searching.
