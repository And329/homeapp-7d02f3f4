
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Map, List, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../data/properties';

const Properties = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'rent' | 'sale',
    priceMin: '',
    priceMax: '',
    bedrooms: 'all' as 'all' | '0' | '1' | '2' | '3' | '4' | '5+',
    location: '',
    propertyType: 'all' as 'all' | 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse' | 'Studio'
  });

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (filters.type !== 'all' && property.type !== filters.type) return false;
      if (filters.priceMin && property.price < parseInt(filters.priceMin)) return false;
      if (filters.priceMax && property.price > parseInt(filters.priceMax)) return false;
      if (filters.bedrooms !== 'all') {
        if (filters.bedrooms === '5+' && property.bedrooms < 5) return false;
        if (filters.bedrooms !== '5+' && property.bedrooms !== parseInt(filters.bedrooms)) return false;
      }
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.propertyType !== 'all' && property.propertyType !== filters.propertyType) return false;
      return true;
    });
  }, [properties, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Error loading properties. Please try again later.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">UAE Properties</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover your perfect property from our extensive collection across the UAE
            </p>
          </div>
        </div>
      </section>

      {/* Quick Filter Tabs */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/properties" 
              className={`px-6 py-2 rounded-full transition-colors ${
                filters.type === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('type', 'all')}
            >
              All Properties
            </Link>
            <Link 
              to="/properties/rent" 
              className={`px-6 py-2 rounded-full transition-colors ${
                filters.type === 'rent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('type', 'rent')}
            >
              For Rent
            </Link>
            <Link 
              to="/properties/sale" 
              className={`px-6 py-2 rounded-full transition-colors ${
                filters.type === 'sale' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('type', 'sale')}
            >
              For Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Search location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Any</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (AED)</label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (AED)</label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Search className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredProperties.length} properties found
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Map className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Interactive Map View</h3>
              <p className="text-gray-600 mb-4">
                Map integration coming soon! View all properties with interactive pins and detailed popups.
              </p>
              <button
                onClick={() => setViewMode('grid')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Switch to Grid View
              </button>
            </div>
          )}

          {filteredProperties.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
