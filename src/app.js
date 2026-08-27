require("dotenv").config();

const express = require("express"); //  is a minimal, fast, and unopinionated web application framework for Node.js designed to build robust web applications and REST APIs. It acts as a lightweight layer on top of Node.js's built-in HTTP modules, making it much easier to manage routing, handle requests, and integrate middleware.
const cors = require("cors"); // CORS is a Node.js middleware for Express/Connect that sets CORS response headers. These headers tell browsers which origins can read responses from your server. Link: https://www.npmjs.com/package/cors
const helmet = require("helmet"); // Helmet helps secure Node/Express apps. It sets HTTP response headers such as Content-Security-Policy and Strict-Transport-Security. It aims to be quick to integrate and be low maintenance afterward. Link: https://www.npmjs.com/package/helmet, https://github.com/helmetjs/helmet
const morgan = require("morgan"); // HTTP request logger middleware for node.js Link: https://www.npmjs.com/package/morgan
const rateLimit=require("express-rate-limit");  // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset. Plays nice with express-slow-down and ratelimit-header-parser. Link: https://www.npmjs.com/package/express-rate-limit
const swaggerUi=require("swagger-ui-express");  // This module allows you to serve auto-generated swagger-ui generated API docs from express, based on a swagger.json file. The result is living documentation for your API hosted from your API server via a route. Link: https://www.npmjs.com/package/swagger-ui-express, https://github.com/Surnet/swagger-jsdoc
const swaggerSpec=require("./swagger");
const path = require("path");


const authRoutes = require("./routes/auth.routes");
const apiRoutes = require("./routes");
const adminApiRoutes = require("./routes/admin-api.routes");
const extendedRoutes=require("./routes/extended.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(helmet({ 
  /*contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com", "data:"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": ["'self'", "ws:", "wss:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "style-src-elem": ["'self'"],
      "frame-ancestor": ["'self'"]
    }
  },  
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },*/
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false 
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "22mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/",rateLimit({windowMs:15*60*1000,limit:300}));
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec));

app.use("/admin", express.static(path.join(__dirname, "../public/admin")));

/**
* get:
*   description: Useful for deployment monitoring
* produces:
*   application/json
*/
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "driver-center-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/admin", adminApiRoutes);
app.use("/api",extendedRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
