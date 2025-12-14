import { useEffect, useState } from 'react';
import { Storage } from '@/lib/storage';

export function useAppSetup() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const setupComplete = await Storage.isSetupComplete();
      setIsSetupComplete(setupComplete);
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isSetupComplete, isLoading, checkSetup };
}