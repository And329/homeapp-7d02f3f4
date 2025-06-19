
import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: 'all' | 'rent' | 'sale';
  setTypeFilter: (value: 'all' | 'rent' | 'sale') => void;
  priceRange: 'all' | 'low' | 'mid' | 'high';
  setPriceRange: (value: 'all' | 'low' | 'mid' | 'high') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (value: 'grid' | 'list') => void;
  resultsCount: number;
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
  resultsCount
}) => {
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
          
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
            <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
              <SelectTrigger className="text-sm sm:text-base sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={(value: 'all' | 'low' | 'mid' | 'high') => setPriceRange(value)}>
              <SelectTrigger className="text-sm sm:text-base sm:w-40">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under $100K</SelectItem>
                <SelectItem value="mid">$100K - $500K</SelectItem>
                <SelectItem value="high">$500K+</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 sm:gap-2 col-span-2 sm:col-span-1 justify-center sm:justify-start">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
