import pkg from 'pg';
const Pool = pkg.Pool;
import config from "../config.js";

export const pool = new Pool({
  user: config.POSTGRE_SQL_USER,
  host: config.POSTGRE_SQL_HOST,
  database: config.POSTGRE_SQL_DATABASE,
  password: config.POSTGRE_SQL_PASSWORD,
  port: config.POSTGRE_SQL_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});
