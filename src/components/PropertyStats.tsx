
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: number;
  is_hot_deal: boolean;
  type: 'rent' | 'sale';
}

interface PropertyStatsProps {
  properties: Property[];
}

const PropertyStats: React.FC<PropertyStatsProps> = ({ properties }) => {
  return (
    <div className="flex gap-2">
      <Badge variant="secondary">
        {properties.filter(p => p.is_hot_deal).length} Hot Deals
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
