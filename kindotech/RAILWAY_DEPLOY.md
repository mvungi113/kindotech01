# Deploying the Laravel backend to Railway

This file documents recommended steps to deploy the Laravel backend to Railway using the provided `Dockerfile`.

1. Link your local repo to Railway (you already did):
   - `railway link`

2. Add a MySQL plugin in Railway (Plugins → Add Plugin → MySQL) and note the connection details.

3. Create a Railway service (Web service) for the backend and set variables (Project → Services → select backend):
   - `APP_KEY` (generate with `php artisan key:generate --show` locally)
   - `APP_URL` (Railway service URL)
   - `DB_CONNECTION=mysql`
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (from MySQL plugin)

4. Build settings (if Railway requires):
   - Build command: none (Dockerfile will be used)
   - Start command: leave blank (Dockerfile's CMD will run)

5. Optional: After deploy run migrations with one-off command:
   - `railway run php artisan migrate --force` (select MySQL plugin when prompted)

Notes:
- Railway filesystem is ephemeral — configure S3 for persistent uploads.
- For production performance, swap `php artisan serve` for php-fpm + nginx.
