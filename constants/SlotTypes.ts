import { SlotType } from '@/types/Slot';

export const SLOT_TYPE_CONFIG = {
  [SlotType.COURSE]: {
    label: 'Period',
    icon: '📚',
    color: '#3B82F6',
    isBreak: false,
    canBeEdited: true,
  },
  [SlotType.SHORT_BREAK]: {
    label: 'Short Break',
    icon: '☕',
    color: '#6B7280',
    isBreak: true,
    canBeEdited: false,
  },
  [SlotType.LUNCH_BREAK]: {
    label: 'Lunch Break',
    icon: '🍴',
    color: '#F59E0B',
    isBreak: true,
    canBeEdited: false,
  },
  [SlotType.LIBRARY]: {
    label: 'Library',
    icon: '📖',
    color: '#10B981',
    isBreak: false,
    canBeEdited: true,
  },
  [SlotType.MENTOR]: {
    label: 'Mentor',
    icon: '👨‍🏫',
    color: '#8B5CF6',
    isBreak: false,
    canBeEdited: true,
  },
  [SlotType.FREE]: {
    label: 'Free',
    icon: '😌',
    color: '#9CA3AF',
    isBreak: false,
    canBeEdited: true,
  },
} as const;

export const NON_COURSE_TYPES = [
  SlotType.LIBRARY,
  SlotType.MENTOR,
  SlotType.FREE,
];

export const BREAK_TYPES = [
  SlotType.SHORT_BREAK,
  SlotType.LUNCH_BREAK,
];

export const EDITABLE_TYPES = [
  SlotType.COURSE,
  SlotType.LIBRARY,
  SlotType.MENTOR,
  SlotType.FREE,
];