import React from 'react';
import { Ruler, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnits } from '@/contexts/UnitsContext';

interface UnitsToggleProps {
  className?: string;
}

const UnitsToggle: React.FC<UnitsToggleProps> = ({ className = '' }) => {
  const { unitSystem, currency, toggleUnitSystem, toggleCurrency } = useUnits();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleUnitSystem}
        className="flex items-center gap-1"
      >
        <Ruler className="h-3 w-3" />
        <Badge variant={unitSystem === 'metric' ? 'default' : 'secondary'} className="text-xs">
          {unitSystem === 'metric' ? 'm²' : 'sq ft'}
        </Badge>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleCurrency}
        className="flex items-center gap-1"
      >
        <DollarSign className="h-3 w-3" />
        <Badge variant={currency === 'AED' ? 'default' : 'secondary'} className="text-xs">
          {currency}
        </Badge>
      </Button>
    </div>
  );
};

export default UnitsToggle;