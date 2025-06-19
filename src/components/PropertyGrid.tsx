
import React from 'react';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types/property';

interface PropertyGridProps {
  properties: any[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onPropertyClick: (property: any) => void;
  transformProperty: (property: any) => Property;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  viewMode,
  isLoading,
  onPropertyClick,
  transformProperty
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading properties...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-gray-500 text-sm sm:text-base">No properties match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
        : 'space-y-3 sm:space-y-4'
    }>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={transformProperty(property)}
          onClick={() => onPropertyClick(property)}
          showContactButton={true}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
