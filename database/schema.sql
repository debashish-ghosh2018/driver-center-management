CREATE DATABASE IF NOT EXISTS driver_center;
USE driver_center;

-- The Node application uses Sequelize synchronization in development.
-- For production, use Sequelize migrations rather than sync({alter:true}).
