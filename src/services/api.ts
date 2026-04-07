// API service file
// This file will contain all API-related functions and configurations

export const apiClient = {
  // Base API configuration
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // GET request
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT request
  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE request
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

// Example API endpoints
export const apiEndpoints = {
  // User endpoints
  users: '/api/users',
  userById: (id: string) => `/api/users/${id}`,
  
  // Game endpoints
  games: '/api/games',
  gameById: (id: string) => `/api/games/${id}`,
  
  // Bingo specific endpoints
  bingoCards: '/api/bingo/cards',
  bingoGame: '/api/bingo/game',
};
