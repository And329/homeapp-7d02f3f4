
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnits } from '@/contexts/UnitsContext';
import { supabase } from '@/integrations/supabase/client';
import { transformDatabaseProperty } from '@/utils/propertyTransform';
import { convertPrice } from '@/utils/unitConversion';
import { Property } from '@/types/property';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGrid from '@/components/PropertyGrid';
import PropertyStats from '@/components/PropertyStats';
import PropertyMap from '@/components/PropertyMap';
import { Button } from '@/components/ui/button';
import { Map, Grid } from 'lucide-react';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const { currency } = useUnits();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>(
    (searchParams.get('type') as 'rent' | 'sale') || 'all'
  );
  
  // Initialize price range based on currency
  const getInitialPriceRange = (): [number, number] => {
    return currency === 'AED' ? [0, 50000000] : [0, 15000000];
  };
  
  const [priceRange, setPriceRange] = useState<[number, number]>(getInitialPriceRange());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(
    searchParams.get('propertyType') || 'all'
  );
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [emirateFilter, setEmirateFilter] = useState('all');
  
  const navigate = useNavigate();

  const { data: rawProperties = [], isLoading } = useQuery({
    queryKey: ['properties', 'approved'],
    queryFn: async () => {
      console.log('Properties: Fetching approved properties from Supabase...');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Properties: Error fetching properties:', error);
        throw error;
      }
      
      console.log('Properties: Found properties:', data?.length || 0);
      return (data || []).map(transformDatabaseProperty);
    },
  });

  const properties: Property[] = rawProperties;

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    // Convert property price to current currency for comparison
    const propertyPriceInCurrentCurrency = convertPrice(property.price, 'AED', currency);
    const matchesPrice = propertyPriceInCurrentCurrency >= priceRange[0] && 
                        propertyPriceInCurrentCurrency <= priceRange[1];

    const matchesPropertyType = propertyTypeFilter === 'all' || 
      property.property_type === propertyTypeFilter;

    const matchesBedrooms = bedroomsFilter === 'all' || 
      (bedroomsFilter === 'studio' && property.bedrooms === 0) ||
      (bedroomsFilter === '4' && property.bedrooms >= 4) ||
      property.bedrooms.toString() === bedroomsFilter;

    const matchesEmirate = emirateFilter === 'all' || 
      property.location.toLowerCase().includes(emirateFilter.toLowerCase());

    return matchesSearch && matchesType && matchesPrice && matchesPropertyType && matchesBedrooms && matchesEmirate;
  });

  const transformProperty = (property: Property) => property;

  const handlePropertyClick = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  // Transform properties for map
  const mapProperties = filteredProperties.map(p => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    type: p.type,
    latitude: p.latitude || 0,
    longitude: p.longitude || 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Property</h1>
          <p className="text-gray-600">Discover amazing properties for rent and sale</p>
        </div>

        <PropertyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={filteredProperties.length}
          propertyTypeFilter={propertyTypeFilter}
          setPropertyTypeFilter={setPropertyTypeFilter}
          bedroomsFilter={bedroomsFilter}
          setBedroomsFilter={setBedroomsFilter}
          emirateFilter={emirateFilter}
          setEmirateFilter={setEmirateFilter}
        />

        <div className="mb-4 flex justify-between items-center">
          <PropertyStats properties={properties} />
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showMap ? <Grid className="h-4 w-4" /> : <Map className="h-4 w-4" />}
            {showMap ? 'Show Grid' : 'Show Map'}
          </Button>
        </div>

        {showMap ? (
          <div className="mb-8">
            <div className="h-[600px] rounded-lg overflow-hidden border">
              <PropertyMap
                properties={mapProperties}
                height="600px"
                onPropertyClick={(propertyId) => {
                  const property = filteredProperties.find(p => p.id === propertyId.toString());
                  if (property) {
                    handlePropertyClick(property);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <PropertyGrid
            properties={filteredProperties}
            viewMode={viewMode}
            isLoading={isLoading}
            onPropertyClick={handlePropertyClick}
            transformProperty={transformProperty}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
