# Club Management System

## Local development

1. Install Node.js and MySQL.
2. Copy `backend/.env.example` to `backend/.env` and set your MySQL password and a private JWT secret.
3. In MySQL Workbench, run `backend/schema.sql`, or run `npm run setup:db` from this folder after configuring the database account. This creates sample clubs/events but no default admin account.
4. Install dependencies with `npm run install:all`.
5. Start the API with `npm run start:backend`.
6. In another terminal, start the frontend with `npm run start:frontend`, then open `http://localhost:5173`.
7. Sign up for your own account, then promote only that account to admin in MySQL Workbench:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   SELECT ROW_COUNT() AS accounts_promoted;
   ```

   Confirm `accounts_promoted` is `1`, then sign in again to receive an admin session.

The frontend defaults to `http://localhost:5000/api` for local development. Override it with `VITE_API_URL` in `frontend/.env`.

## Production deployment

### Render deployment

The root `render.yaml` defines the production API service. The frontend can be deployed as a separate Render Static Site.

1. **Push the latest code to GitHub**, then in Render choose **New → Blueprint** and connect this repository. Render reads `render.yaml` and creates the API service. Choose the `main` branch.
2. **Set API environment variables** in the Render dashboard under the API service's **Environment** tab (or when prompted by the Blueprint). Set `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASS` from the Aiven service's Quick Connect details. Set `DB_NAME=club_management`, `DB_SSL=true`, and `DB_SSL_CA` to the complete Aiven CA certificate PEM from the same service. Keep the certificate's PEM lines intact (or use literal `\n` between lines). Render generates `JWT_SECRET`; do not replace it with a public/example value. Until the frontend is deployed, the Blueprint temporarily sets `CORS_ORIGIN=http://localhost:5173`, which permits local frontend development only. If Render logs that MySQL TLS settings are missing, add `DB_SSL=true` and `DB_SSL_CA` in that Environment tab and save; never disable TLS to bypass the check.
3. **Initialize Aiven MySQL once** using a MySQL client with the same host, port, user, password, and CA certificate. Run `backend/schema.sql` against it. It creates tables and sample clubs/events, but no default admin account.
4. **Deploy the API** and use its Render URL to verify `/api` returns `{"message":"API is running"}`.
5. **Deploy the frontend** in Render using **New → Static Site**, the same GitHub repository and `main` branch, Root Directory `frontend`, Build Command `npm ci && npm run build`, and Publish Directory `dist`. Set `VITE_API_URL=https://<api-service>.onrender.com/api` as a build environment variable. Add a rewrite rule `/*` → `/index.html` with status `200` for React routes.
6. After the frontend is live, change `CORS_ORIGIN` in `render.yaml` and the API service's Render Environment to the exact frontend origin, such as `https://<frontend-site>.onrender.com` with no trailing slash, then redeploy the API. Do not leave it set to localhost in production.
7. **Create the first admin:** sign up through the deployed frontend, then run in Aiven MySQL:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   SELECT ROW_COUNT() AS accounts_promoted;
   ```

   Confirm the count is `1`, then sign in again. Public signup always creates regular users.
8. Test sign-in, event creation, registration, and the Render/Aiven logs before inviting real users. Configure database backups. Render's free web services may sleep when idle; the Blueprint selects the paid `starter` plan to keep the API available.

The API refuses to start in production without MySQL TLS, its CA certificate, a private JWT secret, and `CORS_ORIGIN`; it will not silently switch to demo data if the database is unavailable.
