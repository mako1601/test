import { api } from './axiosInstance';
import qs from 'qs';
import { PageResult } from '@mytypes/commonTypes';
import { Article, ArticleDto } from '@mytypes/articleTypes';

const ROUTE = "/articles";

export const createArticle = async (data: ArticleDto): Promise<void> => {
  await api.post(`${ROUTE}`, data);
};

export const getArticleById = async (id: number): Promise<Article> => {
  const response = await api.get<Article>(`${ROUTE}/${id}`);
  return response.data;
};

export const getAllArticles = async ({
  searchText,
  userId,
  orderBy,
  sortDirection,
  currentPage,
  pageSize,
}: {
  searchText?: string;
  userId?: number[];
  orderBy?: string;
  sortDirection?: number;
  currentPage?: number;
  pageSize?: number;
}): Promise<PageResult<Article>> => {
  const response = await api.get<PageResult<Article>>(`${ROUTE}`, {
    params: { searchText, userId, orderBy, sortDirection, currentPage, pageSize },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};

export const updateArticle = async (id: number, data: ArticleDto): Promise<void> => {
  await api.put(`${ROUTE}/${id}`, data);
};

export const deleteArticle = async (id: number): Promise<void> => {
  await api.delete(`${ROUTE}/${id}`);
};