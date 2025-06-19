
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { transformDatabaseProperty } from '@/utils/propertyTransform';
import { Property } from '@/types/property';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGrid from '@/components/PropertyGrid';
import PropertyStats from '@/components/PropertyStats';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformDatabaseProperty);
    },
  });

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'low' && property.price < 100000) ||
      (priceRange === 'mid' && property.price >= 100000 && property.price < 500000) ||
      (priceRange === 'high' && property.price >= 500000);

    return matchesSearch && matchesType && matchesPrice;
  });

  const transformProperty = (property: Property) => ({
    id: property.id,
    title: property.title || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Location not specified',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 1000,
    image: property.images && property.images.length > 0 
      ? property.images[0] 
      : '/placeholder.svg',
    images: property.images || ['/placeholder.svg'],
    type: property.type || 'rent',
    isHotDeal: property.isHotDeal || false,
    description: property.description || '',
    amenities: property.amenities || [],
    coordinates: property.coordinates || { lat: 0, lng: 0 },
    propertyType: property.propertyType || 'Apartment',
    owner_id: property.owner_id
  });

  const handlePropertyClick = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

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
        />

        <div className="mb-4 flex justify-end">
          <PropertyStats properties={properties} />
        </div>

        <PropertyGrid
          properties={filteredProperties}
          viewMode={viewMode}
          isLoading={isLoading}
          onPropertyClick={handlePropertyClick}
          transformProperty={transformProperty}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
