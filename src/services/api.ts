import { Asset, LoanRecord, MaintenanceTask, LabStorageLayout } from '../types';

const rawBase = import.meta.env.VITE_API_BASE_URL;
const BASE_URL =
  rawBase && typeof rawBase === 'string' && rawBase.trim() !== '' && rawBase !== 'undefined'
    ? `${rawBase.trim().replace(/\/$/, '')}/api`
    : '/api';

async function request<T>(endpoint: string, options?: RequestInit, retries = 2): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    const contentType = res.headers.get('content-type') || '';

    // If response is not JSON (e.g. server returned HTML during reboot or proxy 502)
    if (!contentType.includes('application/json')) {
      if (retries > 0) {
        // Transient server start, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 600));
        return request<T>(endpoint, options, retries - 1);
      }
      const text = await res.text();
      throw new Error(
        `Backend returned HTML instead of JSON (${res.status} ${res.statusText}). The server may still be initializing.`
      );
    }

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err: any) {
    if (retries > 0 && (err.name === 'SyntaxError' || err.message?.includes('JSON'))) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return request<T>(endpoint, options, retries - 1);
    }
    throw err;
  }
}

export const api = {
  // Metrics & Stats
  async getMetrics(lab?: string) {
    const query = lab && lab !== 'ALL' ? `?lab=${lab}` : '';
    const res = await request<{ success: boolean; data: any }>(`/metrics${query}`);
    return res.data;
  },

  // Assets (Phase 1)
  async getAssets(filters?: { lab?: string; search?: string; category?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.lab && filters.lab !== 'ALL') params.append('lab', filters.lab);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; data: Asset[]; count: number }>(`/assets${query}`);
    return res.data;
  },

  async getAssetById(id: string) {
    const res = await request<{ success: boolean; data: Asset }>(`/assets/${id}`);
    return res.data;
  },

  async createAsset(asset: Partial<Asset>) {
    const res = await request<{ success: boolean; data: Asset }>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
    return res.data;
  },

  async updateAsset(id: string, updates: Partial<Asset>) {
    const res = await request<{ success: boolean; data: Asset }>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteAsset(id: string) {
    return request<{ success: boolean; message: string }>(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // Dispensing & Loans (Phase 2)
  async getLoans(filters?: { lab?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.lab && filters.lab !== 'ALL') params.append('lab', filters.lab);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; data: LoanRecord[]; count: number }>(`/loans${query}`);
    return res.data;
  },

  async createLoan(loan: Partial<LoanRecord>) {
    const res = await request<{ success: boolean; data: LoanRecord }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
    return res.data;
  },

  async returnLoan(id: string, notes?: string) {
    const res = await request<{ success: boolean; data: LoanRecord; message: string }>(`/loans/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return res.data;
  },

  // Storage Layouts (Phase 3)
  async getStorageLayouts(lab?: string) {
    const query = lab && lab !== 'ALL' ? `?lab=${lab}` : '';
    const res = await request<{ success: boolean; data: LabStorageLayout[] }>(`/storage/layouts${query}`);
    return res.data;
  },

  // Maintenance & Kanban (Phase 4)
  async getMaintenanceTasks(lab?: string) {
    const query = lab && lab !== 'ALL' ? `?lab=${lab}` : '';
    const res = await request<{ success: boolean; data: MaintenanceTask[]; count: number }>(`/maintenance${query}`);
    return res.data;
  },

  async createMaintenanceTask(task: Partial<MaintenanceTask>) {
    const res = await request<{ success: boolean; data: MaintenanceTask }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return res.data;
  },

  async updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>) {
    const res = await request<{ success: boolean; data: MaintenanceTask }>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteMaintenanceTask(id: string) {
    return request<{ success: boolean; message: string }>(`/maintenance/${id}`, {
      method: 'DELETE',
    });
  },

  // System & Reports (Phase 5)
  async getSystemHealth() {
    const res = await request<{ success: boolean; data: any }>('/system/health');
    return res.data;
  },

  async resetData() {
    return request<{ success: boolean; message: string }>('/system/reset', {
      method: 'POST',
    });
  },

  getExportUrl(type: 'inventory' | 'borrowers', lab?: string) {
    const params = new URLSearchParams({ type });
    if (lab && lab !== 'ALL') params.append('lab', lab);
    return `${BASE_URL}/reports/export?${params.toString()}`;
  },
};
