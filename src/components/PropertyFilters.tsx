
import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useUnits } from '@/contexts/UnitsContext';
import { getPriceLabel, convertPrice } from '@/utils/unitConversion';
import UnitsToggle from '@/components/UnitsToggle';

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: 'all' | 'rent' | 'sale';
  setTypeFilter: (value: 'all' | 'rent' | 'sale') => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (value: 'grid' | 'list') => void;
  resultsCount: number;
  propertyTypeFilter: string;
  setPropertyTypeFilter: (value: string) => void;
  bedroomsFilter: string;
  setBedroomsFilter: (value: string) => void;
  emirateFilter: string;
  setEmirateFilter: (value: string) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  priceRange,
  setPriceRange,
  viewMode,
  setViewMode,
  resultsCount,
  propertyTypeFilter,
  setPropertyTypeFilter,
  bedroomsFilter,
  setBedroomsFilter,
  emirateFilter,
  setEmirateFilter
}) => {
  const { currency } = useUnits();

  // Define price ranges based on currency
  const getMaxPrice = () => {
    return currency === 'AED' ? 50000000 : 15000000; // 50M AED or 15M USD
  };

  const getMinPrice = () => {
    return 0;
  };

  const formatPriceDisplay = (price: number) => {
    if (price === 0) return '0';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };
  return (
    <Card className="mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="For Rent/Sale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select value={emirateFilter} onValueChange={setEmirateFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Emirate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emirates</SelectItem>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
                <SelectItem value="Ajman">Ajman</SelectItem>
                <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                <SelectItem value="Fujairah">Fujairah</SelectItem>
                <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range Slider */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{getPriceLabel(currency)}</span>
                  <span className="text-xs text-gray-500">
                    {currency} {formatPriceDisplay(priceRange[0])} - {formatPriceDisplay(priceRange[1])}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={getMinPrice()}
                  max={getMaxPrice()}
                  step={currency === 'AED' ? 50000 : 15000}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2 justify-center sm:justify-start">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 sm:flex-none"
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:hidden">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:hidden">List</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-600">
            {resultsCount} properties found
          </p>
          <UnitsToggle className="hidden sm:flex" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
