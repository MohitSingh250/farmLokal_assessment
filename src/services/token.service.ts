import { redis } from '../config/redis';
import { mockAuthProvider } from '../libs/mockAuth';


const TOKEN_CACHE_KEY = 'oauth_access_token';

// Simple in-memory lock prevents multiple concurrent fetches
let fetchPromise: Promise<string> | null = null;

export const TokenService = {
  getAccessToken: async (): Promise<string> => {
    // 1. Try to get from Redis
    const cachedToken = await redis.get(TOKEN_CACHE_KEY);
    if (cachedToken) {
      console.log('OAuth Token: Cache Hit');
      return cachedToken;
    }

    // 2. If already fetching, wait for that promise
    if (fetchPromise) {
      console.log('OAuth Token: Waiting for concurrent fetch...');
      return fetchPromise;
    }

    // 3. Otherwise, start a new fetch
    console.log('OAuth Token: Fetching new token...');
    fetchPromise = (async () => {
      try {
        
        const tokenData = await mockAuthProvider.fetchToken();
        console.log('OAuth Token: Fetched Successfully');
        
        // Store in Redis with slightly less TTL to be safe (buffer time)
        const ttl = Math.max(tokenData.expires_in - 60, 0); 
        await redis.set(TOKEN_CACHE_KEY, tokenData.access_token, 'EX', ttl);
        
        return tokenData.access_token;
      } catch (error) {
        console.error('OAuth Token: Fetch Failed', error);
        throw error;
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },
};
