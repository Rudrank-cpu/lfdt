const API_BASE = '/api/v1';

class ApiClient {
  getToken() {
    return localStorage.getItem('eventflow_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('eventflow_token', token);
    } else {
      localStorage.removeItem('eventflow_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or unauthenticated
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // --- Auth APIs ---
  async login(credentials) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data?.user;
  }

  logout() {
    this.setToken(null);
  }

  // --- Event APIs ---
  async listEvents({ category, search, status = 'PUBLISHED', headUserId } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (headUserId) params.append('headUserId', headUserId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/events${query}`);
    return res.data?.events || [];
  }

  async getEvent(id) {
    const res = await this.request(`/events/${id}`);
    return res.data?.event;
  }

  async createEvent(eventData) {
    const res = await this.request('/events', {
      method: 'POST',
      body: eventData
    });
    return res.data?.event;
  }

  async updateEvent(id, eventData) {
    const res = await this.request(`/events/${id}`, {
      method: 'PUT',
      body: eventData
    });
    return res.data?.event;
  }

  async updateEventStatus(id, status) {
    const res = await this.request(`/events/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
    return res.data?.event;
  }

  async deleteEvent(id) {
    const res = await this.request(`/events/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }

  // --- Registration & Attendee APIs ---
  async registerForEvent(eventId) {
    const res = await this.request(`/events/${eventId}/register`, {
      method: 'POST'
    });
    return res.data;
  }

  async cancelRegistration(eventId) {
    const res = await this.request(`/events/${eventId}/register`, {
      method: 'DELETE'
    });
    return res.data;
  }

  async getMyRegistrations() {
    const res = await this.request('/users/me/registrations');
    return res.data?.registrations || [];
  }

  async getEventAttendees(eventId) {
    const res = await this.request(`/events/${eventId}/attendees`);
    return res.data;
  }

  getExportCsvUrl(eventId) {
    return `${API_BASE}/events/${eventId}/export`;
  }
}

export const api = new ApiClient();
