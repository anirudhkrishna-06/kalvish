import uuid from 'react-native-uuid';
export const generateId = (): string => {
  return uuid.v4().toString();
};

export const generateSlots = (): any[] => {
  // Default slots (will be overwritten by user)
  return Array.from({ length: 8 }, (_, i) => ({
    id: generateId(),
    index: i + 1,
    name: `Period ${i + 1}`,
    type: 'COURSE',
    startTime: '09:00',
    endTime: '09:50',
    isBreak: false,
  }));
};