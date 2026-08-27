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

# Phase 2 React Frontend Added

A `frontend/` application has been added using React.js, Vite and Bootstrap 5.

Run:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

# Super Admin Record Update

Added edit/update support to the Node.js Bootstrap backend admin interface.

## Editable modules
- Customers
- Drivers
- Vehicles
- Bookings

## APIs used
- GET /api/customers/:id
- PUT /api/customers/:id
- GET /api/drivers/:id
- PUT /api/drivers/:id
- GET /api/vehicles/:id
- PUT /api/vehicles/:id
- GET /api/bookings/:id
- PUT /api/bookings/:id

The UI uses `addEventListener()` instead of inline event handlers, so it remains compatible with Helmet CSP.

# Admin CRUD, Validation, User Management & ACL

Added to the Node.js Driver Center admin:
- CRUD UI for operational records
- Server-side validation with express-validator
- User CRUD and password updates
- Roles: SUPER_ADMIN, ADMIN, MANAGER, STAFF, DRIVER, CUSTOMER
- Role permission ACL for ADMIN, MANAGER and STAFF
- SUPER_ADMIN permission bypass
- CSP-compatible event listeners

New APIs:
- GET/POST /api/admin/users
- GET/PUT/DELETE /api/admin/users/:id
- GET/POST /api/admin/acl

Install the new dependency then restart:
```bash
npm install
npm run dev
```
Admin UI: http://localhost:5000/admin/
