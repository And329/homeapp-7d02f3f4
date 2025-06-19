
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Filter, Grid, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
  owner_id: string | null;
}

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
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
    id: property.id.toString(),
    title: property.title || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Location not specified',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: 1000, // Default area since it's not in the database
    image: Array.isArray(property.images) && property.images.length > 0 
      ? property.images[0] 
      : '/placeholder.svg',
    images: Array.isArray(property.images) ? property.images : ['/placeholder.svg'],
    type: property.type || 'rent',
    isHotDeal: property.is_hot_deal || false,
    description: property.description || '',
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    coordinates: {
      lat: property.latitude || 0,
      lng: property.longitude || 0
    },
    propertyType: 'Apartment',
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

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={(value: 'all' | 'rent' | 'sale') => setTypeFilter(value)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={(value: 'all' | 'low' | 'mid' | 'high') => setPriceRange(value)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $100K</SelectItem>
                  <SelectItem value="mid">$100K - $500K</SelectItem>
                  <SelectItem value="high">$500K+</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProperties.length} properties found
              </p>
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
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No properties match your search criteria.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={transformProperty(property)}
                onClick={() => handlePropertyClick(property)}
                showContactButton={true}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
