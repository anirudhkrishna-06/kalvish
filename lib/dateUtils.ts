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