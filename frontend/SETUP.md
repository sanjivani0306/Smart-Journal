# Smart Journal — ZIP-style frontend connected to FastAPI

This frontend keeps the ZIP-style Smart Journal UI and uses the FastAPI contract:

- POST `/auth/register`
- POST `/auth/login`
- GET `/journal`
- GET `/journal/{id}`
- PUT `/journal/{id}`
- DELETE `/journal/{id}`

## Run

1. Make sure FastAPI is running on `http://127.0.0.1:8000`.
2. In this frontend folder run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL, normally `http://localhost:5173`.

Optional: create `.env` with:

`VITE_API_URL=http://127.0.0.1:8000`

The current backend performs AI analysis during `POST /journal`, so the Write screen saves the entry and displays the returned AI metadata. Favorites are kept locally because the current backend schema does not have a favorite field. Demo login, chat/reflection API, sample-data reset, and export endpoints are not called because they are not part of the current FastAPI contract.
