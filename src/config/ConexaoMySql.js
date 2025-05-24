import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const ConexaoMySql = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'senai',
  database: process.env.DB_NAME || 'breshopTest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default ConexaoMySql;