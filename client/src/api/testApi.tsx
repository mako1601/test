import { api } from './axiosInstance';
import qs from 'qs';
import { PageResult } from '@mytypes/commonTypes';
import { AnswerResultDto, Test, TestDto, TestResult } from '@mytypes/testTypes';

const ROUTE = "/tests";

export const createTest = async (data: TestDto): Promise<void> => {
  await api.post(`${ROUTE}`, data);
};

export const getTestById = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllTests = async ({
  searchText,
  userId,
  testId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize
}: {
  searchText?: string,
  userId?: number[],
  testId?: number[],
  orderBy?: string,
  sortDirection?: number,
  currentPage?: number,
  pageSize?: number
}): Promise<PageResult<Test>> => {
  const response = await api.get<PageResult<Test>>(`${ROUTE}`, {
    params: { searchText, userId, testId, orderBy, sortDirection, currentPage, pageSize },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};

export const updateTest = async (id: number, data: TestDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}`, data);
};

export const deleteTest = async (id: number): Promise<void> => {
  await api.delete(`${ROUTE}/${id}`);
};

export const startTest = async (id: number): Promise<number> => {
  const response = await api.get<number>(`${ROUTE}/${id}/start`);
  return response.data;
};

export const finishTest = async (id: number, data: AnswerResultDto[]): Promise<void> => {
  await api.put(`${ROUTE}/${id}/finish`, { answerResults: data });
};

export const getTestForPassingById = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`${ROUTE}/${id}/pass`);
  return response.data;
};

export const getTestResultById = async (id: number): Promise<TestResult> => {
  const response = await api.get<TestResult>(`${ROUTE}/${id}/result`);
  return response.data;
};

export const getAllTestResults = async ({
  userId,
  testId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize
}: {
  userId?: number[],
  testId?: number[],
  orderBy?: string,
  sortDirection?: number,
  currentPage?: number,
  pageSize?: number
}): Promise<PageResult<TestResult>> => {
  const response = await api.get<PageResult<TestResult>>(`${ROUTE}/results`, {
    params: { userId, testId, orderBy, sortDirection, currentPage, pageSize },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};