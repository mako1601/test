import { api } from './axiosInstance';
import qs from 'qs';
import { PageResult } from '@mytypes/commonTypes';
import { ChangeUserRole, UpdUserData, UpdUserPass, UserDto } from '@mytypes/userTypes';

const ROUTE = "/users";

export const getUserById = async (id: number): Promise<UserDto> => {
  const response = await api.get<UserDto>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllUsers = async ({
  searchText,
  userId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize
}: {
  searchText?: string,
  userId?: number[],
  orderBy?: string,
  sortDirection?: number,
  currentPage?: number,
  pageSize?: number
}): Promise<PageResult<UserDto>> => {
  const response = await api.get<PageResult<UserDto>>(`${ROUTE}`, {
    params: { searchText, userId, orderBy, sortDirection, currentPage, pageSize },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};

export const updateUser = async (data: UpdUserData): Promise<void> => {
  await api.put(`${ROUTE}`, data);
};

export const updatePassword = async (data: UpdUserPass): Promise<void> => {
  await api.put(`${ROUTE}/update-password`, data);
};

export const changeRole = async (data: ChangeUserRole): Promise<void> => {
  await api.put(`${ROUTE}/change-role`, data);
};