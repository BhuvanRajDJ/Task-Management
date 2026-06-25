import { toast } from "react-toastify";

// Provide quick visual toast notifications
export const notify = (message, type) => {
  toast[type](message);
};

// Base API Endpoint configured via environment variable, with a sensible fallback for local dev
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Individual API URL for backward compatibility
export const API_URL = `${API_BASE_URL}/tasks`;
