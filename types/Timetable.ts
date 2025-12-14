import { SlotType } from '@/types/Slot';


export enum Day {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
}

export interface DayTimetable {
  day: Day;
  slotAssignments: SlotAssignment[];
}

export interface SlotAssignment {
  slotId: string;
  type: SlotType;
  courseId?: string; // Only for COURSE type
  label?: string; // For LIBRARY, MENTOR, FREE
}