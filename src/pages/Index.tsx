
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, TrendingUp, Users, Award, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { getHotDeals } from '../data/properties';

const Index = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('');
  const [searchListingType, setSearchListingType] = useState('');

  const { data: hotDeals = [], isLoading } = useQuery({
    queryKey: ['hotDeals'],
    queryFn: getHotDeals,
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (searchLocation.trim()) {
      searchParams.set('search', searchLocation.trim());
    }
    if (searchPropertyType && searchPropertyType !== 'Property Type' && searchPropertyType !== '') {
      searchParams.set('propertyType', searchPropertyType);
    }
    if (searchListingType && searchListingType !== 'For Rent / Sale' && searchListingType !== '') {
      if (searchListingType === 'For Rent') {
        searchParams.set('type', 'rent');
      } else if (searchListingType === 'For Sale') {
        searchParams.set('type', 'sale');
      }
    }

    navigate(`/properties${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePropertyClick = (property: any) => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="uae-gradient text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              Welcome to <span className="text-blue-200">HomeApp</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto animate-fade-in-up">
              Your premier destination for UAE real estate. Discover luxury properties, 
              investment opportunities, and your dream home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link 
                to="/properties" 
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Explore Properties
              </Link>
              <Link 
                to="/contact" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Find Your Perfect Property</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <select 
                  value={searchPropertyType}
                  onChange={(e) => setSearchPropertyType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Property Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
              <div>
                <select 
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">For Rent / Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="For Sale">For Sale</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">🔥 Hot Deals</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these exclusive property offers with special pricing and premium locations
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hot deals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotDeals.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={() => handlePropertyClick(property)}
                  showContactButton={true}
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              to="/properties" 
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              View All Properties
              <TrendingUp className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HomeApp?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner in UAE real estate with unmatched expertise and service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">Access to the most sought-after properties in Dubai, Abu Dhabi, and across the UAE</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Expertise</h3>
              <p className="text-gray-600">Deep understanding of UAE property market trends and investment opportunities</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
              <p className="text-gray-600">RERA-licensed professionals ensuring transparent and secure transactions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 uae-gradient-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore HomeApp</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed real estate decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/properties" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Property Map</h3>
              <p className="text-gray-600">Interactive map of all available properties</p>
            </Link>
            
            <Link 
              to="/blog" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Expert Blog</h3>
              <p className="text-gray-600">Real estate tips and market insights</p>
            </Link>
            
            <Link 
              to="/news" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Market News</h3>
              <p className="text-gray-600">Latest UAE real estate updates</p>
            </Link>
            
            <Link 
              to="/contact" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Expert Help</h3>
              <p className="text-gray-600">Speak with our property consultants</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
