// Arquivo com os dados de conexão com o banco
import Sequelize from "sequelize";

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "dark_souls",
};

const connection = new Sequelize(DB_CONFIG.database, DB_CONFIG.username, DB_CONFIG.password, {
  dialect: "mysql",
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  timezone: "-03:00",
  logging: false,
});

export default connection;
