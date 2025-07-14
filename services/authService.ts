// src/services/authService.ts
import apiClient from "./apiClient";
import { LoginPayload,  RegisterPayload } from "../types/auth"; 

// Route: /auth/login (POST)
export const login = (payload: LoginPayload) => {
  return apiClient.post("/auth/login", payload);
};

// Route: /auth/register (POST)
export const register = (payload: RegisterPayload) => {
  return apiClient.post("/auth/register", payload);
};

// Route: /users/me (GET)
export const getMe = () => {
  return apiClient.get("/users/me");
};

// Route: /auth/logout (POST)
export const logout = () => {
  return apiClient.post("/auth/logout");
};
