import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ExternalApiService } from '../services/api.service';

export const ProductController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cursor, limit, category, minPrice, maxPrice } = req.query;

      const result = await ProductService.getProducts({
        cursor: cursor as string,
        limit: Number(limit) || 20,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: req.query.search,
      });

      res.json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
  fetchExternal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await ExternalApiService.fetchDataSync(id as string);
      res.json({ status: 'success', source: 'external_api', data });
    } catch (error) {
      next(error);
    }
  },
};
