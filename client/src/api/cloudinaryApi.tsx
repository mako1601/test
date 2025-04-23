import { api } from './axiosInstance';

const ROUTE = "/cloudinary";

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`${ROUTE}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.url;
};

export const deleteImage = async (id: string): Promise<void> => {
  await api.delete(`${ROUTE}/delete-image/${id}`);
};

export const uploadJson = async (jsonData: string): Promise<string> => {
  const response = await api.post(`${ROUTE}/upload-json`, jsonData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.url;
};

export const updateJson = async (jsonData: string, id: string) => {
  const response = await api.put(`${ROUTE}/update-json`, jsonData, {
    params: { id },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.url;
};
