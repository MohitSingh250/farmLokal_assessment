import { dbPool } from '../config/mysql';
import { redis } from '../config/redis';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: Date;
}

export const ProductService = {
  getProducts: async ({ cursor, limit = 20, category, minPrice, maxPrice, search }: any) => {
    const cacheKey = `products:${category || 'all'}:${minPrice || '0'}-${maxPrice || 'inf'}:${cursor || 'start'}:${limit}:${search || 'none'}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }


    if (cursor) {
      query += ' AND created_at < ?'; 
      params.push(new Date(cursor));
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit) + 1); // Fetch 1 extra to check if there is a next page

    const [rows]: any = await dbPool.query(query, params);

    let data = rows as Product[];
    let nextCursor = null;

    if (data.length > limit) {
      nextCursor = data[limit - 1]?.created_at; 
      data.pop();
    }

    const result = {
      data,
      nextCursor,
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

    return result;
  },
};
