import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

export const calculateTimeTaken = (createdAt: string, endedAt: string): string => {
  const startDate = new Date(createdAt);
  const endDate = new Date(endedAt);

  const years = differenceInYears(endDate, startDate);
  const months = differenceInMonths(endDate, startDate) % 12;
  const days = differenceInDays(endDate, startDate) % 30;
  const hours = differenceInHours(endDate, startDate) % 24;
  const minutes = differenceInMinutes(endDate, startDate) % 60;
  const seconds = differenceInSeconds(endDate, startDate) % 60;

  let result = '';

  if (years > 0) result += `${years} год(а) `;
  if (months > 0) result += `${months} мес. `;
  if (days > 0) result += `${days} дн. `;
  if (hours > 0) result += `${hours} ч. `;
  if (minutes > 0) result += `${minutes} мин. `;
  if (seconds > 0) result += `${seconds} сек.`;

  return result || 'меньше секунды';
};