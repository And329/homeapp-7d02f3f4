
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';

interface PropertyStatsProps {
  properties: Property[];
}

const PropertyStats: React.FC<PropertyStatsProps> = ({ properties }) => {
  return (
    <div className="flex gap-2">
      <Badge variant="secondary">
        {properties.filter(p => p.isHotDeal).length} Hot Deals
      </Badge>
      <Badge variant="outline">
        {properties.filter(p => p.type === 'rent').length} For Rent
      </Badge>
      <Badge variant="outline">
        {properties.filter(p => p.type === 'sale').length} For Sale
      </Badge>
    </div>
  );
};

export default PropertyStats;
