
// Re-export everything from the new API module for backward compatibility
export type { Property } from '@/types/property';
export { 
  getProperties, 
  getPropertyById, 
  getPropertiesByType, 
  getHotDeals 
} from '@/api/properties';
