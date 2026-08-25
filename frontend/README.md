# Driver Center Phase 2 Frontend

React.js + Bootstrap 5 responsive frontend integrated with the Node.js Driver Center backend.

## Included
- Responsive login
- Admin dashboard
- Customer list
- Driver list
- Vehicle list
- Booking workflow
- Payment list
- Live tracking-ready screen
- Reports
- Desktop sidebar
- Mobile bottom navigation
- Driver mobile portal with browser geolocation
- Customer rating portal
- JWT integration
- Axios API client
- Socket.IO client

## Run

Backend:
```bash
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

Vite proxies `/api` and `/socket.io` to port 5000.
