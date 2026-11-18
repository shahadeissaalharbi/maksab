# Testing

## Run the tests

```bash
cd backend
pip install -r requirements.txt pytest pytest-cov
export JWT_SECRET=any-test-secret-at-least-32-characters
export DATABASE_URL=postgresql://user:pass@localhost:5432/test   # dummy, never used
python -m pytest -q
python -m pytest --cov=. -q          # with coverage
```

The same command runs on every Pull Request through GitHub Actions
(`.github/workflows/ci.yml`).

## Unit vs. integration tests

| | Unit test | Integration test |
| --- | --- | --- |
| Checks | One small piece alone | Several pieces working together |
| Example here | `test_calculator.py` (pricing maths), `test_cart.py`, `test_products.py`, `test_orders.py` (one route, fake database) | `test_order_notifications_integration.py` (the real Flask app + token check + route + email call) |
| Database | Fake cursor that returns prepared rows | Real app, database call mocked |
| Speed | Milliseconds | Slightly slower |

We replace the database with a fake cursor so the tests run in about two
seconds with no server, and so we can simulate failures (the database going
down must return 503). The cost is that a wrong SQL query would not be caught,
which is why a test against a real PostgreSQL database is the next step.

## What the route tests cover

- **Access:** missing token (401), wrong role (403), another supplier's data (403).
- **Input:** missing JSON, wrong types, negative numbers, too-long values (400).
- **Business rules:** minimum order quantity, stock limits, order splitting by
  supplier, allowed order status transitions (409 when invalid).
- **Failures:** database unavailable returns 503.

## Coverage

| Area | Before | After |
| --- | --- | --- |
| `routes/cart.py` | 16% | 100% |
| `products.py` | 16% | 88% |
| `routes/orders.py` | 34% | 85% |
| Application code total | 44% | 67% |

Measured with `coverage report --omit="tests/*"`, so test files do not inflate
the number.