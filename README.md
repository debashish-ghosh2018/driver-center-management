# Driver Center Management System v2

Added GPS tracking + Socket.IO, ratings, driver commission/earnings, PDF invoices, reports, notifications, audit-log foundation, rate limiting, Swagger/OpenAPI, and DRIVER/CUSTOMER roles.

## Run
1. `npm install`
2. Create MySQL DB: `CREATE DATABASE driver_center;`
3. Copy `.env.example` to `.env` and configure DB/JWT.
4. `npm run dev`

Admin: `http://localhost:5000/admin/`
Swagger: `http://localhost:5000/api-docs`

Default development admin: `admin@drivercenter.local` / `Admin@12345`

## New endpoints
- POST `/api/tracking/location`
- GET `/api/tracking/:driverId`
- POST `/api/ratings`
- GET `/api/ratings`
- GET `/api/reports/summary`
- GET `/api/notifications`
- GET `/api/audit-logs`
- GET `/api/invoices/:bookingId/pdf`

External SMS/WhatsApp, Google Maps routing, and real payment gateway integrations still require provider credentials; service/model foundations are included so these can be connected without restructuring the application.
