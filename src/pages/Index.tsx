
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, TrendingUp, Users, Award, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { getHotDeals } from '../data/properties';
import heroBackground from '../assets/hero-background.jpg';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchPropertyType, setSearchPropertyType] = useState('');
  const [searchListingType, setSearchListingType] = useState('');
  const [searchBedrooms, setSearchBedrooms] = useState('');
  const [searchEmirate, setSearchEmirate] = useState('');

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
    if (searchBedrooms && searchBedrooms !== 'Bedrooms' && searchBedrooms !== '') {
      searchParams.set('bedrooms', searchBedrooms);
    }
    if (searchEmirate && searchEmirate !== 'Emirate' && searchEmirate !== '') {
      searchParams.set('emirate', searchEmirate);
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
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up drop-shadow-lg">
              {t('home.hero.title')} <span className="text-blue-200">HomeApp</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto animate-fade-in-up drop-shadow-lg">
              {t('home.hero.subtitle')}
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-2xl mx-auto animate-fade-in-up border border-white/20">
              <p className="text-lg font-semibold text-blue-100 drop-shadow-lg">
                {t('home.hero.freeListingNotice')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link 
                to="/properties" 
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {t('home.hero.exploreProperties')}
              </Link>
              <Link 
                to="/list-property" 
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors shadow-lg"
              >
                {t('home.hero.listPropertyFree')}
              </Link>
              <Link 
                to="/contact" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors backdrop-blur-sm"
              >
                {t('home.hero.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">{t('home.search.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <input
                  type="text"
                  placeholder={t('home.search.location')}
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
                  <option value="">{t('home.search.propertyType')}</option>
                  <option value="Apartment">{t('home.search.apartment')}</option>
                  <option value="Villa">{t('home.search.villa')}</option>
                  <option value="Townhouse">{t('home.search.townhouse')}</option>
                  <option value="Studio">{t('home.search.studio')}</option>
                  <option value="Penthouse">{t('home.search.penthouse')}</option>
                </select>
              </div>
              <div>
                <select 
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('home.search.forRentSale')}</option>
                  <option value="For Rent">{t('home.search.forRent')}</option>
                  <option value="For Sale">{t('home.search.forSale')}</option>
                </select>
              </div>
              <div>
                <select 
                  value={searchBedrooms}
                  onChange={(e) => setSearchBedrooms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('home.search.bedrooms')}</option>
                  <option value="studio">{t('home.search.studio')}</option>
                  <option value="1">{t('home.search.oneBedroom')}</option>
                  <option value="2">{t('home.search.twoBedrooms')}</option>
                  <option value="3">{t('home.search.threeBedrooms')}</option>
                  <option value="4">{t('home.search.fourPlusBedrooms')}</option>
                </select>
              </div>
              <div>
                <select 
                  value={searchEmirate}
                  onChange={(e) => setSearchEmirate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('home.search.emirate')}</option>
                  <option value="Dubai">{t('home.emirates.dubai')}</option>
                  <option value="Abu Dhabi">{t('home.emirates.abuDhabi')}</option>
                  <option value="Sharjah">{t('home.emirates.sharjah')}</option>
                  <option value="Ajman">{t('home.emirates.ajman')}</option>
                  <option value="Ras Al Khaimah">{t('home.emirates.rasAlKhaimah')}</option>
                  <option value="Fujairah">{t('home.emirates.fujairah')}</option>
                  <option value="Umm Al Quwain">{t('home.emirates.ummAlQuwain')}</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                {t('home.search.search')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('home.hotDeals.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.hotDeals.subtitle')}
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('home.hotDeals.loading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotDeals.map((property) => (
                <div key={property.id} onClick={() => handlePropertyClick(property)} className="cursor-pointer">
                  <PropertyCard 
                    property={property} 
                    onClick={() => handlePropertyClick(property)}
                    showContactButton={true}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              to="/properties" 
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              {t('home.hotDeals.viewAll')}
              <TrendingUp className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.primeLocations.title')}</h3>
              <p className="text-gray-600">{t('home.features.primeLocations.description')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.marketExpertise.title')}</h3>
              <p className="text-gray-600">{t('home.features.marketExpertise.description')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.features.trustedService.title')}</h3>
              <p className="text-gray-600">{t('home.features.trustedService.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 uae-gradient-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.explore.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.explore.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/properties" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('home.explore.propertyMap.title')}</h3>
              <p className="text-gray-600">{t('home.explore.propertyMap.description')}</p>
            </Link>
            
            <Link 
              to="/blog" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('home.explore.expertBlog.title')}</h3>
              <p className="text-gray-600">{t('home.explore.expertBlog.description')}</p>
            </Link>
            
            <Link 
              to="/news" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('home.explore.marketNews.title')}</h3>
              <p className="text-gray-600">{t('home.explore.marketNews.description')}</p>
            </Link>
            
            <Link 
              to="/contact" 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('home.explore.expertHelp.title')}</h3>
              <p className="text-gray-600">{t('home.explore.expertHelp.description')}</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
