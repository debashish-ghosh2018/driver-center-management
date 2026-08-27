require("dotenv").config();

const app = require("./app");
const http=require("http");
const {Server}=require("socket.io");
const { sequelize, User } = require("./models");
const { seedAcl } = require("./services/acl.service");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });  /*error is happening because your users table already has too many indexes/keys, and Sequelize is trying to create yet another unique index on email. MySQL allows a maximum of 64 indexes per table. Most likely, repeated use of Sequelize sync({ alter: true }) has gradually created duplicate indexes on users.email.*/
    await sequelize.sync({ alter: false });
    await User.seedAdmin();
    await seedAcl();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer,{cors:{origin:process.env.CORS_ORIGIN||"*"}}); 

    app.set("io",io); 
    io.on("connection",socket => {
      socket.on("booking:join",id=>socket.join(`booking:${id}`));
    });

    httpServer.listen(PORT, () => {
      console.log(`Driver Center API running at http://localhost:${PORT}`);
      console.log(`Admin interface: http://localhost:${PORT}/admin/`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
})();
