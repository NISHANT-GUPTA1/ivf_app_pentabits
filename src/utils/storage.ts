import type { Patient, EmbryoResult } from '../types/embryo';

// LocalStorage keys
const STORAGE_KEYS = {
  PATIENTS: 'ivf_app_patients',
  EMBRYOS: 'ivf_app_embryos',
  ACTIVE_PATIENT: 'ivf_app_active_patient',
} as const;

export const storage = {
  // Patient operations
  savePatients: (patients: Patient[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch (error) {
      console.error('Failed to save patients:', error);
    }
  },

  loadPatients: (): Patient[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!data) return [];
      
      const patients = JSON.parse(data);
      // Convert date strings back to Date objects
      return patients.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    } catch (error) {
      console.error('Failed to load patients:', error);
      return [];
    }
  },

  // Embryo operations
  saveEmbryos: (embryos: EmbryoResult[]): void => {
    try {
      // Store embryo data (images stored as URLs/base64)
      localStorage.setItem(STORAGE_KEYS.EMBRYOS, JSON.stringify(embryos));
    } catch (error) {
      console.error('Failed to save embryos:', error);
      // If storage quota exceeded, try to save without images
      try {
        const embryosWithoutImages = embryos.map(e => ({
          ...e,
          imageUrl: '', // Remove large image data
        }));
        localStorage.setItem(STORAGE_KEYS.EMBRYOS, JSON.stringify(embryosWithoutImages));
        console.warn('Saved embryos without image data due to storage limit');
      } catch (retryError) {
        console.error('Failed to save embryos even without images:', retryError);
      }
    }
  },

  loadEmbryos: (): EmbryoResult[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMBRYOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load embryos:', error);
      return [];
    }
  },

  // Active patient tracking
  saveActivePatientId: (patientId: string | null): void => {
    try {
      if (patientId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, patientId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
      }
    } catch (error) {
      console.error('Failed to save active patient:', error);
    }
  },

  loadActivePatientId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
    } catch (error) {
      console.error('Failed to load active patient:', error);
      return null;
    }
  },

  // Clear all data
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  // Get storage usage info
  getStorageInfo: () => {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      const limit = 5; // Most browsers limit to ~5-10MB
      return {
        usedMB: parseFloat(sizeInMB),
        limitMB: limit,
        percentUsed: (parseFloat(sizeInMB) / limit) * 100,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { usedMB: 0, limitMB: 5, percentUsed: 0 };
    }
  },
};
