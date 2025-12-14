import { Day } from '@/types/Timetable';
import { DAYS, DAY_LABELS } from '@/constants/Days';

export const getCurrentDay = (): Day => {
  const dayIndex = new Date().getDay();
  
  // Convert JavaScript day (0 = Sunday) to our Day enum
  switch (dayIndex) {
    case 1: return Day.MONDAY;
    case 2: return Day.TUESDAY;
    case 3: return Day.WEDNESDAY;
    case 4: return Day.THURSDAY;
    case 5: return Day.FRIDAY;
    case 0: // Sunday
    case 6: // Saturday
    default:
      // If it's weekend, show Monday's schedule
      return Day.MONDAY;
  }
};

// Add this function to your existing dateUtils.ts file
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 0) {
    return 'in the future';
  } else if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay === 1) {
    return 'yesterday';
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  } else {
    return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
  }
}


export const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  
  switch (dayIndex) {
    case 1: return Day.MONDAY;
    case 2: return Day.TUESDAY;
    case 3: return Day.WEDNESDAY;
    case 4: return Day.THURSDAY;
    case 5: return Day.FRIDAY;
    default: return Day.MONDAY;
  }
};

export const formatDate = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const isCurrentTimeInSlot = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
};

export const getNextSlot = (slots: any[]): number => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    if (startTotalMinutes > currentTotalMinutes) {
      return i;
    }
  }
  
  return -1; // All slots have passed
};