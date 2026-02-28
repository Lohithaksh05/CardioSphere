import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * A function registered by AuthSync that retrieves the current Clerk token.
 * Using an interceptor ensures every request always carries a fresh token.
 */
// Normal token provider — may return a cached (potentially near-expired) token
let _tokenProvider: (() => Promise<string | null>) | null = null;
// Force-refresh provider — bypasses Clerk's cache, used on 401 retries
let _freshTokenProvider: (() => Promise<string | null>) | null = null;

export function registerTokenProvider(
  normal: () => Promise<string | null>,
  fresh: () => Promise<string | null>
) {
  _tokenProvider = normal;
  _freshTokenProvider = fresh;
}

// Remove this once all callers are migrated — kept for safety
export function setAuthToken(_token: string | null) {}

// Attach token on every outgoing request
api.interceptors.request.use(async (config) => {
  if (_tokenProvider) {
    try {
      const token = await _tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // token fetch failed — request proceeds without auth header
    }
  }
  return config;
});

// On 401, get a brand-new token (skipCache) and retry the request once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried && _freshTokenProvider) {
      original._retried = true;
      try {
        const freshToken = await _freshTokenProvider();
        if (freshToken) {
          original.headers["Authorization"] = `Bearer ${freshToken}`;
          return api(original);
        }
      } catch {
        // fresh token fetch failed — fall through to reject
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const syncUser = (data: {
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}) => api.post("/auth/sync", data);

export const getProfile = () => api.get("/auth/me");
export const updateProfile = (data: Record<string, unknown>) =>
  api.put("/auth/me", data);

// ---------- Prediction ----------
export const predictRisk = (data: Record<string, number>) =>
  api.post("/predict/risk", data);

export const getPrediction = (id: string) =>
  api.get(`/predict/risk/${id}`);

// ---------- AI Planner ----------
export const generateWorkout = (data: Record<string, unknown>) =>
  api.post("/generate/workout", data);

export const getSavedWorkouts = (limit = 20) =>
  api.get(`/generate/workouts?limit=${limit}`);

export const getSavedWorkout = (id: string) =>
  api.get(`/generate/workout/${id}`);

export const generateDiet = (data: Record<string, unknown>) =>
  api.post("/generate/diet", data);

export const getSavedDiets = (limit = 20) =>
  api.get(`/generate/diets?limit=${limit}`);

export const getSavedDiet = (id: string) =>
  api.get(`/generate/diet/${id}`);

// ---------- Medications ----------
export const addMedication = (data: Record<string, unknown>) =>
  api.post("/medications", data);

export const getMedications = () => api.get("/medications");

export const markMedicationTaken = (id: string) =>
  api.put(`/medications/${id}/take`);

export const skipMedication = (id: string) =>
  api.put(`/medications/${id}/skip`);

export const resetMedication = (id: string) =>
  api.put(`/medications/${id}/reset`);

export const deleteMedication = (id: string) =>
  api.delete(`/medications/${id}`);

export const updateMedication = (id: string, data: Record<string, unknown>) =>
  api.put(`/medications/${id}`, data);

export const toggleMedicationSMS = (
  id: string,
  data: { enabled: boolean }
) => api.put(`/medications/${id}/toggle-sms`, data);

// ---------- Dashboard ----------
export const getDashboardStats = () => api.get("/dashboard/stats");
export const getRiskHistory = (limit = 20) =>
  api.get(`/dashboard/risk-history?limit=${limit}`);
export const getProgressTrend = () => api.get("/dashboard/progress-trend");

// ---------- Community ----------
export const createPost = (data: Record<string, unknown>) =>
  api.post("/community", data);

export const getPosts = (skip = 0, limit = 20) =>
  api.get(`/community?skip=${skip}&limit=${limit}`);

export const getPost = (id: string) => api.get(`/community/${id}`);

export const addComment = (postId: string, content: string) =>
  api.post(`/community/${postId}/comment`, { content });

export const toggleLike = (postId: string) =>
  api.post(`/community/${postId}/like`);

export const deletePost = (postId: string) =>
  api.delete(`/community/${postId}`);

// ---------- Hospitals ----------
export const getNearbyHospitals = (
  lat: number,
  lng: number,
  radius = 5000
) => api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

export default api;
