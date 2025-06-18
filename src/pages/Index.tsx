
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Award, Users, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { getHotDeals } from '../data/properties';

const Index = () => {
  const hotDeals = getHotDeals();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 uae-gradient opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <img 
          src="https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=1920&h=1080&fit=crop" 
          alt="Dubai Skyline" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Find Your Dream Home in the UAE
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up opacity-90">
            Discover luxury properties, exclusive deals, and exceptional service with HomeApp
          </p>
          
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl mx-auto animate-scale-in">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Location, property type, or keywords..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                />
              </div>
              <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search Properties
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
            <Link 
              to="/properties/rent" 
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Rentals
            </Link>
            <Link 
              to="/properties/sale" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Properties for Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🔥 Hot Deals</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Exclusive properties with special offers and unbeatable prices. Limited time only!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotDeals.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/properties" 
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View All Hot Deals
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
                <TrendingUp className="h-8 w-8" />
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

      {/* Quick Access Section */}
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
