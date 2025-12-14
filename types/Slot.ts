export enum SlotType {
  COURSE = 'COURSE',
  SHORT_BREAK = 'SHORT_BREAK',
  LUNCH_BREAK = 'LUNCH_BREAK',
  LIBRARY = 'LIBRARY',
  MENTOR = 'MENTOR',
  FREE = 'FREE',
}

export interface Slot {
  id: string;
  index: number; // 1-8
  name: string; // "Period 1", "Short Break", etc.
  type: SlotType;
  startTime: string; // "09:00"
  endTime: string; // "09:50"
  isBreak: boolean; // computed: type === SHORT_BREAK || LUNCH_BREAK
}