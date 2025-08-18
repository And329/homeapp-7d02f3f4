// Unit and currency conversion utilities

export type UnitSystem = 'metric' | 'imperial';
export type Currency = 'AED' | 'USD';

// Conversion rates (you can update these based on current exchange rates)
const AED_TO_USD_RATE = 0.27; // 1 AED = 0.27 USD (approximate)
const USD_TO_AED_RATE = 3.67; // 1 USD = 3.67 AED (approximate)

// Area conversion: 1 square meter = 10.764 square feet
const M2_TO_SQ_FT = 10.764;

export const convertArea = (area: number, fromUnit: UnitSystem, toUnit: UnitSystem): number => {
  if (fromUnit === toUnit) return area;
  
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return Math.round(area * M2_TO_SQ_FT);
  } else if (fromUnit === 'imperial' && toUnit === 'metric') {
    return Math.round(area / M2_TO_SQ_FT);
  }
  
  return area;
};

export const convertPrice = (price: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return price;
  
  if (fromCurrency === 'AED' && toCurrency === 'USD') {
    return Math.round(price * AED_TO_USD_RATE);
  } else if (fromCurrency === 'USD' && toCurrency === 'AED') {
    return Math.round(price * USD_TO_AED_RATE);
  }
  
  return price;
};

export const formatArea = (area: number, unitSystem: UnitSystem): string => {
  const unit = unitSystem === 'metric' ? 'm²' : 'sq ft';
  return `${area.toLocaleString()} ${unit}`;
};

export const formatPrice = (price: number, currency: Currency, type?: string): string => {
  const currencySymbol = currency === 'AED' ? 'AED' : '$';
  const formattedPrice = `${currencySymbol} ${price.toLocaleString()}`;
  
  if (type === 'rent') {
    return `${formattedPrice}/year`;
  }
  
  return formattedPrice;
};

export const getAreaLabel = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'Area (m²)' : 'Area (sq ft)';
};

export const getPriceLabel = (currency: Currency): string => {
  return currency === 'AED' ? 'Price (AED)' : 'Price (USD)';
};