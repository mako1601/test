export const extractJsonIdFromUrl = (url: string): string => {
    const match = url.match(/\/([^\/]+)\.json$/);
    return match ? match[1] + ".json" : "";
  };