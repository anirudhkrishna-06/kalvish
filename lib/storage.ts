import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Course, Slot, DayTimetable } from '@/types';

const STORAGE_KEYS = {
  SETUP_COMPLETE: '@timetable:setup_complete',
  COURSES: '@timetable:courses',
  SLOTS: '@timetable:slots',
  TIMETABLE: '@timetable:timetable',
} as const;

export const Storage = {
  // Setup
  async setSetupComplete(complete: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, JSON.stringify(complete));
  },

  async isSetupComplete(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE);
    return value ? JSON.parse(value) : false;
  },

  // Courses
  async saveCourses(courses: Course[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  async getCourses(): Promise<Course[]> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    return value ? JSON.parse(value) : [];
  },

  // Slots
  async saveSlots(slots: Slot[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  },

  async getSlots(): Promise<Slot[]> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SLOTS);
    return value ? JSON.parse(value) : [];
  },

  // Timetable
  async saveTimetable(timetable: DayTimetable[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  },

  async getTimetable(): Promise<DayTimetable[]> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE);
    return value ? JSON.parse(value) : [];
  },

  // Clear all data (for debugging)
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  },
};