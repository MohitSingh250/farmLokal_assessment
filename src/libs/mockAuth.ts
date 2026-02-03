export interface OAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const mockAuthProvider = {
  fetchToken: async (): Promise<OAuthToken> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      access_token: `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expires_in: 3600, 
      token_type: 'Bearer',
    };
  },
};
