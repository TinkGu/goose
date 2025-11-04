import dayjs from 'dayjs';

export function isInHours(dt1: number, dt2: number, hours: number) {
  return Math.abs(dayjs(dt1).diff(dayjs(dt2))) < hours * 60 * 60 * 1000;
}
