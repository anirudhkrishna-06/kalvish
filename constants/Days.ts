import { Day } from '@/types/Timetable';

export const DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
];

export const DAY_LABELS: Record<Day, string> = {
  [Day.MONDAY]: 'Monday',
  [Day.TUESDAY]: 'Tuesday',
  [Day.WEDNESDAY]: 'Wednesday',
  [Day.THURSDAY]: 'Thursday',
  [Day.FRIDAY]: 'Friday',
};

export const DAY_SHORT_LABELS: Record<Day, string> = {
  [Day.MONDAY]: 'Mon',
  [Day.TUESDAY]: 'Tue',
  [Day.WEDNESDAY]: 'Wed',
  [Day.THURSDAY]: 'Thu',
  [Day.FRIDAY]: 'Fri',
};