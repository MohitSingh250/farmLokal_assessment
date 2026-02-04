import { redis } from '../config/redis';
import { mockAuthProvider } from '../libs/mockAuth';


const TOKEN_CACHE_KEY = 'oauth_access_token';
let fetchPromise: Promise<string> | null = null;

export const TokenService = {
  getAccessToken: async (): Promise<string> => {
    const cachedToken = await redis.get(TOKEN_CACHE_KEY);
    if (cachedToken) {
      console.log('OAuth Token: Cache Hit');
      return cachedToken;
    }

    if (fetchPromise) {
      console.log('OAuth Token: Waiting for concurrent fetch...');
      return fetchPromise;
    }

    console.log('OAuth Token: Fetching new token...');
    fetchPromise = (async () => {
      try {
        
        const tokenData = await mockAuthProvider.fetchToken();
        console.log('OAuth Token: Fetched Successfully');
        
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
