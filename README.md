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

### Railway deployment

The repository includes Dockerfiles and Railway configuration for separate API and frontend services. Create a Railway project connected to this repository, then create the services below. Set each service's **Root Directory** as shown so Railway finds its Dockerfile and `railway.json`.

1. **Create MySQL:** add a MySQL database service. Connect it to the API service using Railway variable references (replace `MySQL` if your database service has a different name):

   ```text
   NODE_ENV=production
   USE_REAL_MYSQL=true
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASS=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=club_management
   JWT_SECRET=<a private random value of at least 32 characters>
   CORS_ORIGIN=http://localhost:5173
   ```

   `DB_NAME` must be `club_management` because that is the database selected by `backend/schema.sql`. Use Railway's private database hostname/port for the API connection, not a public proxy URL. Keep `DB_PASS` and `JWT_SECRET` in Railway's Variables; never commit them.

2. **Initialize the database:** once the MySQL service is ready, run `backend/schema.sql` against it once using Railway's database console or a MySQL client connected through the database's secure connection details. This creates the tables and sample clubs/events, without a pre-seeded admin or shared default account. Do not point a production deployment at your local database.

3. **Deploy the API:** add a service from this repository with Root Directory `/backend`. Railway will build `backend/Dockerfile`; `backend/railway.json` sets `/api` as the health check. Generate a public domain for the API and confirm `https://<api-domain>/api` responds with `{"message":"API is running"}`.

4. **Deploy the frontend:** add another service from the same repository with Root Directory `/frontend`. Set this build variable before deploying:

   ```text
   VITE_API_URL=https://<api-domain>/api
   ```

   Deploy and generate a public domain for the frontend. Its Nginx configuration serves the React app and falls back to `index.html` for client-side routes.

5. **Lock down API CORS:** replace the API's temporary `CORS_ORIGIN` value with the exact frontend origin (for example `https://<frontend-domain>`, no trailing slash), then redeploy the API.

6. **Create the initial admin:** use the public signup page to create your own account. Then run this in the Railway MySQL console, replacing the email with the exact address you signed up with:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   SELECT ROW_COUNT() AS accounts_promoted;
   ```

   Continue only if `accounts_promoted` is `1`. Sign in again so the session receives the admin role. Public signup always creates ordinary user accounts; do not make admin promotion publicly available.

7. **Verify:** open the frontend domain, sign in, create an event, register a test account, and check the API and database logs. Use a provider-managed MySQL backup before real users depend on the app.

The API refuses to start in production if MySQL, a private JWT secret, or `CORS_ORIGIN` is missing, and it will not silently switch to demo data if MySQL is unavailable. Railway deployment itself requires signing in to Railway and connecting the repository; no account credentials belong in this repository or chat.
