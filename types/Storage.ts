export interface StorageData {
  setupComplete: boolean;
  courses: any[];
  slots: any[];
  timetable: any[];
}

export interface TimetableDay {
  day: string;
  date: string;
  slots: TimetableSlot[];
}

export interface TimetableSlot {
  id: string;
  index: number;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  assignment?: {
    type: string;
    course?: any;
    label?: string;
  };
}