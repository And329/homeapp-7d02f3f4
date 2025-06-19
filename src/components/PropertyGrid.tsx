
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading properties...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No properties match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
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
