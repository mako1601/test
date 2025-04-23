export const extractImageIdFromUrl = (url: string): string => {
  const match = url.match(/\/v\d+\/([^\/]+)\.\w+$/);
  return match ? match[1] : "";
};