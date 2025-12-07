# Analytics Service

Analytics service for SuperApp using Python and FastAPI.

Quick start

```bash
cd services/analytics-service
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 3003
```

Endpoints

- `GET /` - health check
- `GET /analytics` - list analytics data

Notes

- Uses FastAPI for async request handling.
- Event storage coming soon.
