

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Updated to match your Django server

class NotificationService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': this.token ? `Bearer ${this.token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getNotifications(userId: number, page: number = 1, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      user_id: userId.toString(),
      ...filters
    });

    const response = await axios.get(
      `${API_BASE_URL}/notifications/?${params}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async markAsRead(notificationId: number) {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/${notificationId}/mark-read/`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async markAllAsRead(userId: number) {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/mark-all-read/`,
      { user_id: userId },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteNotification(notificationId: number) {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}/delete/`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getStats(userId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/stats/?user_id=${userId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getPreferences(userId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/preferences/?user_id=${userId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updatePreferences(userId: number, preferences: any) {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/preferences/`,
      { ...preferences, user_id: userId },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Admin methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNotification(data: any) {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/admin/send/`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getSentNotifications() {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/admin/sent/`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getUsersList() {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/admin/users/`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export const notificationService = new NotificationService();