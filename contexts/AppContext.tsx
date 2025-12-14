import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Storage } from '@/lib/storage';
import type { Course, Mark, Slot, DayTimetable } from '@/types';
import { generateId } from '@/utils/helpers';

interface AppContextType {
  // State
  courses: Course[];
  slots: Slot[];
  timetable: DayTimetable[];
  isSetupComplete: boolean;
  
  // Course Methods
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'marks'>) => Promise<string>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourseById: (id: string) => Course | undefined;
  
  // Mark Methods
  addMarkToCourse: (courseId: string, mark: Omit<Mark, 'id'>) => Promise<void>;
  updateMark: (courseId: string, markId: string, updates: Partial<Mark>) => Promise<void>;
  deleteMark: (courseId: string, markId: string) => Promise<void>;
  
  // Slot Methods
  saveSlots: (slots: Slot[]) => Promise<void>;
  
  // Timetable Methods
  saveTimetable: (timetable: DayTimetable[]) => Promise<void>;
  
  // Setup Flow
  completeSetup: () => Promise<void>;
  resetSetup: () => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timetable, setTimetable] = useState<DayTimetable[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [setupComplete, loadedCourses, loadedSlots, loadedTimetable] = await Promise.all([
        Storage.isSetupComplete(),
        Storage.getCourses(),
        Storage.getSlots(),
        Storage.getTimetable(),
      ]);

      setCourses(loadedCourses);
      setSlots(loadedSlots);
      setTimetable(loadedTimetable);
      setIsSetupComplete(setupComplete);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Course Methods
  const addCourse = useCallback(async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'marks'>) => {
    const now = new Date();
    const newCourse: Course = {
      ...courseData,
      id: generateId(),
      currentUnit: '',
      previousClassTopic: '',
      notes: '',
      marks: [],
      createdAt: now,
      updatedAt: now,
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
    return newCourse.id;
  }, [courses]);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(course => 
      course.id === id 
        ? { ...course, ...updates, updatedAt: new Date() }
        : course
    );
    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
  }, [courses]);

  const deleteCourse = useCallback(async (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
  }, [courses]);

  const getCourseById = useCallback((id: string) => {
    return courses.find(course => course.id === id);
  }, [courses]);

  // Mark Methods
  const addMarkToCourse = useCallback(async (courseId: string, markData: Omit<Mark, 'id'>) => {
    const newMark: Mark = {
      ...markData,
      id: generateId(),
    };

    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          marks: [...course.marks, newMark],
          updatedAt: new Date(),
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
  }, [courses]);

  const updateMark = useCallback(async (courseId: string, markId: string, updates: Partial<Mark>) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          marks: course.marks.map(mark =>
            mark.id === markId ? { ...mark, ...updates } : mark
          ),
          updatedAt: new Date(),
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
  }, [courses]);

  const deleteMark = useCallback(async (courseId: string, markId: string) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          marks: course.marks.filter(mark => mark.id !== markId),
          updatedAt: new Date(),
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    await Storage.saveCourses(updatedCourses);
  }, [courses]);

  // Slot Methods
  const saveSlots = useCallback(async (newSlots: Slot[]) => {
    setSlots(newSlots);
    await Storage.saveSlots(newSlots);
  }, []);

  // Timetable Methods
  const saveTimetable = useCallback(async (newTimetable: DayTimetable[]) => {
    setTimetable(newTimetable);
    await Storage.saveTimetable(newTimetable);
  }, []);

  // Setup Flow
  const completeSetup = useCallback(async () => {
    await Storage.setSetupComplete(true);
    setIsSetupComplete(true);
  }, []);

  const resetSetup = useCallback(async () => {
    await Storage.clearAll();
    setCourses([]);
    setSlots([]);
    setTimetable([]);
    setIsSetupComplete(false);
    setIsLoading(false);
  }, []);

  const value: AppContextType = {
    courses,
    slots,
    timetable,
    isSetupComplete,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    addMarkToCourse,
    updateMark,
    deleteMark,
    saveSlots,
    saveTimetable,
    completeSetup,
    resetSetup,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};