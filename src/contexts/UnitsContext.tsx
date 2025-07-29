import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnitSystem, Currency } from '@/utils/unitConversion';

interface UnitsContextType {
  unitSystem: UnitSystem;
  currency: Currency;
  setUnitSystem: (system: UnitSystem) => void;
  setCurrency: (currency: Currency) => void;
  toggleUnitSystem: () => void;
  toggleCurrency: () => void;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
};

interface UnitsProviderProps {
  children: React.ReactNode;
}

export const UnitsProvider: React.FC<UnitsProviderProps> = ({ children }) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [currency, setCurrencyState] = useState<Currency>('AED');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem') as UnitSystem;
    const savedCurrency = localStorage.getItem('currency') as Currency;
    
    if (savedUnitSystem && ['metric', 'imperial'].includes(savedUnitSystem)) {
      setUnitSystemState(savedUnitSystem);
    }
    
    if (savedCurrency && ['AED', 'USD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem('unitSystem', system);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const toggleUnitSystem = () => {
    const newSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(newSystem);
  };

  const toggleCurrency = () => {
    const newCurrency = currency === 'AED' ? 'USD' : 'AED';
    setCurrency(newCurrency);
  };

  return (
    <UnitsContext.Provider value={{
      unitSystem,
      currency,
      setUnitSystem,
      setCurrency,
      toggleUnitSystem,
      toggleCurrency,
    }}>
      {children}
    </UnitsContext.Provider>
  );
};