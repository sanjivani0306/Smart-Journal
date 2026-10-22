
# Smart Journal - Windows startup

## 1. Backend (Python/FastAPI)

Open `backend` and double-click `setup_venv.bat` **once**. This creates the missing `venv` and installs `requirements.txt`.

Then double-click `start_backend.bat`.

The API should be available at:
- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs

## 2. Database

PostgreSQL must be running and the database configured in `backend/.env` must exist.

Check `DATABASE_URL` in `backend/.env`.

## 3. Frontend

Open a second terminal in `frontend` and run:

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## If registration says "Failed to fetch"

This normally means the browser cannot reach FastAPI. Check that:

1. `start_backend.bat` is running.
2. http://127.0.0.1:8000/health opens and returns `{"status":"healthy"}`.
3. PostgreSQL is running.
4. The frontend is using `VITE_API_URL=http://127.0.0.1:8000` (or the default in the code).
5. Do a hard refresh with Ctrl+Shift+R.

The FastAPI CORS configuration now accepts both `localhost:5173` and `127.0.0.1:5173`.
