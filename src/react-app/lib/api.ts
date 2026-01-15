const API_BASE = '/api';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface SignupData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  city?: string;
}

class API {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
        return retryResponse;
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
    }

    this.logout();
    return false;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async signup(data: SignupData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const result = await response.json();
    this.accessToken = result.accessToken;
    this.refreshToken = result.refreshToken;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    return result;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getCurrentUser() {
    const response = await this.request('/users/me');
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }

  async updateProfile(data: { name?: string; phone?: string; city?: string }) {
    const response = await this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // Activation
  async activateVehicle(data: {
    brandId: string;
    vin?: string;
    licensePlate?: string;
    model?: string;
    year?: number;
    verificationMethod: string;
  }) {
    const response = await this.request('/activations', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Activation failed');
    }

    return response.json();
  }

  async getActivations() {
    const response = await this.request('/activations');
    if (!response.ok) throw new Error('Failed to fetch activations');
    return response.json();
  }

  // Wallet
  async getWalletCard() {
    const response = await this.request('/wallet/card');
    if (!response.ok) throw new Error('Failed to fetch wallet card');
    return response.json();
  }

  async getWalletUpdates(limit = 20, offset = 0) {
    const response = await this.request(`/wallet/updates?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch wallet updates');
    return response.json();
  }

  async markUpdateAsRead(updateId: string) {
    const response = await this.request(`/wallet/updates/${updateId}/read`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark update as read');
    return response.json();
  }

  // Feed
  async getFeed(limit = 20, offset = 0) {
    const response = await this.request(`/feed?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch feed');
    return response.json();
  }

  async toggleLike(postId: string) {
    const response = await this.request(`/feed/posts/${postId}/like`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle like');
    return response.json();
  }

  async addComment(postId: string, content: string) {
    const response = await this.request(`/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  }

  async getComments(postId: string) {
    const response = await this.request(`/feed/posts/${postId}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  }

  // Events
  async getEvents(filters?: { city?: string; type?: string; upcoming?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.upcoming) params.append('upcoming', 'true');
    
    const queryString = params.toString();
    const response = await this.request(`/events${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  }

  async rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going') {
    const response = await this.request(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to RSVP');
    return response.json();
  }

  async getUserRSVPs() {
    const response = await this.request('/events/my-rsvps');
    if (!response.ok) throw new Error('Failed to fetch RSVPs');
    return response.json();
  }

  // Generic GET method
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Generic POST method
  async post(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new API();
