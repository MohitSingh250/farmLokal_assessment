import mysql from 'mysql2/promise';
import { env } from './env';


export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const checkDbConnection = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log('MySQL Connected');
    connection.release();
  } catch (error) {
    console.error('MySQL Connection Failed:', error);
    process.exit(1);
  }
};
