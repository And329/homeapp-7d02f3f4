import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Calendar, Car, Heart, Share2, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyMap from '../components/PropertyMap';
import ContactPropertyOwner from '../components/ContactPropertyOwner';
import { getPropertyById } from '../data/properties';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PropertyDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const { user } = useAuth();

  console.log('PropertyDetails: Component mounted with ID:', id);
  console.log('PropertyDetails: Current user:', user);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => {
      console.log('PropertyDetails: Fetching property with ID:', id);
      return getPropertyById(id || '');
    },
    enabled: !!id,
  });

  console.log('PropertyDetails: Property data:', property);
  console.log('PropertyDetails: Loading state:', isLoading);
  console.log('PropertyDetails: Error state:', error);

  // Get property owner profile for contact information
  const { data: ownerProfile, isLoading: ownerLoading } = useQuery({
    queryKey: ['property-owner', property?.owner_id],
    queryFn: async () => {
      if (!property?.owner_id) {
        console.log('PropertyDetails: No owner_id found for property');
        return null;
      }
      
      console.log('PropertyDetails: Fetching owner profile for ID:', property.owner_id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_picture')
        .eq('id', property.owner_id)
        .single();

      if (error) {
        console.error('PropertyDetails: Error fetching owner profile:', error);
        // Return a minimal profile object even if the query fails
        return {
          id: property.owner_id,
          full_name: null,
          email: null,
          profile_picture: null
        };
      }
      
      console.log('PropertyDetails: Owner profile data:', data);
      return data;
    },
    enabled: !!property?.owner_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('PropertyDetails: Error loading property:', error);
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Error loading property: {error.message}</p>
            <button 
              onClick={() => window.location.href = '/properties'}
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
            >
              Back to Properties
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    console.log('PropertyDetails: No property found, redirecting to properties page');
    return <Navigate to="/properties" replace />;
  }

  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  // Parse coordinates from property data
  const getCoordinates = () => {
    console.log('PropertyDetails: Parsing coordinates for property:', property);
    console.log('PropertyDetails: Property coordinates:', property.coordinates);
    console.log('PropertyDetails: Property location:', property.location);
    
    // Check if coordinates exist as an object with lat/lng
    if (property.coordinates?.lat && property.coordinates?.lng) {
      console.log('PropertyDetails: Using coordinates object:', property.coordinates);
      return {
        lat: property.coordinates.lat,
        lng: property.coordinates.lng
      };
    }
    
    // Try to parse from location string if it contains coordinates
    if (property.location && typeof property.location === 'string') {
      // Check if location is a coordinate string like "25.2048, 55.2708"
      const coordMatch = property.location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log('PropertyDetails: Parsed coordinates from location string:', { lat, lng });
          return { lat, lng };
        }
      }
    }
    
    console.log('PropertyDetails: No valid coordinates found');
    return null;
  };

  const coords = getCoordinates();

  // Prepare property data for the map
  const mapProperties = coords ? [{
    id: parseInt(property.id),
    title: property.title,
    location: property.location,
    price: property.price,
    type: property.type,
    latitude: coords.lat,
    longitude: coords.lng,
  }] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Image Gallery */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3">
            <img
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
            />
          </div>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
            {property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 lg:w-full lg:h-24 object-cover rounded-lg cursor-pointer flex-shrink-0 ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(property.price, property.type)}
                </div>
                <div className="bg-primary text-white px-4 py-2 rounded-full font-semibold">
                  For {property.type === 'rent' ? 'Rent' : 'Sale'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{property.area}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Car className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{property.parking || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Property Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-semibold">{property.propertyType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Year Built</span>
                  <span className="font-semibold">{property.yearBuilt || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Area</span>
                  <span className="font-semibold">{property.area} sq ft</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Parking Spaces</span>
                  <span className="font-semibold">{property.parking || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              {coords ? (
                <PropertyMap
                  properties={mapProperties}
                  selectedPropertyId={parseInt(property.id)}
                  height="400px"
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Location coordinates not available</p>
                    <p className="text-sm text-gray-500">{property.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            {user && property.owner_id ? (
              property.owner_id === user.id ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-xl font-semibold mb-4">Your Property</h3>
                  <p className="text-gray-600">This is your own property listing.</p>
                </div>
              ) : (
                <ContactPropertyOwner
                  propertyId={parseInt(property.id)}
                  ownerId={property.owner_id}
                  propertyTitle={property.title}
                  contactName={ownerProfile?.full_name || 'Property Owner'}
                  contactEmail={ownerProfile?.email || ''}
                  ownerProfilePicture={ownerProfile?.profile_picture}
                />
              )
            ) : !user ? (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Interested in this property?</h3>
                <p className="text-gray-600 mb-4">Please sign in to contact the property owner.</p>
                <button 
                  onClick={() => window.location.href = '/auth'}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sign In to Message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <p className="text-gray-600">No owner information available for this property.</p>
                <p className="text-sm text-gray-500 mt-2">Property owner ID: {property.owner_id || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
