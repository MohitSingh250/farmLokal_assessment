import axios from 'axios';
import { TokenService } from './token.service';


import { env } from '../config/env';

const API_URL = env.EXTERNAL_API_URL;

interface ApiResponse {
  id: string;
  status: string;
  data: any;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ExternalApiService = {
 
  fetchDataSync: async (productId: string, retries = 3): Promise<any> => {
    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        const token = await TokenService.getAccessToken();
        const response = await axios.get(`${API_URL}/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        });
        return response.data;
      } catch (error: any) {
        attempt++;
        if (attempt > retries) {
          throw error;
        }

        const backoffTime = 500 * Math.pow(2, attempt - 1);
        await delay(backoffTime);
      }
    }
    
    throw new Error('Unreachable code');
  }
};
