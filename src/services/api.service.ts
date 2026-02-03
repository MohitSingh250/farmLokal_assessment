import axios from 'axios';
import { TokenService } from './token.service';


// Simulating an external API URL (would be in env in real app)
const API_URL = 'https://fakestoreapi.com/products';

interface ApiResponse {
  id: string;
  status: string;
  data: any;
}

// Simple manual delay function
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
          // Failed after retries
          throw error;
        }

        // Exponential Backoff: 500ms, 1000ms, 2000ms
        const backoffTime = 500 * Math.pow(2, attempt - 1);
        // Retrying...
        await delay(backoffTime);
      }
    }
    
    throw new Error('Unreachable code');
  }
};
