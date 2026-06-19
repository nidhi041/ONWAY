import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATIONS = [
  'Salasar',
  'Khatushyam',
  'Sanwariya Seth',
  'Ujjain',
  'Vrindavan'
];

interface LocationContextType {
  location: string | null;
  setLocation: (loc: string) => Promise<void>;
  isLoadingLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem('@store_location');
      if (storedLocation) {
        setLocationState(storedLocation);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const setLocation = async (loc: string) => {
    try {
      await AsyncStorage.setItem('@store_location', loc);
      setLocationState(loc);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoadingLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
