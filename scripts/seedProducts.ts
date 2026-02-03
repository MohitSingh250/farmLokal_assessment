import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
  console.log('Connecting to DB to seed...');
  
  // Create a direct connection for seeding
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'farmlokal',
    port: Number(process.env.DB_PORT) || 3307
  });

  try {
    console.log('Dropping existing table (if any)...');
    await connection.query('DROP TABLE IF EXISTS products');

    console.log('Creating Schema...');
    const schema = `
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_price (price),
        INDEX idx_created_at (created_at)
      );
    `;
    await connection.query(schema);

    console.log('Inserting 10,000 products...');
    const batchSize = 1000;
    const totalRecords = 10000;
    
    for (let i = 0; i < totalRecords; i += batchSize) {
      const values = [];
      for (let j = 0; j < batchSize; j++) {
        values.push([
          `Product ${i + j}`,
          `Description for product ${i + j}`,
          (Math.random() * 1000).toFixed(2),
          ['electronics', 'clothing', 'home', 'grocery'][Math.floor(Math.random() * 4)],
          new Date()
        ]);
      }
      
      const sql = `INSERT INTO products (name, description, price, category, created_at) VALUES ?`;
      await connection.query(sql, [values]);
      process.stdout.write('.');
    }
    
    console.log('\nSeeding complete.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await connection.end();
    process.exit(1);
  }
};

seed();
