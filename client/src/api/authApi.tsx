import { api } from './axiosInstance';
import { LogData, RegData, UserDto } from '@mytypes/userTypes';

const ROUTE = "/auth";

export const getCurrentUser = async (): Promise<UserDto> => {
  const response = await api.get<UserDto>(`${ROUTE}/me`);
  return response.data;
};

export const registerUser = async (data: RegData): Promise<void> => {
  await api.post(`${ROUTE}/register`, data);
};

export const loginUser = async (data: LogData): Promise<void>  => {
  await api.post(`${ROUTE}/login`, data);
};

export const logoutUser = async (): Promise<void>  => {
  await api.post(`${ROUTE}/logout`);
};