
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnits } from '@/contexts/UnitsContext';
import { getPriceLabel, convertPrice } from '@/utils/unitConversion';
import UnitsToggle from '@/components/UnitsToggle';

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: 'all' | 'rent' | 'sale';
  setTypeFilter: (value: 'all' | 'rent' | 'sale') => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
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
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
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
  const { t } = useTranslation();

  return (
    <Card className="mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-4">
            <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder={t('filters.forRentSale')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="rent">{t('filters.forRent')}</SelectItem>
                <SelectItem value="sale">{t('filters.forSale')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder={t('filters.propertyType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allPropertyTypes')}</SelectItem>
                <SelectItem value="Apartment">{t('filters.apartment')}</SelectItem>
                <SelectItem value="Villa">{t('filters.villa')}</SelectItem>
                <SelectItem value="Townhouse">{t('filters.townhouse')}</SelectItem>
                <SelectItem value="Studio">{t('filters.studio')}</SelectItem>
                <SelectItem value="Penthouse">{t('filters.penthouse')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder={t('filters.bedrooms')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.anyBedrooms')}</SelectItem>
                <SelectItem value="studio">{t('filters.studio')}</SelectItem>
                <SelectItem value="1">{t('filters.oneBedroom')}</SelectItem>
                <SelectItem value="2">{t('filters.twoBedrooms')}</SelectItem>
                <SelectItem value="3">{t('filters.threeBedrooms')}</SelectItem>
                <SelectItem value="4">{t('filters.fourPlusBedrooms')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={emirateFilter} onValueChange={setEmirateFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder={t('filters.emirate')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allEmirates')}</SelectItem>
                <SelectItem value="Dubai">{t('home.emirates.dubai')}</SelectItem>
                <SelectItem value="Abu Dhabi">{t('home.emirates.abuDhabi')}</SelectItem>
                <SelectItem value="Sharjah">{t('home.emirates.sharjah')}</SelectItem>
                <SelectItem value="Ajman">{t('home.emirates.ajman')}</SelectItem>
                <SelectItem value="Ras Al Khaimah">{t('home.emirates.rasAlKhaimah')}</SelectItem>
                <SelectItem value="Fujairah">{t('home.emirates.fujairah')}</SelectItem>
                <SelectItem value="Umm Al Quwain">{t('home.emirates.ummAlQuwain')}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder={`${t('filters.minPrice')} ${getPriceLabel(currency)}`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm sm:text-base"
            />

            <Input
              type="number"
              placeholder={`${t('filters.maxPrice')} ${getPriceLabel(currency)}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="text-sm sm:text-base"
            />

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
            {resultsCount} {t('filters.propertiesFound')}
          </p>
          <UnitsToggle className="hidden sm:flex" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
