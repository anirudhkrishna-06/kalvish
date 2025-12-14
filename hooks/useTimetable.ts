import { useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrentDay, getDayFromDate } from '@/lib/dateUtils';
import { Day } from '@/types/Timetable';
import { SlotType } from '@/types/Slot';

export function useTimetable() {
  const { slots, courses, timetable } = useApp();

  const getTodaysTimetable = useCallback(() => {
    const today = getCurrentDay();
    const dayTimetable = timetable.find(t => t.day === today);
    
    if (!dayTimetable || !slots.length) {
      return [];
    }

    return slots.map(slot => {
      const assignment = dayTimetable.slotAssignments.find(a => a.slotId === slot.id);
      
      let assignmentData;
      if (assignment?.type === SlotType.COURSE && assignment.courseId) {
        const course = courses.find(c => c.id === assignment.courseId);
        assignmentData = {
          type: SlotType.COURSE,
          course,
        };
      } else if (assignment?.type && [SlotType.LIBRARY, SlotType.MENTOR, SlotType.FREE].includes(assignment.type)) {
        assignmentData = {
          type: assignment.type,
          label: assignment.label,
        };
      }

      return {
        ...slot,
        assignment: assignmentData,
      };
    });
  }, [slots, courses, timetable]);

  const getDayTimetable = useCallback((day: Day) => {
    const dayTimetable = timetable.find(t => t.day === day);
    
    if (!dayTimetable || !slots.length) {
      return [];
    }

    return slots.map(slot => {
      const assignment = dayTimetable.slotAssignments.find(a => a.slotId === slot.id);
      
      let assignmentData;
      if (assignment?.type === SlotType.COURSE && assignment.courseId) {
        const course = courses.find(c => c.id === assignment.courseId);
        assignmentData = {
          type: SlotType.COURSE,
          course,
        };
      } else if (assignment?.type && [SlotType.LIBRARY, SlotType.MENTOR, SlotType.FREE].includes(assignment.type)) {
        assignmentData = {
          type: assignment.type,
          label: assignment.label,
        };
      }

      return {
        ...slot,
        assignment: assignmentData,
      };
    });
  }, [slots, courses, timetable]);

  const getCurrentSlotIndex = useCallback(() => {
    const todaySlots = getTodaysTimetable();
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    for (let i = 0; i < todaySlots.length; i++) {
      const slot = todaySlots[i];
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes) {
        return i;
      }
    }
    
    return -1;
  }, [getTodaysTimetable]);

  const getNextUpcomingSlot = useCallback(() => {
    const todaySlots = getTodaysTimetable();
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    for (let i = 0; i < todaySlots.length; i++) {
      const slot = todaySlots[i];
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      
      if (startTotalMinutes > currentTotalMinutes) {
        return {
          slot,
          index: i,
          minutesUntil: startTotalMinutes - currentTotalMinutes,
        };
      }
    }
    
    return null;
  }, [getTodaysTimetable]);

  const isWeekend = useCallback(() => {
    const dayIndex = new Date().getDay();
    return dayIndex === 0 || dayIndex === 6; // Sunday or Saturday
  }, []);

  return {
    getTodaysTimetable,
    getDayTimetable,
    getCurrentSlotIndex,
    getNextUpcomingSlot,
    isWeekend,
  };
}