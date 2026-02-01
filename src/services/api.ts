import type { EmbryoResult } from '../types/embryo';

// Backend API base URL - use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types for API responses
export interface Patient {
  id: number;
  audit_code: string;
  created_at: string;
}

export interface Cycle {
  id: number;
  patient_id: number;
  cycle_id: string;
  created_at: string;
}

export interface Embryo {
  id: number;
  cycle_id: number;
  embryo_id: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  role: string;
  action: string;
  timestamp: string;
  patient_audit_code?: string;
  cycle_id?: string;
  embryo_id?: string;
  details?: any;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

// API Service Class
class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(username: string, password: string, role: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async createPatient(auditCode: string): Promise<Patient> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify({ audit_code: auditCode }),
    });
  }

  // Cycles
  async getCycles(): Promise<Cycle[]> {
    return this.request<Cycle[]>('/cycles');
  }

  async createCycle(patientId: number, cycleId: string): Promise<Cycle> {
    return this.request<Cycle>('/cycles', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, cycle_id: cycleId }),
    });
  }

  // Embryos
  async getEmbryos(): Promise<Embryo[]> {
    return this.request<Embryo[]>('/embryos');
  }

  async createEmbryo(cycleId: number, embryoId: string): Promise<Embryo> {
    return this.request<Embryo>('/embryos', {
      method: 'POST',
      body: JSON.stringify({ cycle_id: cycleId, embryo_id: embryoId }),
    });
  }

  // AI Prediction
  async predictEmbryo(
    embryoId: number,
    imageFile: File,
    patientCode: string,
    cycleId: string,
    embryoIdentifier: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('prediction_data', JSON.stringify({
      patient_audit_code: patientCode,
      cycle_id: cycleId,
      embryo_id: embryoIdentifier,
    }));

    const headers: Record<string,string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Prediction Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Audit Logs
  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    userId?: number,
    action?: string,
    patientCode?: string
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (userId) params.append('user_id', userId.toString());
    if (action) params.append('action', action);
    if (patientCode) params.append('patient_audit_code', patientCode);

    return this.request<{ logs: AuditLog[]; total: number }>(`/audit-logs?${params}`);
  }

  // Export
  async exportAuditLogs(format: 'csv' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/${format}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Export Error: ${response.status}`);
    }

    return response.blob();
  }

  // Notes
  async createNote(
    patientCode: string,
    cycleId?: string,
    embryoId?: string,
    content: string
  ): Promise<any> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({
        patient_audit_code: patientCode,
        cycle_id: cycleId,
        embryo_id: embryoId,
        content,
      }),
    });
  }

  // AI Override
  async logAiOverride(
    embryoId: number,
    originalScore: number,
    overrideScore: number,
    reason: string
  ): Promise<any> {
    return this.request('/ai-override', {
      method: 'POST',
      body: JSON.stringify({
        embryo_id: embryoId,
        original_score: originalScore,
        override_score: overrideScore,
        reason,
      }),
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Helper function to convert backend Embryo to frontend EmbryoResult
export function convertEmbryoToEmbryoResult(
  embryo: Embryo,
  cycle: Cycle,
  patient: Patient,
  prediction?: any
): EmbryoResult {
  return {
    id: embryo.id.toString(),
    name: `Embryo ${embryo.embryo_id}`,
    imageUrl: '/placeholder-embryo.jpg', // Placeholder - would need actual image URL
    viabilityScore: prediction?.viability_score || 0,
    rank: 1, // Would need to calculate based on other embryos
    features: {
      developmentalStage: 'Unknown', // Would need actual data
      symmetry: 'Good' as const,
      fragmentation: '10%',
    },
    keyFindings: prediction ? [`Viability: ${prediction.viability_score}%`] : [],
    recommendation: prediction?.prediction === 'good' ? 'Suitable for transfer' : 'Monitor closely',
    uploadedAt: new Date(embryo.created_at),
    processingStatus: prediction ? 'completed' : 'pending',
  };
}